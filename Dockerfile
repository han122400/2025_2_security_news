# 멀티 스테이지 빌드로 프론트엔드와 백엔드 통합

# Stage 1: Frontend 빌드
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# 프로덕션 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=/api

RUN npm run build

# Stage 2: 최종 실행 이미지
FROM node:20-slim

WORKDIR /app

# Python 설치 (FastAPI용)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 백엔드 설정
COPY backend/requirements.txt ./backend/
RUN pip3 install --no-cache-dir -r backend/requirements.txt --break-system-packages

COPY backend/ ./backend/

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/

# 시작 스크립트 복사
COPY start.sh ./
RUN chmod +x start.sh

# Cloud Run은 PORT 환경 변수 사용 (기본 8080)
ENV PORT=8080

EXPOSE 8080

CMD ["./start.sh"]
