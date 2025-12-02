'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface KeywordStat {
  keyword: string
  count: number
}

interface TrendData {
  date: string
  count: number
}

interface CategoryStat {
  category: string
  count: number
  percentage: number
}

interface CategoryStatsResponse {
  total: number
  categories: CategoryStat[]
}

export default function StatsDashboard() {
  const [popularKeywords, setPopularKeywords] = useState<KeywordStat[]>([])
  const [categoryStats, setCategoryStats] =
    useState<CategoryStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // 인기 키워드 가져오기
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const keywordsRes = await fetch(
        `${apiUrl}/api/stats/popular-keywords?limit=30`
      )
      if (keywordsRes.ok) {
        const keywords = await keywordsRes.json()
        setPopularKeywords(keywords)
        console.log('인기 키워드:', keywords)
      }

      // 카테고리별 뉴스 통계 가져오기
      console.log('카테고리 통계 가져오는 중...')
      const categoryRes = await fetch(`${apiUrl}/api/news/category-stats`)
      console.log('응답 상태:', categoryRes.status)
      if (categoryRes.ok) {
        const stats = await categoryRes.json()
        console.log('카테고리 통계:', stats)
        setCategoryStats(stats)
      } else {
        console.error('카테고리 통계 가져오기 실패:', categoryRes.status)
      }
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 그래프 최대값 계산
  const maxCount = categoryStats
    ? Math.max(...categoryStats.categories.map((c) => c.count), 1)
    : 1

  // 카테고리 이름 단축
  const shortenCategory = (name: string) => {
    return name.replace('/', '\n')
  }

  // 키워드 폰트 크기 계산 (워드 클라우드 스타일)
  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 12
    const maxSize = 32
    const ratio = count / maxCount
    return minSize + (maxSize - minSize) * ratio
  }

  // 두 사각형이 겹치는지 확인
  const isOverlapping = (
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
    margin: number = 20 // 최소 간격
  ) => {
    return !(
      rect1.x + rect1.width + margin < rect2.x ||
      rect2.x + rect2.width + margin < rect1.x ||
      rect1.y + rect1.height + margin < rect2.y ||
      rect2.y + rect2.height + margin < rect1.y
    )
  }

  // 키워드 위치 계산 (충돌 방지)
  const calculatePositions = (keywords: KeywordStat[]) => {
    const positions: Array<{
      keyword: KeywordStat
      x: number
      y: number
      fontSize: number
    }> = []

    const containerWidth = 500
    const containerHeight = 280
    const padding = 20

    keywords.forEach((keyword, index) => {
      const fontSize = getFontSize(keyword.count, maxKeywordCount)
      const estimatedWidth = keyword.keyword.length * fontSize * 0.7
      const estimatedHeight = fontSize * 1.5

      let x: number = 0,
        y: number = 0
      let attempts = 0
      const maxAttempts = 200
      let found = false

      if (index === 0) {
        // 첫 번째는 중앙
        x = containerWidth / 2 - estimatedWidth / 2
        y = containerHeight / 2 - estimatedHeight / 2
        found = true
      } else {
        // 나선형으로 위치 찾기
        while (attempts < maxAttempts && !found) {
          const angle = attempts * 0.5
          const radius = 60 + attempts * 4

          x = containerWidth / 2 + Math.cos(angle) * radius - estimatedWidth / 2
          y =
            containerHeight / 2 +
            Math.sin(angle) * radius * 0.7 -
            estimatedHeight / 2

          // 경계 체크
          if (
            x >= padding &&
            x + estimatedWidth <= containerWidth - padding &&
            y >= padding &&
            y + estimatedHeight <= containerHeight - padding
          ) {
            // 충돌 체크
            const hasCollision = positions.some((pos) =>
              isOverlapping(
                { x, y, width: estimatedWidth, height: estimatedHeight },
                {
                  x: pos.x,
                  y: pos.y,
                  width: pos.keyword.keyword.length * pos.fontSize * 0.7,
                  height: pos.fontSize * 1.5,
                }
              )
            )

            if (!hasCollision) {
              found = true
            }
          }

          attempts++
        }
      }

      if (found) {
        positions.push({ keyword, x, y, fontSize })
      }
    })

    return positions
  }

  const maxKeywordCount = Math.max(...popularKeywords.map((k) => k.count), 1)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-linear-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <BarChart3 size={32} className="text-blue-600" />
        보안 뉴스 검색 트렌드
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 오늘의 뉴스 현황 그래프 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              오늘의 뉴스 현황
            </h3>
            <button
              onClick={fetchStats}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              새로고침
            </button>
          </div>

          {!categoryStats ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categoryStats.categories.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">데이터가 없습니다</p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-right">
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
                <span className="ml-3 text-lg font-bold text-blue-600">
                  {categoryStats.total.toLocaleString()}건
                </span>
              </div>

              <div className="relative" style={{ height: '320px' }}>
                {/* Y축 레이블 */}
                <div
                  className="absolute left-0 top-0 w-16 flex flex-col justify-between text-xs text-gray-500 text-right pr-2"
                  style={{ height: 'calc(100% - 60px)' }}
                >
                  <span>{maxCount.toLocaleString()}</span>
                  <span>{Math.floor(maxCount * 0.75).toLocaleString()}</span>
                  <span>{Math.floor(maxCount * 0.5).toLocaleString()}</span>
                  <span>{Math.floor(maxCount * 0.25).toLocaleString()}</span>
                  <span>0</span>
                </div>

                {/* 그래프 영역 */}
                <div
                  className="absolute left-16 right-0 top-0"
                  style={{ height: 'calc(100% - 60px)' }}
                >
                  <div className="w-full h-full flex items-end justify-between gap-2">
                    {categoryStats.categories.map((category, index) => {
                      const heightPercent =
                        maxCount > 0 ? (category.count / maxCount) * 100 : 0
                      return (
                        <div
                          key={index}
                          className="flex-1 h-full flex flex-col justify-end items-center"
                        >
                          {/* 퍼센티지 표시 */}
                          {category.count > 0 && (
                            <div className="text-xs font-bold text-gray-700 mb-1">
                              {category.count}
                            </div>
                          )}
                          {/* 막대 */}
                          <div
                            className="w-full bg-linear-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 relative group cursor-pointer"
                            style={{
                              height: `${Math.max(heightPercent, 1)}%`,
                              minHeight: category.count > 0 ? '20px' : '0px',
                            }}
                          >
                            {/* 툴팁 */}
                            {category.count > 0 && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                {category.category}:{' '}
                                {category.count.toLocaleString()}건
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* X축 레이블 */}
                <div
                  className="absolute left-16 right-0 flex justify-between gap-2"
                  style={{ bottom: '0', height: '60px' }}
                >
                  {categoryStats.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex-1 flex items-start justify-center pt-2"
                    >
                      <span className="text-[10px] text-gray-600 text-center leading-tight whitespace-pre-line">
                        {shortenCategory(category.category)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 연관어 분석 (워드 클라우드 스타일) */}
        <div className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg border-2 border-blue-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            연관어 분석
          </h3>

          {popularKeywords.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-gray-400 font-medium">
                  검색 데이터가 없습니다.
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  검색을 시작해보세요!
                </p>
              </div>
            </div>
          ) : (
            <div
              className="h-[280px] overflow-hidden relative"
              style={{ width: '500px', margin: '0 auto' }}
            >
              {calculatePositions(
                popularKeywords.sort((a, b) => b.count - a.count).slice(0, 8) // 최대 8개로 줄임
              ).map((pos, index) => {
                const colors = [
                  'text-red-600 hover:text-red-700',
                  'text-blue-600 hover:text-blue-700',
                  'text-green-600 hover:text-green-700',
                  'text-purple-600 hover:text-purple-700',
                  'text-orange-600 hover:text-orange-700',
                  'text-pink-600 hover:text-pink-700',
                  'text-indigo-600 hover:text-indigo-700',
                  'text-teal-600 hover:text-teal-700',
                ]
                const color = colors[index % colors.length]

                return (
                  <span
                    key={index}
                    className={`${color} font-extrabold cursor-pointer transition-all hover:scale-110 hover:z-10 group absolute whitespace-nowrap`}
                    style={{
                      fontSize: `${pos.fontSize}px`,
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      lineHeight: '1.2',
                    }}
                  >
                    {pos.keyword.keyword}
                    {/* 검색 수 뱃지 */}
                    <span className="absolute -top-1 -right-1 bg-linear-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {pos.keyword.count}회
                    </span>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 실시간 통계 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">총 검색 수</p>
          <p className="text-2xl font-bold text-blue-600">
            {popularKeywords
              .reduce((sum, k) => sum + k.count, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">인기 키워드</p>
          <p className="text-2xl font-bold text-green-600">
            {popularKeywords.length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">오늘 뉴스</p>
          <p className="text-2xl font-bold text-purple-600">
            {categoryStats?.total.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
