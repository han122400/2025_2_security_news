'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeywordStat {
  keyword: string
  count: number
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [popularKeywords, setPopularKeywords] = useState<KeywordStat[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 실시간 인기 검색어 가져오기
  useEffect(() => {
    const fetchPopularKeywords = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(
          `${apiUrl}/api/stats/popular-keywords?limit=6`
        )
        if (response.ok) {
          const data = await response.json()
          setPopularKeywords(data)
        }
      } catch (error) {
        console.error('인기 검색어 로드 실패:', error)
        // 실패 시 기본 키워드 사용
        setPopularKeywords([
          { keyword: '랜섬웨어', count: 0 },
          { keyword: '해킹', count: 0 },
          { keyword: 'DDoS', count: 0 },
          { keyword: '개인정보', count: 0 },
          { keyword: '악성코드', count: 0 },
          { keyword: '제로데이', count: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPopularKeywords()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const keyword = searchQuery.trim()

      // 검색 키워드 로깅
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        await fetch(
          `${apiUrl}/api/stats/search?keyword=${encodeURIComponent(keyword)}`,
          {
            method: 'POST',
          }
        )
      } catch (error) {
        // 로깅 실패는 무시
      }

      router.push(`/search?q=${encodeURIComponent(keyword)}`)
    }
  }

  return (
    <div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative py-8 px-6 sm:px-8 lg:px-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">보안 뉴스 검색</h2>
          <p className="text-blue-100 text-lg">
            최신 사이버 보안 정보를 빠르게 찾아보세요
          </p>
        </div>

        {/* 검색 폼 */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="해킹, 랜섬웨어, 보안 취약점 등 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-32 py-5 border-0 rounded-xl text-lg text-gray-900 bg-white shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-2 my-2 px-8 flex items-center justify-center bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                검색
              </button>
            </div>
          </form>

          {/* 인기 검색어 */}
          <div className="mt-6 text-center">
            <p className="text-blue-100 text-sm mb-3">
              {loading ? '로딩 중...' : '실시간 인기 검색어'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {loading ? (
                <div className="text-blue-100 text-sm">불러오는 중...</div>
              ) : popularKeywords.length === 0 ? (
                <div className="text-blue-100 text-sm">
                  검색 기록이 없습니다
                </div>
              ) : (
                popularKeywords.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.keyword)
                      router.push(
                        `/search?q=${encodeURIComponent(item.keyword)}`
                      )
                    }}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <span className="text-yellow-300 font-bold">
                      {index + 1}
                    </span>
                    #{item.keyword}
                    {item.count > 0 && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
    </div>
  )
}
