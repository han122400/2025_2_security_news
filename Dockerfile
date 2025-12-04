# 멀티 스테이지 빌드로 프론트엔드와 백엔드 통합

# Stage 1: Frontend 빌드
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# 프로덕션 환경 변수 설정 (NEXT_PUBLIC_API_URL은 설정하지 않음 - rewrites 사용)
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=https://ytwxtuogbwarambyddls.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0d3h0dW9nYndhcmFtYnlkZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzkyODYsImV4cCI6MjA3ODkxNTI4Nn0.1DcFDAe_7jfNQJ2mSK9tCARXCU_ZE9MtYhv6KqVrKCY

RUN npm run build

# Stage 2: 최종 실행 이미지
FROM node:20-slim

WORKDIR /app

# Python 설치 (FastAPI용)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 백엔드 설정
COPY backend/requirements.txt ./backend/
RUN pip3 install --no-cache-dir -r backend/requirements.txt --break-system-packages

COPY backend/ ./backend/

# 프론트엔드 빌드 결과 복사 (standalone 모드)
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# 시작 스크립트 복사
COPY start.sh ./
RUN chmod +x start.sh

# Cloud Run은 PORT 환경 변수 사용 (기본 8080)
ENV PORT=8080

EXPOSE 8080

CMD ["./start.sh"]
