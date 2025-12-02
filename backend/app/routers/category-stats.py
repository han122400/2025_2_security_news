
@router.get("/category-stats")
async def get_category_stats():
    """
    각 카테고리별 오늘의 뉴스 기사 수를 반환합니다.
    5분간 캐시됩니다.
    """
    global _category_stats_cache, _cache_timestamp
    
    # 캐시가 유효한지 확인
    if _category_stats_cache and _cache_timestamp:
        elapsed = (datetime.now() - _cache_timestamp).total_seconds()
        if elapsed < CACHE_DURATION:
            print(f"캐시 반환 (남은 시간: {int(CACHE_DURATION - elapsed)}초)")
            return _category_stats_cache
    
    print("새로운 데이터 가져오는 중...")
    
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
                found_old_articles = False
                
                # 여러 페이지를 가져와서 오늘 기사를 모두 카운트
                for page in range(1, 4):  # 최대 300개 기사 확인 (100 * 3)
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
                    print(f'{page}기사: {response}')
                    
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
                            else:
                                # 오늘이 아닌 기사를 발견하면 더 이상 검색 안함
                                found_old_articles = True
                        except Exception:
                            continue
                    
                    today_count += page_today_count
                    
                    # 오늘이 아닌 기사가 나오기 시작하면 중단
                    if found_old_articles or page_today_count == 0:
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
    
    # 캐시 저장
    _category_stats_cache = response_data
    _cache_timestamp = datetime.now()
    
    return response_data
