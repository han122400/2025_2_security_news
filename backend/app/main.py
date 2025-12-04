from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import asyncio

# 🔸 backend/.env 로드 (uvicorn 재로더/서브프로세스에서도 실행되도록 모듈 최상단에)
load_dotenv()

app = FastAPI()

# CORS 미들웨어 설정 (라우터 등록 전에 추가)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용 (OPTIONS 자동 처리)
    allow_headers=["*"],  # 모든 헤더 허용
)

from app.routers.news_api import router as news_api, background_cache_updater
from app.routers.search_stats import router as search_stats
from app.routers.user_profile import router as user_profile
from app.routers.email_notifications import router as email_notifications

app.include_router(news_api)
app.include_router(search_stats)
app.include_router(user_profile)
app.include_router(email_notifications)


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 백그라운드 캐시 작업 시작"""
    print("=" * 50)
    print("[서버] 시작 중...")
    print("[서버] 백그라운드 캐시 작업 시작")
    print("=" * 50)
    asyncio.create_task(background_cache_updater())


@app.get("/api/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "message": "Backend is running"}


@app.get("/api/test")
async def test_get():
    return {"message": "GET test successful"}

@app.post("/api/test")
async def test_post(data: dict):
    return {"received": data}
