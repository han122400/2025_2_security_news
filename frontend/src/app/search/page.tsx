'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  MessageCircle,
  Search,
} from 'lucide-react'
import Header from '@/components/Header'
import Link from 'next/link'

// 네이버 뉴스 API 응답 타입
interface NaverNewsItem {
  title: string // HTML 태그 포함
  originallink: string
  link: string
  description: string // HTML 태그 포함
  pubDate: string
}

interface NaverNewsResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverNewsItem[]
}

interface BookmarkItem {
  id: string
  news_id: number
  news_title: string
  news_category: string
  news_link?: string
  created_at: string
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NaverNewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [bookmarkedLinks, setBookmarkedLinks] = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null)
  const itemsPerPage = 30

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // HTML 태그 제거 함수
  const removeHtmlTags = (text: string) => {
    return text.replace(/<\/?[^>]+(>|$)/g, '')
  }

  // 날짜 포맷 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins}분 전`
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR')
    }
  }

  // 로그인 상태 및 북마크 목록 확인
  useEffect(() => {
    const checkUserAndBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('bookmarks')
          .eq('id', user.id)
          .single()

        if (profile?.bookmarks) {
          setBookmarks(profile.bookmarks)
          setBookmarkedLinks(
            new Set(
              profile.bookmarks
                .map((b: BookmarkItem) => b.news_link)
                .filter(Boolean)
            )
          )
        }
      }
    }

    checkUserAndBookmarks()
  }, [])

  // 북마크 토글 핸들러
  const handleBookmarkToggle = async (
    e: React.MouseEvent,
    news: NaverNewsItem,
    index: number
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('북마크 기능을 사용하려면 로그인이 필요합니다.')
      return
    }

    const newsLink = news.originallink
    setBookmarkLoading(newsLink)

    try {
      if (bookmarkedLinks.has(newsLink)) {
        // 북마크 삭제
        const newBookmarks = bookmarks.filter((b) => b.news_link !== newsLink)

        const { error } = await supabase
          .from('user_profiles')
          .update({
            bookmarks: newBookmarks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (!error) {
          setBookmarks(newBookmarks)
          setBookmarkedLinks((prev) => {
            const newSet = new Set(prev)
            newSet.delete(newsLink)
            return newSet
          })
        }
      } else {
        // 북마크 추가
        const newBookmark: BookmarkItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          news_id: index,
          news_title: removeHtmlTags(news.title),
          news_category: '검색결과',
          news_link: newsLink,
          created_at: new Date().toISOString(),
        }

        const newBookmarks = [...bookmarks, newBookmark]

        const { error } = await supabase
          .from('user_profiles')
          .update({
            bookmarks: newBookmarks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (!error) {
          setBookmarks(newBookmarks)
          setBookmarkedLinks((prev) => new Set(prev).add(newsLink))
        }
      }
    } catch (error) {
      console.error('북마크 처리 오류:', error)
    } finally {
      setBookmarkLoading(null)
    }
  }

  // 토론하기 핸들러
  const handleDiscuss = (
    e: React.MouseEvent,
    news: NaverNewsItem,
    index: number
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('토론하기 기능을 사용하려면 로그인이 필요합니다.')
      return
    }

    const params = new URLSearchParams({
      newsId: index.toString(),
      newsTitle: removeHtmlTags(news.title),
      newsCategory: '검색결과',
      newsLink: news.originallink,
    })
    router.push(`/community?${params.toString()}`)
  }

  // 뉴스 검색
  useEffect(() => {
    const fetchNews = async () => {
      if (!query) {
        setSearchResults([])
        setTotal(0)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const start = (currentPage - 1) * itemsPerPage + 1
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(
          `${apiUrl}/api/news/search?query=${encodeURIComponent(
            query
          )}&display=${itemsPerPage}&start=${start}&sort=date`
        )

        if (!response.ok) {
          throw new Error('뉴스를 불러오는데 실패했습니다.')
        }

        const data: NaverNewsResponse = await response.json()
        setSearchResults(data.items)
        setTotal(data.total)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        )
        setSearchResults([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [query, currentPage])

  // 검색어 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  // 페이지네이션 계산
  // 네이버 API는 start 파라미터가 최대 1000까지만 지원
  const maxNaverStart = 1000
  const maxDisplayableItems = maxNaverStart // 최대 1000개까지만 표시
  const displayTotal = Math.min(total, maxDisplayableItems)
  const totalPages = Math.ceil(displayTotal / itemsPerPage)
  const maxPageButtons = 10
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header hideCategories={true} />

      {/* 검색바와 커뮤니티 버튼 */}
      <div className="bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 py-5">
            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="뉴스 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-[480px] pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-1 my-1 px-4 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  검색
                </button>
              </div>
            </form>

            {/* 구분선 */}
            <div className="w-px h-6 bg-gray-300" />

            {/* 보안 커뮤니티 버튼 */}
            <Link
              href="/community"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 px-4 py-1.5 text-sm font-medium transition-all rounded-full flex items-center gap-1.5 shadow-md hover:shadow-lg"
            >
              <MessageCircle size={16} />
              보안 커뮤니티
            </Link>
          </div>
        </div>
      </div>

      {/* 가운데 구분선 */}
      <div className="flex justify-center">
        <div className="w-[1000px] border-t border-gray-300"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* 검색 정보 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">검색 결과</h1>
          {query && (
            <p className="text-lg text-gray-600">
              &apos;{query}&apos;에 대한 검색 결과{' '}
              <span className="font-semibold text-blue-600">
                {displayTotal.toLocaleString()}건
              </span>
              {total > maxDisplayableItems && (
                <span className="text-sm text-gray-500 ml-2">
                  (전체 {total.toLocaleString()}건 중 최대 {maxDisplayableItems}
                  건까지 표시)
                </span>
              )}
            </p>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">검색 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              오류가 발생했습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        )}

        {/* 검색 결과 */}
        {!loading && !error && (
          <>
            {!query ? (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  검색어를 입력해주세요
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  관심 있는 보안 뉴스를 검색해보세요.
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  검색 결과가 없습니다
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  다른 검색어로 다시 시도해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.map((news, index) => (
                  <div
                    key={index}
                    className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                  >
                    <a
                      href={news.originallink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="text-xl font-bold text-gray-900 mb-2 flex-1"
                          dangerouslySetInnerHTML={{
                            __html: news.title,
                          }}
                        />
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(news.pubDate)}
                          </span>
                          {user && (
                            <>
                              <button
                                onClick={(e) => handleDiscuss(e, news, index)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                title="토론하기"
                              >
                                <MessageSquare
                                  size={18}
                                  className="text-gray-400 hover:text-purple-600"
                                />
                              </button>
                              <button
                                onClick={(e) =>
                                  handleBookmarkToggle(e, news, index)
                                }
                                disabled={bookmarkLoading === news.originallink}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                {bookmarkedLinks.has(news.originallink) ? (
                                  <BookmarkCheck
                                    size={18}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <Bookmark
                                    size={18}
                                    className="text-gray-400 hover:text-blue-600"
                                  />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: news.description,
                        }}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600 hover:underline">
                          원문 보기 →
                        </span>
                      </div>
                    </a>
                  </div>
                ))}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {/* 이전 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {startPage > 1 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-4 py-2 rounded-md font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="px-4 py-2 rounded-md font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* 다음 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SearchContent />
    </Suspense>
  )
}
