'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import {
  LogOut,
  Mail,
  Calendar,
  User as UserIcon,
  Bell,
  BellOff,
  Bookmark,
  MessageCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { useCategoryFilter } from '@/contexts/CategoryFilterContext'

interface BookmarkItem {
  id: string
  news_id: number
  news_title: string
  news_category: string
  news_link?: string
  created_at: string
}

interface ChatMessage {
  id: string
  content: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  name: string
  category_settings: { [key: string]: boolean }
  email_notification: boolean
  comments: ChatMessage[]
  bookmarks: BookmarkItem[]
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'chats'>('bookmarks')
  const { refreshSettings } = useCategoryFilter()

  useEffect(() => {
    // 사용자 정보 및 프로필 가져오기
    const getUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 프로필 데이터 가져오기
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.access_token) {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          const response = await fetch(`${apiUrl}/api/user/profile`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (response.ok) {
            const profileData = await response.json()
            setProfile(profileData)
          }
        }

        // user_profiles에서 북마크 가져오기
        const { data: profileWithBookmarks } = await supabase
          .from('user_profiles')
          .select('bookmarks')
          .eq('id', user.id)
          .single()

        if (profileWithBookmarks?.bookmarks) {
          // 최신순 정렬
          const sortedBookmarks = [...profileWithBookmarks.bookmarks].sort(
            (a: BookmarkItem, b: BookmarkItem) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          setBookmarks(sortedBookmarks)
        }

        // 채팅 메시지 가져오기
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('id, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (chatData) {
          setChatMessages(chatData)
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
      }

      setLoading(false)
    }

    getUserAndProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleCategory = async (category: string) => {
    if (!profile) return

    setUpdating(true)
    try {
      const newSettings = {
        ...profile.category_settings,
        [category]: !profile.category_settings[category],
      }

      console.log('카테고리 업데이트 시도:', category, newSettings)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/user/profile/categories`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ category_settings: newSettings }),
        })

        console.log('카테고리 응답 상태:', response.status)
        const responseData = await response.json()
        console.log('카테고리 응답 데이터:', responseData)

        if (response.ok) {
          setProfile({ ...profile, category_settings: newSettings })
          // Context의 카테고리 설정도 새로고침
          await refreshSettings()
          console.log('카테고리 업데이트 성공')
        } else {
          console.error('카테고리 업데이트 실패:', responseData)
          alert('카테고리 설정 업데이트에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('카테고리 설정 업데이트 오류:', error)
      alert('카테고리 설정 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  // 북마크 삭제
  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!user) return

    try {
      // 해당 북마크를 제외한 새 배열 생성
      const newBookmarks = bookmarks.filter((b) => b.id !== bookmarkId)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          bookmarks: newBookmarks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (!error) {
        setBookmarks(newBookmarks)
      }
    } catch (error) {
      console.error('북마크 삭제 오류:', error)
    }
  }

  // 시간 포맷
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleEmailNotification = async () => {
    if (!profile) return

    setUpdating(true)
    try {
      const newValue = !profile.email_notification

      console.log('알림 설정 업데이트 시도:', newValue)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(
          `${apiUrl}/api/user/profile/email-notification`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ email_notification: newValue }),
          }
        )

        console.log('알림 응답 상태:', response.status)
        const responseData = await response.json()
        console.log('알림 응답 데이터:', responseData)

        if (response.ok) {
          setProfile({ ...profile, email_notification: newValue })
          console.log('알림 설정 업데이트 성공')
        } else {
          console.error('알림 설정 업데이트 실패:', responseData)
          alert('알림 설정 업데이트에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error)
      alert('알림 설정 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정삭제') {
      alert('정확히 "계정삭제"를 입력해주세요.')
      return
    }

    setIsDeleting(true)
    try {
      // Supabase에서 사용자 계정 삭제
      const { error } = await supabase.rpc('delete_user')

      if (error) {
        // RPC 함수가 없는 경우 auth.admin을 통한 삭제 시도
        console.error('계정 삭제 오류:', error)
        alert('계정 삭제 중 오류가 발생했습니다. 관리자에게 문의해주세요.')
      } else {
        // 삭제 성공 시 로그아웃 및 홈으로 이동
        await supabase.auth.signOut()
        alert('계정이 성공적으로 삭제되었습니다.')
        router.push('/')
      }
    } catch (error) {
      console.error('계정 삭제 오류:', error)
      alert('계정 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setDeleteConfirmText('')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 50%, #EEF2FF 100%)',
        }}
      >
        <div style={{ textAlign: 'center', color: '#6B7280' }}>로딩 중...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 50%, #EEF2FF 100%)',
        padding: '3rem 1rem',
      }}
    >
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* 헤더 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                개인 설정
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                계정 정보 및 설정을 관리하세요
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                border: '1px solid #DC2626',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#DC2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DC2626'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = '#DC2626'
              }}
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>

        {/* 사용자 정보 카드 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1.5rem',
            }}
          >
            계정 정보
          </h2>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* 이름 */}
            {user.user_metadata?.name && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'linear-gradient(to right, #8B5CF6, #7C3AED)',
                    borderRadius: '0.5rem',
                  }}
                >
                  <UserIcon size={20} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    이름
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      color: '#111827',
                      fontWeight: '500',
                    }}
                  >
                    {user.user_metadata.name}
                  </div>
                </div>
              </div>
            )}

            {/* 이메일 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#F9FAFB',
                borderRadius: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(to right, #2563EB, #4F46E5)',
                  borderRadius: '0.5rem',
                }}
              >
                <Mail size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  이메일
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    color: '#111827',
                    fontWeight: '500',
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* 가입일 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#F9FAFB',
                borderRadius: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(to right, #10B981, #059669)',
                  borderRadius: '0.5rem',
                }}
              >
                <Calendar size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  가입일
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    color: '#111827',
                    fontWeight: '500',
                  }}
                >
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 관심 키워드 카드 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1.5rem',
            }}
          >
            보안 뉴스 카테고리
          </h2>

          {/* 첫 번째 줄 - 5개 키워드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            {[
              '사이버보안',
              '해킹/침해사고',
              '개인정보보호',
              'IT/보안 트렌드',
              '악성코드/피싱',
            ].map((keyword, index) => {
              const isFlipped = profile
                ? !profile.category_settings[keyword]
                : false
              return (
                <div
                  key={index}
                  style={{
                    perspective: '1000px',
                    height: '80px',
                  }}
                >
                  <div
                    onClick={() => toggleCategory(keyword)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.6s',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* 앞면 */}
                    <div
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow =
                          '0 8px 16px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9))',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#FFFFFF',
                          lineHeight: '1.4',
                        }}
                      >
                        {keyword}
                      </div>
                    </div>
                    {/* 뒷면 */}
                    <div
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          'rotateY(180deg) scale(1.05)'
                        e.currentTarget.style.boxShadow =
                          '0 8px 16px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          'rotateY(180deg) scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        border: '2px solid #D1D5DB',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#6B7280',
                          lineHeight: '1.4',
                        }}
                      >
                        {keyword}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 두 번째 줄 - 5개 키워드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1rem',
            }}
          >
            {[
              '보안제품/서비스',
              '인증·암호화',
              '네트워크보안',
              '정책·제도',
              '데이터보안',
            ].map((keyword, index) => {
              const isFlipped = profile
                ? !profile.category_settings[keyword]
                : false
              return (
                <div
                  key={index}
                  style={{
                    perspective: '1000px',
                    height: '80px',
                  }}
                >
                  <div
                    onClick={() => toggleCategory(keyword)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.6s',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* 앞면 */}
                    <div
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow =
                          '0 8px 16px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9))',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#FFFFFF',
                          lineHeight: '1.4',
                        }}
                      >
                        {keyword}
                      </div>
                    </div>
                    {/* 뒷면 */}
                    <div
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          'rotateY(180deg) scale(1.05)'
                        e.currentTarget.style.boxShadow =
                          '0 8px 16px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          'rotateY(180deg) scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        border: '2px solid #D1D5DB',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#6B7280',
                          lineHeight: '1.4',
                        }}
                      >
                        {keyword}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 북마크 & 채팅 기록 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* 탭 헤더 */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #E5E7EB',
            }}
          >
            <button
              onClick={() => setActiveTab('bookmarks')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontWeight: '600',
                color: activeTab === 'bookmarks' ? '#2563EB' : '#6B7280',
                borderBottom:
                  activeTab === 'bookmarks'
                    ? '2px solid #2563EB'
                    : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Bookmark size={18} />
              북마크 ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontWeight: '600',
                color: activeTab === 'chats' ? '#2563EB' : '#6B7280',
                borderBottom:
                  activeTab === 'chats'
                    ? '2px solid #2563EB'
                    : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <MessageCircle size={18} />
              채팅 기록 ({chatMessages.length})
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          {activeTab === 'bookmarks' ? (
            <div>
              {bookmarks.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#9CA3AF',
                  }}
                >
                  <Bookmark
                    size={48}
                    style={{ margin: '0 auto 1rem', opacity: 0.5 }}
                  />
                  <p>저장한 북마크가 없습니다.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    뉴스 카드의 북마크 버튼을 눌러 저장하세요.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#F9FAFB',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#2563EB',
                              background: '#EFF6FF',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                            }}
                          >
                            {bookmark.news_category}
                          </span>
                          <span
                            style={{ fontSize: '0.75rem', color: '#9CA3AF' }}
                          >
                            {formatDateTime(bookmark.created_at)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {bookmark.news_title}
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginLeft: '1rem',
                        }}
                      >
                        {bookmark.news_link && (
                          <a
                            href={bookmark.news_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.5rem',
                              background: '#EFF6FF',
                              borderRadius: '0.375rem',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          style={{
                            padding: '0.5rem',
                            background: '#FEF2F2',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {chatMessages.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#9CA3AF',
                  }}
                >
                  <MessageCircle
                    size={48}
                    style={{ margin: '0 auto 1rem', opacity: 0.5 }}
                  />
                  <p>채팅 기록이 없습니다.</p>
                  <Link
                    href="/community"
                    style={{
                      display: 'inline-block',
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#2563EB',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    커뮤니티 참여하기
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#F9FAFB',
                        borderRadius: '0.5rem',
                        borderLeft: '3px solid #2563EB',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#111827',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {message.content}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 설정 옵션 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1.5rem',
            }}
          >
            설정
          </h2>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <button
              onClick={toggleEmailNotification}
              disabled={updating || !profile}
              style={{
                padding: '1rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                background: 'white',
                textAlign: 'left',
                cursor: updating ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: updating ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!updating) {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = '#2563EB'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#E5E7EB'
              }}
            >
              <div
                style={{
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {profile?.email_notification ? (
                  <>
                    <Bell size={18} className="text-blue-600" />
                    알림 켜짐
                  </>
                ) : (
                  <>
                    <BellOff size={18} className="text-gray-400" />
                    알림 꺼짐
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                이메일 알림을{' '}
                {profile?.email_notification ? '비활성화' : '활성화'}합니다
              </div>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '1rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                background: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2'
                e.currentTarget.style.borderColor = '#DC2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#E5E7EB'
              }}
            >
              <div
                style={{
                  fontWeight: '500',
                  color: '#DC2626',
                  marginBottom: '0.25rem',
                }}
              >
                계정 삭제
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                계정을 영구적으로 삭제합니다
              </div>
            </button>
          </div>
        </div>

        {/* 하단 링크 */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>←</span> 홈으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowDeleteModal(false)
            setDeleteConfirmText('')
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '28rem',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#DC2626',
                marginBottom: '1rem',
              }}
            >
              계정 삭제 확인
            </h3>
            <p
              style={{
                color: '#6B7280',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              정말로 계정을 삭제하시겠습니까? 이 작업은{' '}
              <strong style={{ color: '#DC2626' }}>되돌릴 수 없으며</strong>,
              모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <p
              style={{
                color: '#374151',
                marginBottom: '1rem',
                fontWeight: '500',
              }}
            >
              계속하려면 아래에 "<strong>계정삭제</strong>"를 입력하세요:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="계정삭제"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#DC2626'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB'
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                disabled={isDeleting}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.background = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== '계정삭제'}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background:
                    isDeleting || deleteConfirmText !== '계정삭제'
                      ? '#FCA5A5'
                      : '#DC2626',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor:
                    isDeleting || deleteConfirmText !== '계정삭제'
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting && deleteConfirmText === '계정삭제') {
                    e.currentTarget.style.background = '#B91C1C'
                  }
                }}
                onMouseLeave={(e) => {
                  if (deleteConfirmText === '계정삭제') {
                    e.currentTarget.style.background = '#DC2626'
                  }
                }}
              >
                {isDeleting ? '삭제 중...' : '계정 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
