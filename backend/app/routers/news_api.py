from fastapi import APIRouter, HTTPException, Query, Request
import httpx
import os
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta
import hashlib
import sys
from pathlib import Path
import asyncio

# utils 모듈을 임포트하기 위해 경로 추가
sys.path.append(str(Path(__file__).parent.parent))
from utils.cache import get_cached_data, set_cached_data

router = APIRouter(prefix="/api/news", tags=["news"])
load_dotenv()  # .env 파일 로드

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
NAVER_API_URL = "https://openapi.naver.com/v1/search/news.json"

# 캐시 저장 (10분으로 늘림)
_category_stats_cache = None
_cache_timestamp = None
CACHE_DURATION = 600  # 10분 (초)

# API 요청 간 딜레이 (초)
API_DELAY = 1.0  # 1초로 늘림 (429 에러 방지)

# 인기 검색어 (주기적으로 미리 캐싱할 키워드)
POPULAR_KEYWORDS = [
    "사이버보안", "해킹", "개인정보", "IT 보안", "악성코드",
    "보안제품", "암호화", "네트워크 보안", "보안 정책", "데이터 보안"
]

# 백그라운드 작업 실행 여부
_background_task_running = False


@router.get("/search")
async def search_news(
    request: Request,
    query: str = Query(..., description="검색어"),
    display: int = Query(10, ge=1, le=100, description="검색 결과 개수 (1~100)"),
    start: int = Query(1, ge=1, description="검색 시작 위치 (1~1000)"),
    sort: str = Query("date", regex="^(sim|date)$", description="정렬 옵션 (sim: 정확도순, date: 날짜순)")
):
    """
    네이버 뉴스 API를 사용하여 뉴스를 검색합니다.
    캐시 우선 전략: 캐시가 없으면 실시간으로 API 호출합니다.
    
    - **query**: 검색할 키워드
    - **display**: 한 번에 표시할 검색 결과 개수 (기본값: 10, 최대: 100)
    - **start**: 검색 시작 위치 (기본값: 1)
    - **sort**: 정렬 옵션 (sim: 정확도순, date: 날짜순)
    """
    
    # 캐시 키 생성 (query, display, start, sort 조합)
    cache_key = f"news:search:{hashlib.md5(f'{query}:{display}:{start}:{sort}'.encode()).hexdigest()}"
    
    # 캐시에서 데이터 확인 (항상 먼저 캐시 확인)
    cached_result = await get_cached_data(cache_key)
    if cached_result:
        print(f"✓ 캐시에서 반환: {query}")
        return cached_result
    
    # 캐시 미스: 실시간으로 API 호출
    print(f"⚠ 캐시 미스 - 실시간 API 호출: {query}")
    
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="네이버 API 인증 정보가 설정되지 않았습니다."
        )
    
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                NAVER_API_URL,
                headers=headers,
                params=params,
                timeout=10.0
            )
            
            if response.status_code == 429:
                # 429 에러 시 캐시된 인기 검색어 중 유사한 것 반환
                print(f"⚠ 429 에러 발생: {query}")
                return {
                    "lastBuildDate": datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0900"),
                    "total": 0,
                    "start": start,
                    "display": 0,
                    "items": [],
                    "message": "일시적으로 요청이 많습니다. 잠시 후 다시 시도해주세요."
                }
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"네이버 API 오류: {response.status_code}"
                )
            
            data = response.json()
            
            # 2020년 이후 기사만 필터링
            cutoff_date = datetime(2020, 1, 1)
            filtered_items = []
            
            for item in data.get('items', []):
                try:
                    pub_date = datetime.strptime(item['pubDate'], '%a, %d %b %Y %H:%M:%S %z')
                    if pub_date.replace(tzinfo=None) >= cutoff_date:
                        filtered_items.append(item)
                except Exception:
                    filtered_items.append(item)
            
            data['items'] = filtered_items
            data['display'] = len(filtered_items)
            
            # 캐시 저장 (10분)
            await set_cached_data(cache_key, data, expire_seconds=600)
            print(f"✓ API 호출 성공 및 캐시 저장: {query}")
            
            return data
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API 요청 시간 초과")
    except Exception as e:
        print(f"❌ API 호출 오류: {query} - {str(e)}")
        raise HTTPException(status_code=500, detail=f"API 호출 실패: {str(e)}")


