# PUMSAE

지역 태권도장 홍보 랜딩, 카드뉴스, 체험 신청을 위한 서비스입니다.

- 프론트: Next.js 14 (Vercel)
- 백엔드: FastAPI (Railway)
- DB: Neon Postgres
- 파일: Cloudflare R2

로컬 개발과 스택 설명은 [docs/프로젝트.md](./docs/프로젝트.md), 구현 순서는 [docs/PUMSAE_개발가이드_v3.md](./docs/PUMSAE_개발가이드_v3.md)를 보세요.

---

## 로컬 실행

프론트 (저장소 루트):

```bash
copy .env.example .env.local
npm install
npm run dev
```

백엔드:

```bash
cd backend
copy .env.example .env
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

`backend/.env`의 `DATABASE_URL`은 Neon 연결 문자열입니다.

---

## 배포 (콘솔에서 GitHub 연동)

배포 명령은 이 저장소에서 실행하지 않습니다. Vercel·Railway 콘솔에서 GitHub 저장소를 연결하세요.

권장 순서: **Neon DB → Railway(백엔드) → 마이그레이션 → Vercel(프론트) → CORS에 Vercel URL 반영**.

### Railway (FastAPI)

1. New Project → GitHub 저장소 연결
2. **Root Directory**를 `backend` 로 지정합니다. (`backend/Dockerfile` 사용)
3. 아래 환경변수를 Variables에 넣습니다.
4. 배포 후 Public Domain을 켜고 URL을 복사합니다. (예: `https://pumsae-api.up.railway.app`)

`backend/Dockerfile`은 Python 3.12 이미지에 `requirements.txt`를 설치하고, `playwright install --with-deps chromium` 후 아래처럼 실행합니다.

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

헬스 체크 경로: `GET /health`

#### Railway 환경변수 체크리스트

| 변수 | 필수 | 값 |
|---|---|---|
| `DATABASE_URL` | 예 | Neon Postgres connection string (`sslmode=require` 포함) |
| `JWT_SECRET` | 예 | access token용 긴 랜덤 문자열. 로컬 `change-me` 쓰지 말 것 |
| `JWT_REFRESH_SECRET` | 예 | refresh token용. `JWT_SECRET`과 **다른** 값 |
| `R2_ACCOUNT_ID` | 예 | Cloudflare 계정 ID |
| `R2_ACCESS_KEY_ID` | 예 | R2 API 토큰 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | 예 | R2 API 토큰 시크릿 |
| `R2_BUCKET_NAME` | 예 | 버킷 이름 |
| `CORS_ORIGINS` | 예 | Vercel 프론트 URL. 쉼표로 여러 개 가능. 끝에 `/` 없이. 예: `https://pumsae.vercel.app,http://localhost:3000` |

권장:

| 변수 | 값 |
|---|---|
| `R2_PUBLIC_URL` | 이미지가 브라우저에 열리는 공개 주소. 예: `https://pub-xxxxxxxx.r2.dev` (끝에 `/` 없이) |
| `COOKIE_SECURE` | `true` (HTTPS에서 refresh 쿠키 전송) |

`R2_PUBLIC_URL`이 없으면 이미지 업로드 API가 503을 반환합니다.

### Vercel (Next.js)

1. New Project → 같은 GitHub 저장소 연결
2. Root Directory는 저장소 **루트** (Next.js `app/` 이 있는 위치)
3. Framework Preset: Next.js
4. 환경변수:

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_API_URL` | Railway 공개 URL. 끝에 `/` 없이. 예: `https://pumsae-api.up.railway.app` |

권장:

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel 프론트 URL. OG 이미지 절대경로용. 예: `https://pumsae.vercel.app` |

프론트 URL이 나온 뒤 Railway `CORS_ORIGINS`에 그 주소를 넣고 백엔드를 한 번 재배포하세요. 로그인 refresh 쿠키와 대시보드 API가 막히지 않습니다.

체험 신청 실시간 알림은 `NEXT_PUBLIC_API_URL`의 `https`를 `wss`로 바꿔 WebSocket에 붙습니다. 별도 변수는 없습니다.

---

## 마이그레이션 (`alembic upgrade head`)

Neon은 빈 DB로 시작합니다. 테이블이 없으면 가입·저장 API가 실패합니다.

### 선택 A — 수동 (초기 추천)

스키마가 자주 바뀌는 동안에는 배포와 마이그레이션을 분리하는 편이 안전합니다. 잘못된 마이그레이션이 앱 기동을 막지 않습니다.

Railway 서비스에서 일회성으로:

```bash
alembic upgrade head
```

- Railway 대시보드 → 해당 서비스 → 터미널/Shell, 또는
- 로컬에서 `backend/.env`의 `DATABASE_URL`을 Neon 프로덕션 URL로 맞춘 뒤 `backend`에서 위 명령

배포가 끝난 뒤 **한 번** 실행하면 됩니다. 이후 Alembic 리비전을 추가했을 때만 다시 실행하세요.

### 선택 B — 배포 시 자동

안정된 뒤에는 Dockerfile CMD를 아래로 바꿔, 컨테이너가 뜰 때마다 head까지 맞출 수 있습니다.

```dockerfile
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

자동의 단점: 마이그레이션이 실패하면 앱이 뜨지 않습니다. 롤백이 필요하면 수동이 더 다루기 쉽습니다.

지금은 **선택 A(수동)** 를 권장합니다.
