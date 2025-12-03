#!/bin/bash

# 환경 변수 설정
export PORT=${PORT:-8080}

# 백엔드 시작 (백그라운드, 8000 포트)
cd /app/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 잠시 대기 (백엔드 시작 확인)
sleep 3

# 프론트엔드 시작 (포트는 Cloud Run의 PORT 사용)
cd /app/frontend
PORT=$PORT npm start