@router.get("/security")
async def search_security_news(
    request: Request,
    display: int = Query(20, ge=1, le=100, description="검색 결과 개수"),
    start: int = Query(1, ge=1, description="검색 시작 위치")
):
    """
    보안 관련 뉴스를 검색합니다.
    """
    return await search_news(request, query="보안", display=display, start=start, sort="date")


@router.get("/category-stats")
async def get_category_stats():
    """
    각 카테고리별 오늘의 뉴스 기사 수를 반환합니다.
    5분간 캐시됩니다.
    """
    # Redis 캐시 키
    cache_key = "news:category-stats"
    
    # 캐시에서 데이터 확인
    cached_result = await get_cached_data(cache_key)
    if cached_result:
        print("카테고리 통계 캐시에서 반환")
        return cached_result
    
    print("새로운 카테고리 통계 데이터 가져오는 중...")
    
    categories = [
        {"id": "cyber-security", "name": "사이버보안", "keyword": "사이버보안"},
        {"id": "hacking", "name": "해킹/침해사고", "keyword": "해킹"},
        {"id": "privacy", "name": "개인정보보호", "keyword": "개인정보"},
        {"id": "it-trends", "name": "IT/보안 트렌드", "keyword": "IT 보안"},
        {"id": "malware", "name": "악성코드/피싱", "keyword": "악성코드"},
        {"id": "security-products", "name": "보안제품/서비스", "keyword": "보안제품"},
        {"id": "authentication", "name": "인증·암호화", "keyword": "암호화"},
        {"id": "network-security", "name": "네트워크보안", "keyword": "네트워크 보안"},
        {"id": "policy", "name": "정책·제도", "keyword": "보안 정책"},
        {"id": "data-security", "name": "데이터보안", "keyword": "데이터 보안"},
    ]
    
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="네이버 API 인증 정보가 설정되지 않았습니다."
        )
    
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    
    results = []
    # 오늘 날짜 (시작)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    async with httpx.AsyncClient() as client:
        for category in categories:
            try:
                today_count = 0
                consecutive_old_articles = 0
                max_consecutive_old = 50  # 연속으로 50개 오래된 기사가 나오면 중단
                
                # 여러 페이지를 가져와서 오늘 기사를 모두 카운트
                for page in range(1, 6):  # 최대 500개 기사 확인 (100 * 5)
                    # 페이지 요청 사이 딜레이 추가
                    if page > 1:
                        await asyncio.sleep(API_DELAY)
                    
                    params = {
                        "query": category["keyword"],
                        "display": 100,
                        "start": (page - 1) * 100 + 1,
                        "sort": "date"
                    }
                    
                    response = await client.get(
                        NAVER_API_URL,
                        headers=headers,
                        params=params,
                        timeout=10.0
                    )
                    
                    if response.status_code != 200:
                        break
                    
                    data = response.json()
                    items = data.get('items', [])
                    
                    if not items:
                        break
                    
                    # 오늘 날짜 기사만 카운트
                    page_today_count = 0
                    for item in items:
                        try:
                            pub_date = datetime.strptime(item['pubDate'], '%a, %d %b %Y %H:%M:%S %z')
                            pub_date_naive = pub_date.replace(tzinfo=None)
                            
                            if pub_date_naive >= today:
                                page_today_count += 1
                                consecutive_old_articles = 0  # 오늘 기사 발견 시 카운터 리셋
                            else:
                                consecutive_old_articles += 1
                        except Exception:
                            continue
                    
                    today_count += page_today_count
                    print(f"{category['name']} - 페이지 {page}: 오늘 기사 {page_today_count}개, 총 {today_count}개")
                    
                    # 연속으로 오래된 기사만 나오면 중단
                    if consecutive_old_articles >= max_consecutive_old:
                        print(f"{category['name']}: 연속 {consecutive_old_articles}개 오래된 기사, 검색 중단")
                        break
                
                results.append({
                    "category": category["name"],
                    "count": today_count,
                    "percentage": 0
                })
                
            except Exception as e:
                print(f"Error fetching {category['name']}: {str(e)}")
                results.append({
                    "category": category["name"],
                    "count": 0,
                    "percentage": 0
                })
    
    # 전체 합계 계산 및 퍼센티지 계산
    total = sum(r["count"] for r in results)
    if total > 0:
        for result in results:
            result["percentage"] = round((result["count"] / total) * 100)
    
    response_data = {
        "total": total,
        "categories": results
    }
    
    # 캐시 저장 (10분)
    await set_cached_data(cache_key, response_data, expire_seconds=600)
    
    return response_data


