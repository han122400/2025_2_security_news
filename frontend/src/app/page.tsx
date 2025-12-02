'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import NewsSection from '@/components/NewsSection'
import StatsDashboard from '@/components/StatsDashboard'
import { getAllCategoryNews } from '@/app/api/news_api'
import { useCategoryFilter } from '@/contexts/CategoryFilterContext'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [newsData, setNewsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { isCategoryEnabled, isLoading: filterLoading } = useCategoryFilter()

  useEffect(() => {
    // 로그인 상태 확인
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // 필터 로딩이 완료될 때까지 대기
    if (filterLoading) return

    // 뉴스 데이터 로드
    const loadNews = async () => {
      try {
        setLoading(true)
        const data = await getAllCategoryNews()
        setNewsData(data)
      } catch (error) {
        console.error('뉴스 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [filterLoading])

  // 카테고리가 표시되어야 하는지 확인
  const shouldShowCategory = (categoryKoreanName: string) => {
    // 로그인하지 않은 경우 모든 카테고리 표시
    if (!isLoggedIn) return true
    // 로그인한 경우 필터 설정 확인
    return isCategoryEnabled(categoryKoreanName)
  }

  // 필터 로딩 중
  if (filterLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">설정을 불러오는 중...</div>
      </div>
    )
  }

  // 뉴스 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">뉴스를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색창 */}
        <div className="mb-12">
          <SearchBar />
        </div>

        {/* 통계 대시보드 */}
        <StatsDashboard />

        <div className="mt-16">
          {shouldShowCategory('사이버보안') && (
            <NewsSection
              id="cyber-security"
              title="사이버보안"
              description="기업 및 국가 IT 시스템, 네트워크 등 전반적인 정보보호 관련 소식"
              articles={newsData?.cyberSecurity || []}
            />
          )}

          {shouldShowCategory('해킹/침해사고') && (
            <NewsSection
              id="hacking"
              title="해킹/침해사고"
              description="해킹 사례, 취약점, 정보유출, 보안사고 등 사건 중심의 기사"
              articles={newsData?.hacking || []}
            />
          )}

          {shouldShowCategory('개인정보보호') && (
            <NewsSection
              id="privacy"
              title="개인정보/산업기밀보호"
              description="유출 사건, 관리 방안, 법적 규제 등 정보보호 정책"
              articles={newsData?.privacy || []}
            />
          )}

          {shouldShowCategory('IT/보안 트렌드') && (
            <NewsSection
              id="it-trends"
              title="IT/보안 최신 트렌드"
              description="AI 보안, 양자보안, 클라우드 등 신기술 동향"
              articles={newsData?.itTrends || []}
            />
          )}

          {shouldShowCategory('악성코드/피싱') && (
            <NewsSection
              id="malware"
              title="악성코드/피싱"
              description="신종 바이러스, 랜섬웨어, 피싱·파밍 공격 관련 정보"
              articles={newsData?.malware || []}
            />
          )}

          {shouldShowCategory('보안제품/서비스') && (
            <NewsSection
              id="security-products"
              title="보안제품/서비스"
              description="기업 제품, 보안 강화 솔루션, 도입 및 활용 사례"
              articles={newsData?.securityProducts || []}
            />
          )}

          {shouldShowCategory('인증·암호화') && (
            <NewsSection
              id="authentication"
              title="인증·암호화"
              description="보안 인증 제도, 암호·인증 기술 동향"
              articles={newsData?.authentication || []}
            />
          )}

          {shouldShowCategory('네트워크보안') && (
            <NewsSection
              id="network-security"
              title="네트워크/웹/모바일 보안"
              description="네트워크·웹·모바일 환경 보안 위협 및 대응 관련 기사"
              articles={newsData?.networkSecurity || []}
            />
          )}

          {shouldShowCategory('정책·제도') && (
            <NewsSection
              id="policy"
              title="정책·제도"
              description="ISMS 등 보안인증, 관련 법·규정 및 정부 정책"
              articles={newsData?.policy || []}
            />
          )}

          {shouldShowCategory('데이터보안') && (
            <NewsSection
              id="data-security"
              title="데이터·운영체계 보안"
              description="OS·서버·DB 보안 및 백업, 데이터 보호"
              articles={newsData?.dataSecurity || []}
            />
          )}
        </div>
      </main>
    </div>
  )
}
