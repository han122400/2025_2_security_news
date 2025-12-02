'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, Mousewheel } from 'swiper/modules'
import { Bookmark, BookmarkCheck, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Article {
  id: number
  title: string
  summary: string
  date: string
  source: string
  image?: string
  category: string
  link?: string
}

interface BookmarkItem {
  id: string
  news_id: number
  news_title: string
  news_category: string
  news_link?: string
  created_at: string
}

interface NewsSectionProps {
  id: string
  title: string
  description: string
  articles: Article[]
}

export default function NewsSection({
  id,
  title,
  description,
  articles,
}: NewsSectionProps) {
  const router = useRouter()
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null)

  // 로그인 상태 및 북마크 목록 확인
  useEffect(() => {
    const checkUserAndBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // user_profiles에서 북마크 가져오기
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('bookmarks')
          .eq('id', user.id)
          .single()

        if (profile?.bookmarks) {
          setBookmarks(profile.bookmarks)
          setBookmarkedIds(
            new Set(profile.bookmarks.map((b: BookmarkItem) => b.news_id))
          )
        }
      }
    }

    checkUserAndBookmarks()
  }, [])

  // items.length가 최대 표시 슬라이드 수(현재 3)보다 클 때만 loop 활성화
  const enableLoop = articles.length > 3

  // 기사 클릭 핸들러
  const handleArticleClick = (link?: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  // 북마크 토글 핸들러
  const handleBookmarkToggle = async (
    e: React.MouseEvent,
    article: Article
  ) => {
    e.stopPropagation() // 기사 클릭 이벤트 방지

    if (!user) {
      alert('북마크 기능을 사용하려면 로그인이 필요합니다.')
      return
    }

    setBookmarkLoading(article.id)

    try {
      if (bookmarkedIds.has(article.id)) {
        // 북마크 삭제 - 해당 news_id를 제외한 배열로 업데이트
        const newBookmarks = bookmarks.filter((b) => b.news_id !== article.id)

        const { error } = await supabase
          .from('user_profiles')
          .update({
            bookmarks: newBookmarks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (!error) {
          setBookmarks(newBookmarks)
          setBookmarkedIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(article.id)
            return newSet
          })
        }
      } else {
        // 북마크 추가
        const newBookmark: BookmarkItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          news_id: article.id,
          news_title: article.title,
          news_category: article.category,
          news_link: article.link,
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
          setBookmarkedIds((prev) => new Set(prev).add(article.id))
        }
      }
    } catch (error) {
      console.error('북마크 처리 오류:', error)
    } finally {
      setBookmarkLoading(null)
    }
  }

  // 토론하기 핸들러
  const handleDiscuss = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation() // 기사 클릭 이벤트 방지

    if (!user) {
      alert('토론하기 기능을 사용하려면 로그인이 필요합니다.')
      return
    }

    // 뉴스 정보를 URL 파라미터로 전달하여 커뮤니티 페이지로 이동
    const params = new URLSearchParams({
      newsId: article.id.toString(),
      newsTitle: article.title,
      newsCategory: article.category,
      newsLink: article.link || '',
    })
    router.push(`/community?${params.toString()}`)
  }

  // 기사가 없을 때 처리
  if (!articles || articles.length === 0) {
    return (
      <section id={id} className="mb-16 scroll-mt-32">
        <div className="border-l-4 border-blue-600 pl-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-500">현재 표시할 뉴스가 없습니다.</p>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="mb-16 scroll-mt-32">
      <div className="border-l-4 border-blue-600 pl-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="relative">
        <Swiper
          // 💡 수정 1: Navigation 모듈을 제거하고 싶다면 아래 주석을 풀어주세요.
          modules={[Pagination, Autoplay, Mousewheel]}
          spaceBetween={24}
          slidesPerView={1}
          mousewheel={true}
          // 💡 수정 2-2: 항목 개수에 따라 loop를 조건부 활성화
          loop={enableLoop}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="news-swiper"
        >
          {articles.map((article) => (
            <SwiperSlide key={article.id}>
              <article
                onClick={() => handleArticleClick(article.link)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full"
              >
                {/* 이미지 */}
                {article.image && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-semibold text-white bg-blue-600 px-3 py-1 rounded-full">
                        {/* 카테고리 표시 */}
                        {article.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {!article.image && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {article.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {article.date}
                        </span>
                        {user && (
                          <>
                            <button
                              onClick={(e) => handleDiscuss(e, article)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              title="토론하기"
                            >
                              <MessageSquare
                                size={18}
                                className="text-gray-400 hover:text-purple-600"
                              />
                            </button>
                            <button
                              onClick={(e) => handleBookmarkToggle(e, article)}
                              disabled={bookmarkLoading === article.id}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {bookmarkedIds.has(article.id) ? (
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
                  )}

                  {article.image && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        {article.date}
                      </span>
                      {user && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDiscuss(e, article)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="토론하기"
                          >
                            <MessageSquare
                              size={18}
                              className="text-gray-400 hover:text-purple-600"
                            />
                          </button>
                          <button
                            onClick={(e) => handleBookmarkToggle(e, article)}
                            disabled={bookmarkLoading === article.id}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            {bookmarkedIds.has(article.id) ? (
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
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
