# API 최적화 가이드

## 문제 상황

네이버 뉴스 API에서 429 Too Many Requests 에러가 발생하여 서비스가 중단되는 문제

## 해결 방법

### 1. Redis 캐싱 시스템 구현 ✅

- 동일한 검색 쿼리에 대해 5분간 캐시 저장
- 캐시가 있으면 API 호출 없이 즉시 응답
- API 호출 횟수를 대폭 감소

### 2. Rate Limiting (요청 제한) ✅

- SlowAPI를 사용하여 IP별 분당 20회 제한
- 악의적이거나 과도한 요청 차단
- 공정한 API 사용량 분배

### 3. 카테고리 통계 캐싱 ✅

- 카테고리별 통계도 Redis에 5분간 캐싱
- 대량의 API 호출이 필요한 엔드포인트 최적화

## 설치 및 설정

### 1. Redis 설치 (Windows)

**방법 1: WSL2 사용 (권장)**

```bash
# WSL2에서 Ubuntu 사용
wsl --install
# Ubuntu 실행 후
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**방법 2: Memurai 사용**

- https://www.memurai.com/get-memurai 에서 다운로드
- 설치 후 자동으로 서비스 시작됨
- Windows 서비스로 등록되어 백그라운드 실행

**방법 3: Docker 사용**

```bash
docker run -d -p 6379:6379 redis:latest
```

### 2. Python 패키지 설치

```bash
pip install redis==5.0.1 slowapi==0.1.9
```

### 3. 환경변수 설정

`.env` 파일에 Redis URL 추가:

```env
REDIS_URL=redis://localhost:6379
```

WSL2를 사용하는 경우:

```env
REDIS_URL=redis://localhost:6379
```

### 4. Redis 연결 확인

```bash
# Redis CLI로 연결 테스트
redis-cli ping
# 응답: PONG
```

## 사용 방법

### 서버 시작

```bash
# Redis 먼저 시작 (WSL2 사용 시)
wsl -d Ubuntu -e sudo service redis-server start

# 백엔드 서버 시작
cd backend
uvicorn app.main:app --reload
```

### 캐시 동작 확인

1. 처음 검색 시: API 호출 → 응답 느림
2. 같은 검색 5분 내: 캐시 반환 → 응답 빠름
3. 5분 경과 후: API 다시 호출 → 캐시 갱신

콘솔 로그에서 확인 가능:

- "API 호출 및 캐시 저장: {query}" → API 호출
- "캐시에서 반환: {query}" → 캐시 사용

### Rate Limiting 확인

분당 20회 이상 요청 시:

```json
{
  "error": "Rate limit exceeded: 20 per 1 minute"
}
```

## 성능 개선 효과

### Before (캐싱 없음)

- 매 요청마다 API 호출
- 빠른 연속 요청 시 429 에러 발생
- 카테고리 통계: 약 50회 API 호출 (10 카테고리 × 5 페이지)

### After (캐싱 + Rate Limiting)

- 5분 내 동일 검색: 0회 API 호출
- 429 에러 거의 없음 (캐시 히트율에 따라)
- 카테고리 통계: 5분간 1회만 API 호출
- **API 호출 감소율: 약 80-90%**

## 주의사항

1. **Redis 서버 필수**: Redis가 실행 중이지 않으면 캐싱이 작동하지 않습니다 (단, 서버는 정상 작동)
2. **캐시 만료**: 5분 후 자동으로 캐시가 만료되어 새로운 데이터를 가져옵니다
3. **Rate Limit 조정**: 필요시 `@limiter.limit("20/minute")`의 값을 수정하세요
4. **Production 환경**: Redis URL을 환경에 맞게 설정하세요

## 트러블슈팅

### Redis 연결 실패

```
Redis get error: Error connecting to localhost:6379
```

→ Redis 서버가 실행 중인지 확인

### 여전히 429 에러 발생

1. Redis 캐시가 제대로 작동하는지 확인
2. Rate Limit을 더 낮게 조정
3. 네이버 API 할당량 확인
4. 다른 IP에서도 요청하고 있는지 확인

### WSL2에서 Redis 연결 안됨

```env
# localhost 대신 WSL2 IP 사용
REDIS_URL=redis://172.x.x.x:6379
```

WSL2 IP 확인: `wsl hostname -I`

## 추가 최적화 방안

1. **캐시 시간 조정**: 트래픽 패턴에 따라 5분을 10분 또는 15분으로 늘리기
2. **Warm-up 캐싱**: 서버 시작 시 인기 검색어 미리 캐싱
3. **CDN 사용**: 정적 데이터를 CDN으로 서빙
4. **데이터베이스 캐싱**: 자주 조회되는 뉴스를 DB에 저장
5. **배치 처리**: 카테고리 통계를 주기적으로 백그라운드에서 갱신
