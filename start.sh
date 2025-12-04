#!/bin/bash

# 환경 변수 설정
export PORT=${PORT:-8080}

echo "=== Starting Backend Server on port 8000 ==="
# 백엔드 시작 (백그라운드, 8000 포트)
cd /backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 백엔드 시작 대기
echo "Waiting for backend to start..."
sleep 3

echo "=== Starting Frontend Server on port $PORT ==="
# 프론트엔드 시작
cd /frontend
npm start
