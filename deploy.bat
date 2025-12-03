@echo off
setlocal enabledelayedexpansion

echo ===================================
echo GCP Cloud Run 배포 스크립트
echo ===================================
echo.

REM 프로젝트 설정
set /p PROJECT_ID="GCP 프로젝트 ID 입력: "
set SERVICE_NAME=security-news
set REGION=asia-northeast3

REM 네이버 API 키 입력
echo.
echo 네이버 API 키를 입력하세요.
echo (https://developers.naver.com/apps 에서 발급)
echo.
set /p NAVER_CLIENT_ID="네이버 클라이언트 ID: "
set /p NAVER_CLIENT_SECRET="네이버 클라이언트 SECRET: "

echo.
echo 배포 정보 확인:
echo - 프로젝트 ID: %PROJECT_ID%
echo - 서비스 이름: %SERVICE_NAME%
echo - 리전: %REGION%
echo - 네이버 클라이언트 ID: %NAVER_CLIENT_ID%
echo.
set /p CONFIRM="계속하시겠습니까? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo 배포를 취소했습니다.
    exit /b 0
)

REM GCP 프로젝트 설정
echo.
echo GCP 프로젝트 설정 중...
gcloud config set project %PROJECT_ID%

if errorlevel 1 (
    echo GCP 프로젝트 설정 실패! 프로젝트 ID를 확인하세요.
    pause
    exit /b 1
)

echo.
echo [1/3] Docker 이미지 빌드 및 푸시 중...
echo (시간이 다소 걸릴 수 있습니다...)
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%SERVICE_NAME%

if errorlevel 1 (
    echo.
    echo ❌ 빌드 실패!
    echo.
    echo 가능한 원인:
    echo - Cloud Build API가 활성화되지 않음
    echo - 권한 문제
    echo - Dockerfile 오류
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Cloud Run에 배포 중...
gcloud run deploy %SERVICE_NAME% ^
  --image gcr.io/%PROJECT_ID%/%SERVICE_NAME% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 1Gi ^
  --cpu 1 ^
  --timeout 300 ^
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://ytwxtuogbwarambyddls.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0d3h0dW9nYndhcmFtYnlkZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzkyODYsImV4cCI6MjA3ODkxNTI4Nn0.1DcFDAe_7jfNQJ2mSK9tCARXCU_ZE9MtYhv6KqVrKCY,NAVER_CLIENT_ID=%NAVER_CLIENT_ID%,NAVER_CLIENT_SECRET=%NAVER_CLIENT_SECRET%"

if errorlevel 1 (
    echo.
    echo ❌ 배포 실패!
    echo.
    echo 가능한 원인:
    echo - Cloud Run API가 활성화되지 않음
    echo - 권한 문제
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] 배포 완료!
echo.
echo ===================================
echo ✅ 배포가 성공적으로 완료되었습니다!
echo ===================================
echo.
echo 서비스 URL:
gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"

echo.
echo 브라우저에서 위 URL로 접속하세요!
echo.
pause
