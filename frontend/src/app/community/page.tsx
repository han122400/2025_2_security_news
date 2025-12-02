'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import {
  Send,
  ArrowLeft,
  Users,
  MessageCircle,
  Reply,
  X,
  ExternalLink,
  Trash2,
} from 'lucide-react'

interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  user_email: string
  content: string
  reply_to?: string | null
  reply_to_user_name?: string | null
  reply_to_content?: string | null
  news_id?: string | null
  news_title?: string | null
  news_category?: string | null
  news_link?: string | null
  created_at: string
}

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null
  )
  const [newsContext, setNewsContext] = useState<{
    newsId: string
    newsTitle: string
    newsCategory: string
    newsLink: string
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 스크롤을 최하단으로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // URL 파라미터에서 뉴스 정보 가져오기
  useEffect(() => {
    const newsId = searchParams.get('newsId')
    const newsTitle = searchParams.get('newsTitle')
    const newsCategory = searchParams.get('newsCategory')
    const newsLink = searchParams.get('newsLink')

    if (newsId && newsTitle && newsCategory) {
      setNewsContext({
        newsId,
        newsTitle,
        newsCategory,
        newsLink: newsLink || '',
      })
      // 입력창에 포커스
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [searchParams])

  useEffect(() => {
    // 사용자 인증 확인
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 사용자 이름 가져오기
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      setUserName(profile?.name || user.email?.split('@')[0] || '익명')

      // 메시지 로드
      await loadMessages()
      setLoading(false)
    }

    checkAuth()

    // 실시간 메시지 구독
    const channel = supabase
      .channel('community_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const deletedId = payload.old.id
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user?.id })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('이 메시지를 삭제하시겠습니까?')) return

    setDeletingMessageId(messageId)

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user?.id)

    if (error) {
      alert('메시지 삭제에 실패했습니다.')
      console.error('Delete error:', error)
    }

    setDeletingMessageId(null)
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (data && !error) {
      setMessages(data)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || sending) return

    setSending(true)

    const messageData: any = {
      user_id: user.id,
      user_name: userName,
      user_email: user.email,
      content: newMessage.trim(),
    }

    // 뉴스 정보 추가
    if (newsContext) {
      messageData.news_id = newsContext.newsId
      messageData.news_title = newsContext.newsTitle
      messageData.news_category = newsContext.newsCategory
      messageData.news_link = newsContext.newsLink
    }

    // 답장 정보 추가
    if (replyingTo) {
      messageData.reply_to = replyingTo.id
      messageData.reply_to_user_name = replyingTo.user_name
      messageData.reply_to_content = replyingTo.content
    }

    const { error } = await supabase.from('chat_messages').insert(messageData)

    if (!error) {
      // 답장인 경우 이메일 전송 API 호출
      if (replyingTo) {
        try {
          await fetch('http://localhost:8000/api/email/process-pending', {
            method: 'POST',
          })
        } catch (err) {
          console.error('Failed to process email notifications:', err)
        }
      }

      setNewMessage('')
      setReplyingTo(null)
      setNewsContext(null)
      inputRef.current?.focus()
    } else {
      alert('메시지 전송에 실패했습니다.')
    }

    setSending(false)
  }

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 날짜가 바뀌었는지 확인
  const isNewDay = (current: string, previous?: string) => {
    if (!previous) return true
    return formatDate(current) !== formatDate(previous)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅방에 입장 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600" />
                보안 커뮤니티
              </h1>
              <p className="text-xs text-gray-500">
                보안에 대해 자유롭게 토론하세요
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-green-500" />
            <span>{onlineCount}명 접속 중</span>
          </div>
        </div>

        {/* 뉴스 컨텍스트 표시 */}
        {newsContext && (
          <div className="border-t border-gray-200 bg-linear-to-r from-purple-50 to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                      {newsContext.newsCategory}
                    </span>
                    <span className="text-xs text-gray-500">뉴스 토론</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {newsContext.newsTitle}
                  </h3>
                  {newsContext.newsLink && (
                    <a
                      href={newsContext.newsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      기사 보기 <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => {
                    setNewsContext(null)
                    setNewMessage('')
                  }}
                  className="shrink-0 p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 채팅 메시지 영역 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 메시지가 없습니다.</p>
              <p className="text-gray-400 text-sm">
                첫 번째 메시지를 보내보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isOwnMessage = message.user_id === user?.id
                const showDateDivider = isNewDay(
                  message.created_at,
                  messages[index - 1]?.created_at
                )

                return (
                  <div key={message.id}>
                    {/* 날짜 구분선 */}
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    )}

                    {/* 메시지 */}
                    <div
                      className={`flex ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          isOwnMessage ? 'order-2' : 'order-1'
                        }`}
                      >
                        {/* 사용자 이름 (본인 메시지가 아닐 때만) */}
                        {!isOwnMessage && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">
                            {message.user_name}
                          </p>
                        )}

                        <div className="flex items-end gap-2">
                          {/* 시간 (본인 메시지일 때 왼쪽에) */}
                          {isOwnMessage && (
                            <span className="text-xs text-gray-400 self-end mb-1">
                              {formatTime(message.created_at)}
                            </span>
                          )}

                          {/* 메시지 버블 */}
                          <div className="relative group flex-1">
                            {/* 뉴스 카드가 있는 경우 */}
                            {message.news_id && (
                              <div
                                className={`mb-2 rounded-lg border ${
                                  isOwnMessage
                                    ? 'bg-white border-blue-200'
                                    : 'bg-white border-gray-200'
                                } overflow-hidden shadow-sm`}
                              >
                                <div className="p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded">
                                      {message.news_category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      📰 뉴스 토론
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-3">
                                    {message.news_title}
                                  </h4>
                                  {message.news_link && (
                                    <a
                                      href={message.news_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      기사 보기 <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                              }`}
                            >
                              {/* 답장된 메시지 표시 */}
                              {message.reply_to && (
                                <div
                                  className={`mb-2 pb-2 border-l-2 pl-2 ${
                                    isOwnMessage
                                      ? 'border-blue-300 bg-blue-500/20'
                                      : 'border-gray-300 bg-gray-100'
                                  } rounded p-2`}
                                >
                                  <p
                                    className={`text-xs font-semibold mb-1 ${
                                      isOwnMessage
                                        ? 'text-blue-100'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {message.reply_to_user_name}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      isOwnMessage
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                    } line-clamp-2`}
                                  >
                                    {message.reply_to_content}
                                  </p>
                                </div>
                              )}

                              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                {message.content}
                              </p>
                            </div>

                            {/* 답장/삭제 버튼 (hover 시 표시) */}
                            <div
                              className={`absolute ${
                                message.news_id
                                  ? 'top-16'
                                  : 'top-1/2 -translate-y-1/2'
                              } ${
                                isOwnMessage
                                  ? 'left-0 -translate-x-10'
                                  : 'right-0 translate-x-10'
                              } opacity-0 group-hover:opacity-100 transition-opacity flex ${
                                isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                              } gap-1 z-10`}
                            >
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md"
                                title="답장하기"
                              >
                                <Reply size={14} className="text-gray-600" />
                              </button>

                              {isOwnMessage && (
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  disabled={deletingMessageId === message.id}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="삭제하기"
                                >
                                  <Trash2 size={14} className="text-red-600" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 시간 (다른 사람 메시지일 때 오른쪽에) */}
                          {!isOwnMessage && (
                            <span className="text-xs text-gray-400 self-end mb-1">
                              {formatTime(message.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* 메시지 입력 영역 */}
      <footer className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* 답장 중인 메시지 표시 */}
          {replyingTo && (
            <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Reply size={14} className="text-blue-600 shrink-0" />
                  <p className="text-xs font-semibold text-blue-900">
                    {replyingTo.user_name}님에게 답장
                  </p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {replyingTo.content}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="shrink-0 p-1 hover:bg-blue-100 rounded-full transition-colors"
                title="답장 취소"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* 뉴스 컨텍스트 표시 (입력창 위) */}
          {newsContext && (
            <div className="mb-3 bg-linear-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded">
                      {newsContext.newsCategory}
                    </span>
                    <span className="text-xs text-gray-600">📰 뉴스 토론</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {newsContext.newsTitle}
                  </h4>
                  {newsContext.newsLink && (
                    <a
                      href={newsContext.newsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      기사 보기 <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setNewsContext(null)}
                  className="shrink-0 p-1 hover:bg-white/50 rounded-full transition-colors"
                  title="뉴스 컨텍스트 제거"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                newsContext
                  ? '이 뉴스에 대한 의견을 남겨주세요...'
                  : replyingTo
                  ? `${replyingTo.user_name}님에게 답장하기...`
                  : '메시지를 입력하세요...'
              }
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-500"
              maxLength={500}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">
            {userName}(으)로 참여 중
          </p>
        </div>
      </footer>
    </div>
  )
}
