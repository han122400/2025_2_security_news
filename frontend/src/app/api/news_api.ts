// 백엔드 API 호출 함수

// 동적으로 API URL 결정 (.env 환경변수에서 가져옴)
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

const API_BASE_URL = getApiBaseUrl()

// 유틸리티 함수: 지정된 시간만큼 대기
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface NewsItem {
  title: string
  originallink: string
  link: string
  description: string
  pubDate: string
}

export interface NewsResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NewsItem[]
  message?: string // 백엔드 메시지 (캐시 미스 시)
}

export interface ArticleData {
  id: number
  title: string
  summary: string
  date: string
  source: string
  category: string
  image?: string
  link: string
}

/**
 * 네이버 뉴스 API를 통해 뉴스 검색
 */
export async function searchNews(
  query: string,
  display: number = 10,
  start: number = 1,
  sort: 'sim' | 'date' = 'date'
): Promise<NewsResponse> {
  const params = new URLSearchParams({
    query,
    display: display.toString(),
    start: start.toString(),
    sort,
  })

  const response = await fetch(`${API_BASE_URL}/api/news/search?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // 항상 최신 데이터 가져오기
  })

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`)
  }

  return response.json()
}

/**
 * 카테고리별 뉴스 가져오기
 */
export async function getNewsByCategory(
  category: string,
  display: number = 7
): Promise<ArticleData[]> {
  try {
    const newsResponse = await searchNews(category, display, 1, 'date')

    // 캐시 준비 중이면 빈 배열 반환 (에러 아님)
    if (newsResponse.message || newsResponse.items.length === 0) {
      console.log(
        `${category}: 캐시 준비 중... (${
          newsResponse.message || '잠시 후 새로고침하세요'
        })`
      )
      return []
    }

    return newsResponse.items.map((item, index) => {
      // HTML 태그 제거 후 엔티티 디코딩
      const cleanTitle = decodeHtmlEntities(item.title.replace(/<[^>]*>/g, ''))
      const cleanSummary = decodeHtmlEntities(
        item.description.replace(/<[^>]*>/g, '')
      )

      return {
        id: index + 1,
        title: cleanTitle,
        summary: cleanSummary,
        date: formatDate(item.pubDate),
        source: extractSource(item.originallink),
        category: category,
        image: generateImageUrl(), // 랜덤 이미지 생성
        link: item.originallink || item.link,
      }
    })
  } catch (error) {
    console.error(`${category} 카테고리 뉴스 가져오기 실패:`, error)
    return []
  }
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * 날짜 형식 변환 (예: "2시간 전", "1일 전")
 */
function formatDate(pubDate: string): string {
  try {
    const date = new Date(pubDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) {
      return '방금 전'
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays === 1) {
      return '1일 전'
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  } catch {
    return pubDate
  }
}

/**
 * URL에서 출처 추출
 */
function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname
    if (domain.includes('chosun')) return 'IT조선'
    if (domain.includes('etnews')) return '전자신문'
    if (domain.includes('boannews')) return '보안뉴스'
    if (domain.includes('dailysecu')) return '데일리시큐'
    if (domain.includes('naver')) return '네이버뉴스'
    return domain.replace('www.', '').split('.')[0]
  } catch {
    return '뉴스'
  }
}

/**
 * 랜덤 이미지 URL 생성 (Unsplash)
 */
function generateImageUrl(): string {
  const images = [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
  ]
  return images[Math.floor(Math.random() * images.length)]
}

/**
 * 모든 카테고리의 뉴스 가져오기
 * 배치 처리로 API 제한 회피하면서 속도 최적화
 */
export async function getAllCategoryNews(): Promise<{
  [key: string]: ArticleData[]
}> {
  const categories = [
    { key: 'cyberSecurity', query: '사이버보안' },
    { key: 'hacking', query: '해킹' },
    { key: 'privacy', query: '개인정보' },
    { key: 'itTrends', query: 'IT 보안' },
    { key: 'malware', query: '악성코드' },
    { key: 'securityProducts', query: '보안제품' },
    { key: 'authentication', query: '암호화' },
    { key: 'networkSecurity', query: '네트워크 보안' },
    { key: 'policy', query: '보안 정책' },
    { key: 'dataSecurity', query: '데이터 보안' },
  ]

  const results: { [key: string]: ArticleData[] } = {}
  const BATCH_SIZE = 3 // 3개씩 배치 처리
  const BATCH_DELAY = 100 // 배치 간 100ms 대기

  // 배치 단위로 처리
  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE)

    // 각 배치는 병렬 처리
    await Promise.all(
      batch.map(async ({ key, query }) => {
        results[key] = await getNewsByCategory(query, 7)
      })
    )

    // 마지막 배치가 아니면 대기
    if (i + BATCH_SIZE < categories.length) {
      await delay(BATCH_DELAY)
    }
  }

  return results
}
