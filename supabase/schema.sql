-- =============================================================================
-- 태권도장 플랫폼 — 초기 스키마 + RLS
-- Supabase SQL Editor에서 이 파일 전체를 한 번 실행하세요.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 헬퍼: 현재 로그인 사용자가 해당 도장 소속 직원인지 확인
-- SECURITY DEFINER + search_path 고정: profiles RLS에 가로막히지 않고,
-- search_path 변조로 다른 함수를 타지 않게 한다.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_dojang_staff(target_dojang_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.dojang_id = target_dojang_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_dojang_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_dojang_staff(uuid) TO anon, authenticated;

-- =============================================================================
-- 테이블
-- =============================================================================

-- 도장(체육관) 마스터. slug는 공개 랜딩 URL에 사용한다.
CREATE TABLE IF NOT EXISTS public.dojangs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  region text,
  address text,
  phone text,
  description text,
  logo_url text,
  hero_image_url text,
  brand_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dojangs_slug_format_chk
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

COMMENT ON TABLE public.dojangs IS '체육관 마스터. 공개 랜딩페이지의 데이터 소스.';

-- auth.users 1:1 확장. id는 반드시 본인 auth.uid()와 같다.
-- dojang_id는 가입 직후 도장 INSERT 다음에 채워지므로 NULL을 허용한다.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  dojang_id uuid REFERENCES public.dojangs (id) ON DELETE SET NULL,
  name text NOT NULL,
  role text NOT NULL,
  CONSTRAINT profiles_role_chk CHECK (role IN ('OWNER', 'INSTRUCTOR'))
);

COMMENT ON TABLE public.profiles IS 'auth.users 확장 프로필. OWNER/INSTRUCTOR만 허용.';

CREATE INDEX IF NOT EXISTS profiles_dojang_id_idx ON public.profiles (dojang_id);

-- 인스타/포스터용 홍보 템플릿. 랜딩 공개 데이터가 아니라 직원 작업물.
CREATE TABLE IF NOT EXISTS public.promo_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojang_id uuid NOT NULL REFERENCES public.dojangs (id) ON DELETE CASCADE,
  type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_templates_type_chk
    CHECK (type IN ('AWARD', 'BELT_UP', 'RECRUIT', 'EVENT'))
);

COMMENT ON TABLE public.promo_templates IS '홍보 카드뉴스/포스터 템플릿. 소속 직원만 접근.';

CREATE INDEX IF NOT EXISTS promo_templates_dojang_id_idx
  ON public.promo_templates (dojang_id);

-- 학부모 입관 체험 신청. INSERT는 비로그인 허용, 조회/처리는 직원만.
CREATE TABLE IF NOT EXISTS public.trial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dojang_id uuid NOT NULL REFERENCES public.dojangs (id) ON DELETE CASCADE,
  student_name text NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  desired_class text,
  memo text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trial_requests_desired_class_chk
    CHECK (
      desired_class IS NULL
      OR desired_class IN ('KIDS', 'ELEMENTARY', 'MIDDLE_HIGH', 'ADULT')
    ),
  CONSTRAINT trial_requests_status_chk
    CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED'))
);

COMMENT ON TABLE public.trial_requests IS '입관 체험 신청. 학부모 INSERT / 직원 SELECT·UPDATE.';

CREATE INDEX IF NOT EXISTS trial_requests_dojang_id_idx
  ON public.trial_requests (dojang_id);

CREATE INDEX IF NOT EXISTS trial_requests_created_at_idx
  ON public.trial_requests (created_at DESC);

-- =============================================================================
-- RLS 활성화
-- =============================================================================
ALTER TABLE public.dojangs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_requests ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- dojangs 정책
-- =============================================================================

DROP POLICY IF EXISTS dojangs_select_public ON public.dojangs;
-- 공개 랜딩페이지(/[slug])는 로그인 없이 도장 정보를 읽어야 한다.
CREATE POLICY dojangs_select_public
  ON public.dojangs
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS dojangs_insert_authenticated ON public.dojangs;
-- 신규 관장 가입 시 아직 profiles.dojang_id가 없다.
-- 그래서 INSERT는 "로그인한 사용자"에게 열고, UPDATE만 소속 직원으로 제한한다.
-- (INSERT까지 소속 직원 조건이면 첫 도장 생성이 영원히 불가능하다.)
CREATE POLICY dojangs_insert_authenticated
  ON public.dojangs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS dojangs_update_staff ON public.dojangs;
