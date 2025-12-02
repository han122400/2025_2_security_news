'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Heart,
  Instagram,
  MessageCircle,
  Copy,
  Share2,
  User,
  ArrowLeft,
  Home,
  Users,
} from 'lucide-react'

// 임시 뉴스 상세 데이터 (실제로는 API에서 가져옴)
const getNewsDetail = (id: string) => {
  return {
    id,
    title: '국내 주요 기업 대상 DDoS 공격 급증',
    category: '사이버보안',
    date: '2024년 1월 15일',
    author: '보안뉴스 김철수 기자',
    source: '보안뉴스',
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop',
    content: `
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.
      
      한국인터넷진흥원(KISA)이 발표한 자료에 따르면, 금융기관과 전자상거래 업체를 중심으로 대규모 DDoS 공격이 집중되고 있습니다.
      
      보안 전문가들은 이러한 공격의 배경에 대해 다음과 같이 분석하고 있습니다:
      - 해킹 그룹의 공격 수법 진화
      - 공격 인프라 고도화
      - 랜섬웨어와 결합된 복합 공격 시도
      
      업계에서는 다층 방어 체계 구축과 24시간 모니터링을 강화해야 한다고 강조하고 있습니다.
      
    `,
    relatedNews: [
      {
        id: 2,
        title: '클라우드 보안 인증제도 개편안 발표',
        image:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      },
      {
        id: 3,
        title: '금융권 사이버 보안 투자 확대',
        image:
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      },
      {
        id: 31,
        title: '국가 사이버 안보 전략 발표',
        image:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      },
    ],
  }
}

function NewsDetailPageContent({ id }: { id: string }) {
  const news = getNewsDetail(id)
  const [activeTab, setActiveTab] = useState('comments')

  const newsIds = ['1', '2', '3', '31']
  const currentIndex = newsIds.indexOf(id)
  const prevId = currentIndex > 0 ? newsIds[currentIndex - 1] : null
  const nextId =
    currentIndex < newsIds.length - 1 ? newsIds[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 뉴스 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {news.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {news.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 text-sm">
            <span>{news.author}</span>
            <span className="hidden sm:inline">·</span>
            <span>{news.date}</span>
            <span className="hidden sm:inline">·</span>
            <span>{news.source}</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {/* 이전 버튼 */}
          <div className="hidden lg:block">
            <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-10">
              {prevId ? (
                <Link
                  href={`/news/${prevId}`}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors text-2xl shadow-lg hover:shadow-xl"
                  title="이전 뉴스"
                >
                  ←
                </Link>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-300 cursor-not-allowed text-2xl shadow-lg">
                  ←
                </div>
              )}
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="hidden lg:block">
            <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-10">
              {nextId ? (
                <Link
                  href={`/news/${nextId}`}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors text-2xl shadow-lg hover:shadow-xl"
                  title="다음 뉴스"
                >
                  →
                </Link>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-300 cursor-not-allowed text-2xl shadow-lg">
                  →
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-8 justify-center items-start">
            {/* 왼쪽 액션 버튼들 - 데스크톱만 */}
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
              <button className="flex items-center justify-center p-3 rounded-full bg-white border border-gray-200 hover:border-pink-500 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white transition-all shadow-sm group">
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

            {/* 뉴스 박스 */}
            <article className="max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* 대표 이미지 */}
              <div className="relative w-full h-80 overflow-hidden">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* 본문 내용 */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  {news.content.split('\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap"
                    >
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
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
                <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white transition-all">
                  <Instagram className="w-5 h-5 text-gray-600 hover:text-white" />
                </button>
                <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* 모바일 네비게이션 */}
              <div className="lg:hidden flex justify-between p-6 border-t border-gray-100 gap-4">
                {prevId ? (
                  <Link
                    href={`/news/${prevId}`}
                    className="flex-1 flex items-center justify-center py-3 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    ← 이전
                  </Link>
                ) : (
                  <div className="flex-1 py-3 px-4 rounded-lg bg-gray-50 text-gray-400 text-center cursor-not-allowed">
                    ← 이전
                  </div>
                )}
                {nextId ? (
                  <Link
                    href={`/news/${nextId}`}
                    className="flex-1 flex items-center justify-center py-3 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    다음 →
                  </Link>
                ) : (
                  <div className="flex-1 py-3 px-4 rounded-lg bg-gray-50 text-gray-400 text-center cursor-not-allowed">
                    다음 →
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* 탭 시스템 */}
          <div
            className="flex gap-8 justify-center items-start"
            style={{ marginTop: '32px' }}
          >
            {/* 왼쪽 액션 버튼들 - 데스크톱만 (투명 아이콘으로 정렬) */}
            <div className="hidden lg:flex flex-col gap-4 sticky top-32">
              {/* 투명 버튼들 - 뉴스 박스와 동일한 정렬을 위해 */}
              <div className="flex flex-col items-center gap-1 p-3 rounded-full opacity-0 pointer-events-none">
                <Heart className="w-6 h-6" />
                <span className="text-xs font-medium">123</span>
              </div>
            </div>

            {/* 탭 박스 */}
            <article
              className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              style={{ maxWidth: '895px' }}
            >
              {/* 탭 헤더 */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'comments'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  댓글 (24)
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'discussion'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  토론 (8)
                </button>
              </div>

              {/* 탭 컨텐츠 */}
              <div className="p-8">
                {activeTab === 'comments' ? (
                  <div className="space-y-6">
                    {/* 댓글 입력창 */}
                    <div>
                      <textarea
                        placeholder="댓글을 입력하세요..."
                        className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="mt-3 flex justify-end">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          댓글 등록
                        </button>
                      </div>
                    </div>

                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                사용자{i}
                              </span>
                              <span className="text-xs text-gray-500">
                                2시간 전
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              좋은 정보 감사합니다! 보안에 대해 더 자세히 알고
                              싶어요.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 토론 입력창 */}
                    <div>
                      <input
                        type="text"
                        placeholder="토론 주제를 입력하세요..."
                        className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="토론 내용을 입력하세요..."
                        className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="mt-3 flex justify-end">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          토론 시작
                        </button>
                      </div>
                    </div>

                    {/* 토론 목록 */}
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">
                            보안 전략의 미래 방향성
                          </h4>
                          <div className="text-xs text-gray-500 mb-3">
                            사용자{i} • 1시간 전 • 참여자 {i * 3}명
                          </div>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            이번 DDoS 공격 증가에 대한 대응 방안에 대해 함께
                            논의해보세요.
                          </p>
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            토론 참여하기 →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  return <NewsDetailPageContent id={params.id} />
}
