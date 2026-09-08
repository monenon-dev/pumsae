# PUMSAE — 개발 가이드 v3 (Vercel + Railway + Neon + R2)

> v2(Supabase 올인원)는 폐기. 이 문서로 진행합니다. 기능 스펙(랜딩페이지 빌더 / 템플릿 생성기 / 체험신청+실시간알림)은 동일합니다.

관련 문서: [목차](./README.md) · [프로젝트 개요](./프로젝트.md) · [데이터 ERD](./erd.md)

## 0. 확정 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| Frontend | Next.js 14 (App Router), Vercel 배포 | Supabase 클라이언트 제거, REST API로 백엔드 호출 |
| Backend | FastAPI, Railway 배포 | Moneo와 동일한 패턴 |
| DB | Neon (Serverless Postgres) + SQLAlchemy + Alembic | RLS 대신 애플리케이션 레벨 권한 검사 |
| 인증 | 자체 JWT (access는 메모리, refresh는 httpOnly 쿠키) | Moneo moneo-auth 패턴 재사용 |
| 파일 저장 | Cloudflare R2 (S3 호환) | presigned URL로 프론트에서 직접 업로드 |
| 실시간 알림 | FastAPI WebSocket | Railway는 상시 구동이라 서버리스 함수보다 단순 |
| 고화질 이미지 변환 | Playwright(Python), FastAPI 내부 실행 | Vercel 서버리스 용량 제한 문제 없음 |

**구조 요약**: 프론트(Vercel)는 화면만 그리고, 모든 데이터/인증/파일 로직은 백엔드(Railway) API를 통해서만 처리합니다. 프론트가 DB나 R2에 직접 접근하지 않습니다.

---

## 1. 데이터 모델 (SQLAlchemy 기준)

- **User**: id, dojang_id(FK), email(unique), password_hash, name, role(OWNER/INSTRUCTOR), created_at
- **Dojang**: id, name, slug(unique), region, address, phone, description, logo_url, hero_image_url, brand_color, created_at
- **PromoTemplate**: id, dojang_id(FK), type(AWARD/BELT_UP/RECRUIT/EVENT), content(JSON), thumbnail_url, created_at
- **TrialRequest**: id, dojang_id(FK), student_name, parent_name, parent_phone, desired_class, memo, status(PENDING/CONFIRMED/DECLINED), created_at

**권한 규칙 (RLS 대신 코드로)**
- 모든 `/dashboard/*` API는 JWT 필요, `current_user.dojang_id`와 요청 리소스의 `dojang_id`가 다르면 403
- `TrialRequest` 생성(POST)은 인증 없이 열어둠 (학부모용)
- `Dojang` 조회(GET `/dojangs/{slug}`)는 인증 없이 열어둠 (공개 랜딩페이지용)

---

## 2단계 — 백엔드 프로젝트 셋업

### Cursor 프롬프트
```
FastAPI 프로젝트를 새로 셋업해줘. 백엔드는 별도 폴더(예: /backend)에 만들고
프론트(Next.js)와 같은 저장소 안에서 모노레포처럼 관리할 거야.

요구사항:
1. /backend 폴더에 FastAPI 프로젝트 생성
   - main.py, /app/api, /app/models, /app/core, /app/db 구조로 폴더 분리
   - requirements.txt에 fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary,
     python-jose(JWT), passlib[bcrypt], boto3(R2용), playwright 추가
2. /backend/app/db/session.py — Neon Postgres 연결 (DATABASE_URL 환경변수 사용,
   Neon은 SSL 필요하니 connect_args에 sslmode=require 반영)
3. /backend/.env.example — DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET,
   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME 항목
4. CORS 설정 — 프론트(Vercel 배포 URL + localhost:3000)만 허용
5. /health 엔드포인트 하나 만들어서 서버 살아있는지 확인 가능하게

DB 연결은 내가 Neon 콘솔에서 URL을 받아온 뒤 넣을 거니까, 코드는 환경변수로 읽는 형태로만 작성해줘.
```

---

## 3단계 — SQLAlchemy 모델 + Alembic 마이그레이션

### Cursor 프롬프트
```
/backend/app/models 에 SQLAlchemy 모델을 작성해줘.

모델:
- User: id(UUID, PK), dojang_id(FK nullable), email(unique), password_hash,
  name, role(Enum: OWNER, INSTRUCTOR), created_at
- Dojang: id(UUID, PK), name, slug(unique), region, address, phone, description,
  logo_url, hero_image_url, brand_color, created_at
- PromoTemplate: id(UUID, PK), dojang_id(FK), type(Enum: AWARD, BELT_UP, RECRUIT, EVENT),
  content(JSON), thumbnail_url, created_at
- TrialRequest: id(UUID, PK), dojang_id(FK), student_name, parent_name, parent_phone,
  desired_class(Enum, nullable), memo(nullable), status(Enum: PENDING, CONFIRMED, DECLINED,
  default PENDING), created_at

관계는 Dojang 1:N (User, PromoTemplate, TrialRequest)로 설정해줘.

이어서 Alembic을 초기화하고(alembic init), 위 모델 기준으로 첫 마이그레이션을
autogenerate로 생성해줘. 마이그레이션 실행 명령어(alembic upgrade head)는
안내만 하고 직접 실행은 내가 Neon 연결 확인 후 할게.
```