-- 로고/소개/연락처 등 도장 정보는 소속 직원만 수정한다.
-- USING: 기존 행이 본인 소속인지. WITH CHECK: 수정 후에도 소속이 유지되는지.
CREATE POLICY dojangs_update_staff
  ON public.dojangs
  FOR UPDATE
  TO authenticated
  USING (public.is_dojang_staff(id))
  WITH CHECK (public.is_dojang_staff(id));

-- =============================================================================
-- profiles 정책
-- =============================================================================

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
-- 프로필에는 이름·역할·소속 도장이 들어 있으므로 본인 행만 읽는다.
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
-- 회원가입 직후 본인 프로필을 만들기 위해 필요하다. 타인 id로 INSERT는 불가.
CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
-- 이름 등 본인 정보만 수정. 타인 프로필로 바꿔 치기(WITH CHECK)도 막는다.
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- promo_templates 정책
-- =============================================================================

DROP POLICY IF EXISTS promo_templates_select_staff ON public.promo_templates;
-- 템플릿은 랜딩 공개 데이터가 아니라 관장/강사 작업물이므로 소속 직원만 조회.
CREATE POLICY promo_templates_select_staff
  ON public.promo_templates
  FOR SELECT
  TO authenticated
  USING (public.is_dojang_staff(dojang_id));

DROP POLICY IF EXISTS promo_templates_insert_staff ON public.promo_templates;
-- 다른 도장 id로 템플릿을 심는 것을 막기 위해 WITH CHECK로 소속을 검증한다.
CREATE POLICY promo_templates_insert_staff
  ON public.promo_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_dojang_staff(dojang_id));

DROP POLICY IF EXISTS promo_templates_update_staff ON public.promo_templates;
-- 편집은 소속 직원만. dojang_id를 다른 도장으로 옮기는 것도 차단한다.
CREATE POLICY promo_templates_update_staff
  ON public.promo_templates
  FOR UPDATE
  TO authenticated
  USING (public.is_dojang_staff(dojang_id))
  WITH CHECK (public.is_dojang_staff(dojang_id));

DROP POLICY IF EXISTS promo_templates_delete_staff ON public.promo_templates;
-- 삭제도 소속 직원만. 타 도장 템플릿을 지울 수 없다.
CREATE POLICY promo_templates_delete_staff
  ON public.promo_templates
  FOR DELETE
  TO authenticated
  USING (public.is_dojang_staff(dojang_id));

-- =============================================================================
-- trial_requests 정책
-- =============================================================================

DROP POLICY IF EXISTS trial_requests_insert_public ON public.trial_requests;
-- 학부모는 로그인 없이 체험 신청한다. dojang_id만 있으면 되고(FK로 존재 검증),
-- status는 PENDING만 허용해 신청자가 CONFIRMED로 위조하지 못하게 한다.
CREATE POLICY trial_requests_insert_public
  ON public.trial_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    dojang_id IS NOT NULL
    AND status = 'PENDING'
  );

DROP POLICY IF EXISTS trial_requests_select_staff ON public.trial_requests;
-- 신청 목록에는 학부모 연락처가 있으므로 해당 도장 직원만 조회한다.
CREATE POLICY trial_requests_select_staff
  ON public.trial_requests
  FOR SELECT
  TO authenticated
  USING (public.is_dojang_staff(dojang_id));

DROP POLICY IF EXISTS trial_requests_update_staff ON public.trial_requests;
-- 접수/거절 등 상태 변경은 소속 직원만. 다른 도장으로 신청을 옮기지 못하게 한다.
CREATE POLICY trial_requests_update_staff
  ON public.trial_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_dojang_staff(dojang_id))
  WITH CHECK (public.is_dojang_staff(dojang_id));

-- =============================================================================
-- Realtime: 관장 대시보드에서 새 체험 신청을 구독하기 위함
-- =============================================================================
ALTER TABLE public.trial_requests REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'trial_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trial_requests;
  END IF;
END $$;
