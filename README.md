# Security News Platform 🔒

보안 뉴스를 수집하고 공유하는 웹 플랫폼

## 📋 프로젝트 구조

```
security_news/
├── frontend/          # Next.js 프론트엔드
├── backend/           # FastAPI 백엔드
└── database/          # SQL 스크립트
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- Python 3.8+
- Supabase 계정

### 1. 환경 변수 설정

#### Frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local 파일에 Supabase 정보 입력
```

#### Backend

```bash
cd backend
cp .env.example .env
# .env 파일에 API 키 및 Supabase 정보 입력
```

### 2. Frontend 설치 및 실행

```bash
cd frontend
npm install
npm run dev
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

### 3. Backend 설치 및 실행

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend는 `http://localhost:8000`에서 실행됩니다.

## 🔑 환경 변수 설정 가이드

### Frontend (.env.local)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon 키

### Backend (.env)

- `NAVER_CLIENT_ID`: 네이버 검색 API 클라이언트 ID
- `NAVER_CLIENT_SECRET`: 네이버 검색 API 시크릿 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_KEY`: Supabase Service Role 키
- `SMTP_SERVER`: 이메일 SMTP 서버
- `SMTP_USER`: 이메일 계정
- `SMTP_PASSWORD`: 이메일 앱 비밀번호

## 📦 주요 기능

- 🔍 보안 뉴스 검색 및 필터링
- 📊 통계 대시보드
- 👤 사용자 프로필 관리
- 📧 이메일 알림
- 💬 커뮤니티 기능

## 🛠️ 기술 스택

### Frontend

- Next.js 15
- TypeScript
- Supabase Auth
- Tailwind CSS

### Backend

- FastAPI
- Python 3.8+
- Supabase
- Naver Search API

## ⚠️ 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- API 키와 비밀번호는 환경 변수로만 관리하세요
- Production 환경에서는 적절한 CORS 설정을 사용하세요

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