async def fetch_and_cache_news(keyword: str, display: int = 10):
    """
    백그라운드에서 뉴스를 미리 가져와서 캐시에 저장합니다.
    """
    cache_key = f"news:search:{hashlib.md5(f'{keyword}:{display}:1:date'.encode()).hexdigest()}"
    
    # 이미 캐시에 있는지 확인
    cached = await get_cached_data(cache_key)
    if cached:
        print(f"[백그라운드] 이미 캐시됨: {keyword}")
        return
    
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        return
    
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    
    params = {
        "query": keyword,
        "display": 100,
        "start": 1,
        "sort": "date"
    }
    
    try:
        await asyncio.sleep(API_DELAY)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                NAVER_API_URL,
                headers=headers,
                params=params,
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # 2020년 이후 기사만 필터링
                cutoff_date = datetime(2020, 1, 1)
                filtered_items = []
                
                for item in data.get('items', []):
                    try:
                        pub_date = datetime.strptime(item['pubDate'], '%a, %d %b %Y %H:%M:%S %z')
                        if pub_date.replace(tzinfo=None) >= cutoff_date:
                            filtered_items.append(item)
                            if len(filtered_items) >= display:
                                break
                    except Exception:
                        filtered_items.append(item)
                        if len(filtered_items) >= display:
                            break
                
                data['items'] = filtered_items
                data['display'] = len(filtered_items)
                
                # 캐시 저장
                await set_cached_data(cache_key, data, expire_seconds=600)
                print(f"[백그라운드] 캐시 저장 완료: {keyword}")
            else:
                print(f"[백그라운드] API 오류 {response.status_code}: {keyword}")
                
    except Exception as e:
        print(f"[백그라운드] 오류: {keyword} - {str(e)}")


async def background_cache_updater():
    """
    서버 시작 시 즉시 캐싱하고, 이후 10분마다 인기 검색어를 미리 캐싱합니다.
    """
    global _background_task_running
    _background_task_running = True
    
    print("[백그라운드] 캐시 업데이터 시작")
    
    # 첫 실행: 서버 시작 1초 후 (즉시 시작)
    await asyncio.sleep(1)
    
    while _background_task_running:
        try:
            print(f"\n{'='*60}")
            print(f"[백그라운드] 캐시 갱신 시작 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}")
            
            # 인기 검색어 캐싱 (각 검색어 사이 1초 대기)
            for i, keyword in enumerate(POPULAR_KEYWORDS, 1):
                print(f"[백그라운드] ({i}/{len(POPULAR_KEYWORDS)}) 처리 중: {keyword}")
                await fetch_and_cache_news(keyword, display=7)
                await asyncio.sleep(1)  # 각 검색어 사이 1초 대기
            
            # 카테고리 통계 캐싱
            print(f"\n[백그라운드] 카테고리 통계 갱신 중...")
            await get_category_stats()
            
            print(f"\n{'='*60}")
            print(f"[백그라운드] ✅ 캐시 갱신 완료!")
            print(f"[백그라운드] 다음 갱신: 10분 후 ({(datetime.now() + timedelta(minutes=10)).strftime('%H:%M:%S')})")
            print(f"{'='*60}\n")
            
            # 10분 대기
            await asyncio.sleep(600)
            
        except Exception as e:
            print(f"[백그라운드] ❌ 오류 발생: {str(e)}")
            print(f"[백그라운드] 1분 후 재시도...")
            await asyncio.sleep(60)  # 오류 시 1분 후 재시도

