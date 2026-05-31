# catholickidscrafts.com 무료 배포 가이드 (한국어)

Neon(데이터베이스) + Vercel(호스팅) + Vercel Blob(파일) 무료 티어로 운영하는 방법입니다.

## 준비물

- GitHub 저장소: `jisunpark28/catholickidscrafts` (또는 본인 fork)
- 도메인: **catholickidscrafts.com** (등록 업체에서 DNS 설정)
- 무료 계정: [Neon](https://neon.tech), [Vercel](https://vercel.com)

---

## 1. Neon Postgres (무료)

1. [neon.tech](https://neon.tech) 로그인 → **New Project**
2. 프로젝트 → **Connection details**
3. 두 개의 URL을 복사합니다:
   - **Pooled** → Vercel의 `DATABASE_URL` (호스트에 `-pooler` 포함)
   - **Direct** → Vercel의 `DIRECT_URL` (마이그레이션용, pooler 없음)

로컬 개발도 같은 Neon URL을 쓰면 됩니다 (별도 Postgres 설치 불필요).

---

## 2. 로컬에서 DB 초기화 (한 번)

```bash
git clone https://github.com/jisunpark28/catholickidscrafts.git
cd catholickidscrafts
cp .env.example .env
```

`.env` 편집:

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | Neon **Pooled** 연결 문자열 |
| `DIRECT_URL` | Neon **Direct** 연결 문자열 |
| `AUTH_SECRET` | `openssl rand -base64 32` 로 생성 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | 첫 **슈퍼 관리자** (시드용) |
| `NEXT_PUBLIC_SITE_URL` | `https://catholickidscrafts.com` |

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

브라우저: **http://localhost:3000/admin/login** → 시드한 이메일/비밀번호로 로그인.

---

## 3. Vercel 배포 (무료)

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub 저장소 연결
2. **Environment Variables** (Production + Preview 권장):

| 이름 | 값 |
|------|-----|
| `DATABASE_URL` | Neon Pooled |
| `DIRECT_URL` | Neon Direct |
| `AUTH_SECRET` | 로컬과 동일하거나 새로 생성 |
| `NEXT_PUBLIC_SITE_URL` | `https://catholickidscrafts.com` |
| `BLOB_READ_WRITE_TOKEN` | 아래 Blob 단계 후 붙여넣기 |

`ADMIN_EMAIL` / `ADMIN_PASSWORD`는 Vercel에 넣지 않아도 됩니다. DB 시드는 로컬에서 Neon URL로 `npm run db:seed` 한 번 실행하면 프로덕션 DB에도 반영됩니다.

3. **Deploy** — 빌드 시 `prisma migrate deploy`가 자동 실행됩니다 (`vercel-build` 스크립트).

---

## 4. Vercel Blob (PDF 업로드, 무료)

1. Vercel 프로젝트 → **Storage** → **Create Database** → **Blob**
2. 생성 후 **Connect** → `BLOB_READ_WRITE_TOKEN`이 환경 변수에 추가됨
3. **Redeploy** 한 번

로컬에서는 토큰 없이 `public/uploads/`에 저장됩니다.

---

## 5. 도메인 연결 (catholickidscrafts.com)

1. Vercel 프로젝트 → **Settings** → **Domains**
2. `catholickidscrafts.com` 및 `www.catholickidscrafts.com` 추가
3. Vercel이 안내하는 **DNS 레코드**를 도메인 등록 업체에 입력 (보통 `A` / `CNAME`)
4. SSL은 Vercel이 자동 발급 (몇 분~수십 분)

---

## 6. 운영자 계정 여러 명

1. **슈퍼 관리자**로 `/admin/login` 로그인
2. 상단 메뉴 **Operators** → 이메일·이름·비밀번호·역할 입력
   - **Operator**: 자료·커리큘럼 편집
   - **Super admin**: 위 + 다른 운영자 추가/삭제

첫 슈퍼 관리자는 `npm run db:seed`로만 생성됩니다. 이후 추가 계정은 Operators 화면에서 만드세요.

---

## 7. 리치 텍스트 에디터

- **Kids Resources** / **Curriculum** 편집 화면에서 굵게, 제목, 목록 등 서식 지원
- 저장 형식: HTML (`contentFormat: html`)
- 예전 Markdown 시드 자료는 그대로 읽히며, 저장 시 HTML로 변환됩니다

---

## 8. Daily Mass (편집 없음)

`/mass` 일력과 `/mass/날짜` 본문은 [Evangelizo API](http://feed.evangelizo.org/)에서 자동으로 가져옵니다. 관리자 화면에서 수정하지 않습니다.

---

## 문제 해결

| 증상 | 확인 |
|------|------|
| Vercel 빌드 실패 `DIRECT_URL` | Neon Direct URL이 설정됐는지 |
| 로그인 안 됨 | `npm run db:seed` 실행 여부, `AUTH_SECRET` Vercel과 일치 |
| PDF 업로드 실패 (배포) | `BLOB_READ_WRITE_TOKEN` 설정 후 재배포 |
| Operators 메뉴 안 보임 | 슈퍼 관리자 계정인지 (`db:seed` 첫 계정) |

---

## 비용 요약

| 서비스 | 무료 티어 |
|--------|-----------|
| Neon | 소규모 Postgres |
| Vercel | Hobby (개인/비영리 적합) |
| Vercel Blob | 제한적 저장·전송 |
| Evangelizo | 공개 API (읽기 전용) |

트래픽이 크게 늘면 각 서비스 유료 플랜을 검토하세요.
