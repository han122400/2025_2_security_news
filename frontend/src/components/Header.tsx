'use client'

import { useState } from 'react'

const categories = [
  { id: 'all', name: '전체' },
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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'all') {
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
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex items-center space-x-2">
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
            <h1 className="text-2xl font-bold text-gray-900">Daily News</h1>
          </div>
        </div>

        {/* 카테고리 메뉴 - 두 번째 줄 */}
        <div className="border-t border-gray-200">
          <nav className="flex flex-wrap items-center justify-center gap-1 py-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-sm font-medium transition-all rounded-md"
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