---

## 4단계 — 인증 (JWT 발급/검증)

### Cursor 프롬프트
```
FastAPI에 JWT 기반 인증을 구현해줘. Moneo(moneo-auth)에서 쓰던 것과 같은 패턴으로:
access token은 메모리 보관용(짧은 만료, 예: 15분), refresh token은 httpOnly 쿠키(예: 14일).

1. /backend/app/api/auth.py
   - POST /auth/register
     요청 바디: dojangName, name, email, password
     처리: password bcrypt 해싱 → Dojang 생성(slug는 dojangName 기반, 한글이면
     "dojang"+랜덤suffix) → User를 role=OWNER로 생성 → access token 응답 바디로,
     refresh token은 Set-Cookie(httpOnly, secure, samesite=lax)로 반환
   - POST /auth/login — email/password 검증 후 위와 동일하게 토큰 발급
   - POST /auth/refresh — 쿠키의 refresh token 검증 후 새 access token 발급
   - POST /auth/logout — refresh 쿠키 삭제

2. /backend/app/core/security.py — JWT 생성/검증 유틸, 비밀번호 해싱 유틸

3. /backend/app/core/deps.py — get_current_user 의존성
   Authorization: Bearer 헤더의 access token을 검증해서 현재 User를 반환,
   실패 시 401

이메일 중복, 잘못된 비밀번호, 만료된 토큰 등의 에러는 명확한 메시지와
적절한 HTTP 상태코드로 응답하게 해줘.
```

---

## 5단계 — 프론트엔드 연결

### Cursor 프롬프트
```
Next.js 프론트를 FastAPI 백엔드에 연결해줘. Supabase 관련 코드는 전부 제거하고
REST API 호출로 교체하는 작업이야.

1. /lib/api/client.ts — fetch 래퍼
   - NEXT_PUBLIC_API_URL 환경변수로 백엔드 주소 관리
   - access token은 React state/context로 메모리에만 보관 (localStorage 사용 금지)
   - 401 응답 시 자동으로 /auth/refresh 호출 후 원래 요청 재시도하는 로직 포함
   - refresh도 실패하면 로그인 페이지로 리다이렉트

2. /app/(auth)/register/page.tsx, /app/(auth)/login/page.tsx
   - 기존 UI는 유지하고, supabase.auth 호출 부분만 위 api client의
     register()/login() 함수 호출로 교체

3. /middleware.ts
   - Supabase 세션 체크 로직 제거
   - 대신 클라이언트 사이드에서 AuthContext로 로그인 여부 판단하고
     /dashboard/* 접근 시 리다이렉트 처리 (또는 refresh token 쿠키 존재 여부로 1차 체크)

기존 register 폼의 "체육관 이름" 필드는 그대로 유지하고, 백엔드 register API가
받는 dojangName 파라미터에 맞춰서 요청 바디만 조정해줘.
```

---

## 6단계 — 랜딩페이지 빌더 (도장 프로필 CRUD)

### Cursor 프롬프트
```
관장님이 텍스트/사진을 입력하면 자동 생성되는 홍보 랜딩페이지 기능을 만들어줘.

백엔드:
1. GET /dojangs/{slug} — 공개, 인증 불필요
2. GET /dashboard/dojang — 인증 필요, current_user.dojang_id 기준 본인 도장 조회
3. PATCH /dashboard/dojang — 인증 필요, OWNER만 수정 가능 (INSTRUCTOR는 403)

프론트:
1. /app/dashboard/landing/page.tsx — 도장 이름, 소개글, 대표사진, 로고, 브랜드컬러
   입력 폼 + 우측 실시간 미리보기
2. /app/[slug]/page.tsx — slug로 백엔드 GET /dojangs/{slug} 호출, 없으면 notFound()
   hero 섹션 + 브랜드컬러 CSS 변수 적용 + 체험신청 CTA
```

---

## 7단계 — 템플릿 에디터 + R2 업로드

### Cursor 프롬프트
```
홍보 카드뉴스 템플릿 에디터와 Cloudflare R2 이미지 업로드를 만들어줘.

백엔드:
1. POST /uploads/presign
   - 인증 필요, 요청 바디: fileName, contentType
   - boto3 S3 클라이언트를 R2 엔드포인트(https://<account_id>.r2.cloudflarestorage.com)로
     생성해서 presigned PUT URL 발급, 만료 5분
   - 응답: uploadUrl(PUT용), publicUrl(저장 후 접근할 최종 URL)
2. POST /dashboard/templates, GET /dashboard/templates, PATCH /dashboard/templates/{id}
   — promo_templates CRUD, 모두 current_user.dojang_id 소유 리소스만 접근 가능

프론트:
1. /app/dashboard/templates/new/page.tsx — WYSIWYG 에디터
   (텍스트/색상/폰트 편집 + Live Preview. UI는 이미 프론트에 있으므로 REST/R2 연동만 교체)
2. 이미지 업로드 시: 백엔드 /uploads/presign 호출 → 받은 uploadUrl로 브라우저에서
   직접 PUT 요청(파일 바이너리) → 완료 후 publicUrl을 폼 상태에 저장
```

