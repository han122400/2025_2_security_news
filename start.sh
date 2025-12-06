#!/bin/bash

# 환경 변수 설정
export PORT=${PORT:-8080}

echo "=== Starting Backend Server on port 8000 ==="
# 백엔드 시작 (백그라운드, 8000 포트)
cd /app/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 백엔드 프로세스가 살아있는지만 확인
echo "Waiting for backend to start..."
sleep 3
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "✗ Backend process died immediately. Check logs above."
  exit 1
fi
echo "✓ Backend process is running (PID: $BACKEND_PID)"

echo "=== Starting Frontend Server on port $PORT ==="
# 프론트엔드 시작
cd /app/frontend
npm start -- -p "$PORT" -H 0.0.0.0
