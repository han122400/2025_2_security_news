#!/bin/bash

set -e

# 환경 변수 설정
export PORT=${PORT:-8080}

echo "=== Starting Backend Server ==="
# 백엔드 시작 (백그라운드, 8000 포트)
cd /app/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1 &
BACKEND_PID=$!

# 백엔드 시작 대기 및 확인
echo "Waiting for backend to start..."
sleep 5

# 백엔드 헬스 체크
for i in {1..10}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting for backend... attempt $i"
    sleep 2
done

# 백엔드 프로세스 확인
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start!"
    exit 1
fi

echo "=== Starting Frontend Server ==="
# 프론트엔드 시작 (포트는 Cloud Run의 PORT 사용)
cd /app/frontend
PORT=$PORT npm start