---

## 8단계 — 고화질 이미지 변환 (Playwright)

### Cursor 프롬프트
```
저장된 템플릿을 고화질 PNG로 변환하는 API를 FastAPI에 만들어줘.

1. requirements.txt에 playwright 추가 후, Dockerfile(Railway 배포용)에
   playwright install --with-deps chromium 실행 단계 포함
2. GET /dashboard/templates/{id}/export
   - 인증 필요, 소유 도장 템플릿인지 확인
   - 템플릿 content(JSON)를 렌더링하는 내부 HTML 문자열 생성 (또는
     프론트의 /render/template/{id} 같은 순수 렌더링 페이지를 playwright로 방문)
   - playwright의 chromium.launch() → page.screenshot()으로 PNG 바이트 생성 후 응답

Railway는 컨테이너 방식이라 Vercel 서버리스 함수 용량 제한이 없으니
@sparticuz/chromium 같은 우회 없이 일반 playwright로 바로 구현하면 돼.
```

---

## 9단계 — 체험 신청 + WebSocket 실시간 알림

### Cursor 프롬프트
```
학부모용 체험 신청 폼과 관장님용 실시간 알림 대시보드를 만들어줘.

백엔드:
1. POST /trial-requests — 인증 불필요, dojang_id + 학생/학부모 정보 받아서 저장
   (status는 항상 PENDING으로 강제, 요청 바디로 다른 값 못 넣게)
2. GET /dashboard/trial-requests — 인증 필요, 본인 도장 것만 최신순 반환
3. PATCH /dashboard/trial-requests/{id} — 상태 변경(CONFIRMED/DECLINED), 본인 도장만
4. WebSocket /ws/dashboard/trial-requests
   - 연결 시 JWT 검증(쿼리 파라미터 또는 첫 메시지로 토큰 전달)
   - 해당 dojang_id 방(room)에 연결 등록
   - POST /trial-requests로 새 신청이 들어오면 같은 dojang_id 방에 브로드캐스트
   - 간단하게 dojang_id -> [WebSocket] 딕셔너리로 커넥션 매니저 구현

프론트:
1. /components/TrialRequestForm.tsx — 공개 랜딩페이지에서 사용, POST /trial-requests 호출
2. /app/dashboard/trials/page.tsx
   - 최초 로드 시 GET /dashboard/trial-requests로 목록 표시
   - WebSocket 연결해서 새 신청 오면 리스트 맨 위에 추가 + 토스트 알림
   - 컴포넌트 언마운트 시 WebSocket 연결 해제
```

---

## 10단계 — SEO + 동적 OG 이미지

이 부분은 프론트(Next.js) 영역이라 v2와 동일합니다. 변경 없음.

### Cursor 프롬프트
```
/app/[slug]/page.tsx에 generateMetadata로 도장별 title/description을 동적으로 생성해줘.
/app/[slug]/opengraph-image.tsx에 Next.js ImageResponse API로 도장 로고/이름/브랜드컬러가
반영된 동적 OG 이미지를 만들어줘. 백엔드 API 호출 없이 이미 받아온 slug 데이터로 처리해줘.
```

---

## 11단계 — 배포

### Cursor 프롬프트
```
Vercel(프론트) + Railway(백엔드) 배포를 준비해줘.

1. Railway용 /backend/Dockerfile 작성
   - Python 베이스 이미지, requirements.txt 설치, playwright install --with-deps chromium 포함
   - uvicorn app.main:app --host 0.0.0.0 --port $PORT 로 실행
2. Railway 환경변수 체크리스트를 README에 정리:
   DATABASE_URL(Neon), JWT_SECRET, JWT_REFRESH_SECRET,
   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
   CORS_ORIGINS(Vercel 배포 URL)
3. Vercel(프론트) 환경변수: NEXT_PUBLIC_API_URL(Railway 배포 URL)
4. alembic upgrade head를 Railway 배포 파이프라인에서 자동 실행할지, 수동으로
   할지 선택지를 README에 안내 (초기에는 수동 추천)

배포 자체는 각 콘솔(Vercel-GitHub 연동, Railway-GitHub 연동)에서 진행할 거니까
설정 파일과 안내만 준비해줘.
```

---

## 진행 순서 요약
2. 백엔드 셋업 → 3. 모델/마이그레이션 → 4. 인증 → 5. 프론트 연결 → 6. 랜딩빌더
→ 7. 템플릿+R2 업로드 → 8. 고화질 변환 → 9. 체험신청+WebSocket → 10. SEO/OG → 11. 배포

**우선순위**: 4단계(인증)까지가 새 스택의 핵심 뼈대라 여기서 막히면 이후 단계가 다 밀립니다. 4단계 끝나면 회원가입/로그인이 실제로 동작하는지 먼저 확인하고 5단계로 넘어가세요.
