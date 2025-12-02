'use client'

import { useState } from 'react'
import {
  Heart,
  Instagram,
  MessageCircle,
  Copy,
  Share2,
  User,
  Users,
} from 'lucide-react'

interface NewsDetailClientProps {
  news: {
    id: string
    title: string
    category: string
    date: string
    author: string
    source: string
    image: string
    content: string
    relatedNews: Array<{
      id: number
      title: string
      image: string
    }>
  }
}

export default function NewsDetailClient({ news }: NewsDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'discussion'>(
    'comments'
  )

  return (
    <>
      {/* 왼쪽 액션 버튼들 */}
      <div className="hidden lg:flex flex-col gap-4 sticky top-32">
        {/* 공감 버튼 */}
        <button className="flex flex-col items-center gap-1 p-3 rounded-full bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all shadow-sm group">
          <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500" />
          <span className="text-xs text-gray-600 font-medium">123</span>
        </button>

        {/* 공유 버튼 */}
        <button className="flex flex-col items-center gap-1 p-3 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm group">
          <Share2 className="w-6 h-6 text-gray-600 group-hover:text-blue-500" />
          <span className="text-xs text-gray-600 font-medium">공유</span>
        </button>

        {/* 인스타그램 */}
        <button className="flex items-center justify-center p-3 rounded-full bg-white border border-gray-200 hover:border-pink-500 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white transition-all shadow-sm group">
          <Instagram className="w-6 h-6 text-gray-600 group-hover:text-white" />
        </button>

        {/* 카카오톡 */}
        <button className="flex items-center justify-center p-3 rounded-full bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all shadow-sm group">
          <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-yellow-600" />
        </button>

        {/* 복사 */}
        <button className="flex items-center justify-center p-3 rounded-full bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm group">
          <Copy className="w-6 h-6 text-gray-600 group-hover:text-gray-700" />
        </button>
      </div>

      {/* 모바일 액션 버튼들 */}
      <div className="lg:hidden flex justify-center gap-6 p-6 border-t border-gray-100">
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
          <span className="text-xs text-gray-600">123</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-5 h-5 text-gray-600" />
          <span className="text-xs text-gray-600">공유</span>
        </button>
        <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white transition-all">
          <Instagram className="w-5 h-5 text-gray-600 hover:text-white" />
        </button>
        <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <MessageCircle className="w-5 h-5 text-gray-600" />
        </button>
        <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Copy className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 탭 시스템 - 책갈피 스타일 */}
      <div className="max-w-4xl mx-auto mt-8">
        {/* 탭 버튼들 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            댓글 (24)
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === 'discussion'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            토론 (8)
          </button>
        </div>

        {/* 컨텐츠 박스 */}
        <div className="bg-white p-6 min-h-96 border border-gray-200 border-t-0">
          {activeTab === 'comments' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">댓글</h3>

              {/* 댓글 입력창 */}
              <div className="mb-6">
                <textarea
                  placeholder="댓글을 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  댓글 등록
                </button>
              </div>

              {/* 댓글 목록 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      사용자{i}{' '}
                      <span className="text-xs text-gray-500 ml-2">
                        2시간 전
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      좋은 정보 감사합니다! 보안에 대해 더 자세히 알고 싶어요.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">토론</h3>

              {/* 토론 입력창 */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="토론 주제를 입력하세요..."
                  className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="토론 내용을 입력하세요..."
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  토론 시작
                </button>
              </div>

              {/* 토론 목록 */}
              {[1, 2].map((i) => (
                <div key={i} className="border rounded p-4">
                  <h4 className="font-medium mb-2">보안 전략의 미래 방향성</h4>
                  <div className="text-xs text-gray-500 mb-2">
                    사용자{i} • 1시간 전 • 참여자 {i * 3}명
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    이번 DDoS 공격 증가에 대한 대응 방안에 대해 함께
                    논의해보세요.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    참여하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
