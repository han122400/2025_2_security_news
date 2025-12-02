'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MessageCircle } from 'lucide-react'
// @/lib/supabaseClient 경로가 프로젝트에 맞게 존재하는지 확인하세요.
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useCategoryFilter } from '@/contexts/CategoryFilterContext'

// 카테고리 데이터는 그대로 유지합니다.
const categories = [
  { id: 'search', name: '검색' },
  { id: 'cyber-security', name: '사이버보안' },
  { id: 'hacking', name: '해킹/침해사고' },
  { id: 'privacy', name: '개인정보보호' },
  { id: 'it-trends', name: 'IT/보안 트렌드' },
  { id: 'malware', name: '악성코드/피싱' },
  { id: 'security-products', name: '보안제품/서비스' },
  { id: 'authentication', name: '인증·암호화' },
  { id: 'network-security', name: '네트워크보안' },
  { id: 'policy', name: '정책·제도' },
  { id: 'data-security', name: '데이터보안' },
]

interface HeaderProps {
  hideCategories?: boolean
}

export default function Header({ hideCategories = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const { isCategoryEnabled, isLoading: filterLoading } = useCategoryFilter()

  useEffect(() => {
    // 로그인 상태 확인
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'all' || sectionId === 'search') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 140 // 헤더 높이 + 섹션 제목이 보이도록 여유 공간
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 첫 번째 줄: 로고/링크, 검색, 로그인/프로필 버튼 */}
        <div className="flex items-center justify-between h-16">
          {/* 1. 로고 및 Daily News (홈 링크 적용) */}
          <Link
            href="/"
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            {/* 로고 SVG */}
            <div className="bg-blue-600 p-2 rounded">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            {/* Daily News 텍스트 */}
            <h1 className="text-2xl font-bold text-gray-900">Security News</h1>
          </Link>

          {/* 3. 로그인/프로필 버튼 (오른쪽 배치) */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                내 정보
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                로그인
              </Link>
            )}
          </div>
        </div>{' '}
        {/* div.flex items-center justify-between h-16 끝 */}
        {/* 카테고리 메뉴 - 두 번째 줄 */}
        {!hideCategories && (
          <div className="border-t border-gray-200">
            <nav className="flex flex-wrap items-center justify-center gap-1 py-3">
              {categories
                .filter((category) => {
                  // 검색은 항상 표시
                  if (category.id === 'search') return true
                  // 로그인하지 않은 경우 모든 카테고리 표시
                  if (!user) return true
                  // 로그인한 경우 필터 설정 확인
                  return isCategoryEnabled(category.name)
                })
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToSection(category.id)}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-sm font-medium transition-all rounded-md flex items-center gap-1"
                  >
                    {category.id === 'search' && <Search size={16} />}
                    {category.name}
                  </button>
                ))}

              {/* 구분선 */}
              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* 보안 커뮤니티 버튼 */}
              <Link
                href="/community"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 px-4 py-1.5 text-sm font-medium transition-all rounded-full flex items-center gap-1.5 shadow-md hover:shadow-lg"
              >
                <MessageCircle size={16} />
                보안 커뮤니티
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
