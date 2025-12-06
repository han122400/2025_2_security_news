#!/bin/bash

# 환경 변수 설정
export PORT=${PORT:-8080}

echo "=== Starting Backend Server on port 8000 ==="
# 백엔드 시작 (백그라운드, 8000 포트)
cd /app/backend

# 백엔드를 백그라운드로 시작하고 로그 출력
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1 | sed 's/^/[BACKEND] /' &
BACKEND_PID=$!

# 백엔드 시작 대기 및 확인
echo "Waiting for backend to start..."
for i in {1..10}; do
  if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✓ Backend is ready!"
    break
  fi
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✗ Backend process died. Exiting."
    exit 1
  fi
  echo "Attempt $i/10: Backend not ready yet..."
  sleep 2
done

if ! curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
  echo "✗ Backend failed to start after 20 seconds. Exiting."
  exit 1
fi

echo "=== Starting Frontend Server on port $PORT ==="
# 프론트엔드 시작
cd /app/frontend
npm start -- -p "$PORT" -H 0.0.0.0
