from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from collections import Counter
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/stats", tags=["search_stats"])

# Supabase 클라이언트 초기화
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"🔍 Supabase URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "❌ SUPABASE_URL not set")
print(f"🔍 Supabase Key: {'✅ Set' if SUPABASE_KEY else '❌ Not set'}")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase: {str(e)}")
else:
    print("⚠️ Warning: SUPABASE_URL or SUPABASE_KEY not set. Stats features will be limited.")

class SearchLog(BaseModel):
    keyword: str
    timestamp: str
    
class KeywordStat(BaseModel):
    keyword: str
    count: int
    
class TrendData(BaseModel):
    date: str
    count: int

@router.post("/search")
async def log_search(keyword: str):
    """
    검색 키워드를 Supabase에 기록합니다.
    키워드가 이미 존재하면 count를 증가시키고, 없으면 새로 생성합니다.
    PostgreSQL 함수를 사용하여 원자적으로 처리합니다.
    """
    print(f"🔍 Attempting to log search keyword: {keyword}")
    
    if not supabase:
        print("❌ Supabase client not initialized")
        return {"status": "error", "message": "Database not configured"}
    
    try:
        print(f"📤 Calling Supabase RPC function...")
        # PostgreSQL 함수 호출
        result = supabase.rpc('increment_search_keyword', {
            'search_keyword': keyword
        }).execute()
        
        print(f"✅ Search logged successfully: {result.data}")
        return {"status": "success", "keyword": keyword, "data": result.data}
    except Exception as e:
        # 에러가 발생해도 검색 기능에는 영향 없도록 200 반환
        print(f"❌ Search log error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "keyword": keyword, "message": str(e)}

@router.get("/popular-keywords")
async def get_popular_keywords(limit: int = 10) -> List[KeywordStat]:
    """
    인기 검색 키워드를 반환합니다.
    """
    if not supabase:
        return []
    
    try:
        # count 기준 내림차순 정렬
        response = supabase.table("search_log")\
            .select("keyword, count")\
            .order("count", desc=True)\
            .limit(limit)\
            .execute()
        
        popular = [
            KeywordStat(keyword=row['keyword'], count=row['count'])
            for row in response.data
        ]
        
        return popular
    except Exception as e:
        print(f"Error fetching popular keywords: {str(e)}")
        return []

@router.get("/search-trend")
async def get_search_trend(days: int = 7) -> List[TrendData]:
    """
    검색량 추이를 반환합니다.
    날짜별 총 검색 횟수(count 합계)를 반환합니다.
    """
    if not supabase:
        return []
    
    try:
        # 모든 키워드의 updated_at과 count 가져오기
        response = supabase.table("search_log")\
            .select("updated_at, count")\
            .execute()
        
        # 날짜별 검색 수 집계 (updated_at 기준)
        date_counts = Counter()
        for row in response.data:
            try:
                # updated_at을 날짜로 변환
                date = datetime.fromisoformat(row['updated_at'].replace('Z', '+00:00')).strftime('%Y-%m-%d')
                # 해당 날짜의 총 검색 수 누적
                date_counts[date] += row['count']
            except:
                pass
        
        # 날짜별 데이터 생성 (빈 날짜도 포함)
        trend_data = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-1-i)).strftime('%Y-%m-%d')
            count = date_counts.get(date, 0)
            trend_data.append(TrendData(date=date, count=count))
        
        return trend_data
    except Exception as e:
        print(f"Error fetching search trend: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

@router.get("/keyword-relations")
async def get_keyword_relations(keyword: str, limit: int = 20):
    """
    연관 키워드를 count 순으로 반환합니다.
    """
    if not supabase:
        return []
    
    try:
        # 요청한 키워드 제외하고 count 순으로 정렬
        response = supabase.table("search_log")\
            .select("keyword, count")\
            .neq("keyword", keyword)\
            .order("count", desc=True)\
            .limit(limit)\
            .execute()
        
        relations = [
            {"keyword": row['keyword'], "count": row['count']}
            for row in response.data
        ]
        
        return relations
    except Exception as e:
        print(f"Error fetching keyword relations: {str(e)}")
        return []
