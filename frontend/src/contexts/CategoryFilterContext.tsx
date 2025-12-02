'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface CategoryFilterContextType {
  disabledCategories: { [key: string]: boolean }
  toggleCategory: (category: string) => void
  isCategoryEnabled: (category: string) => boolean
  isLoading: boolean
  refreshSettings: () => Promise<void>
}

const CategoryFilterContext = createContext<
  CategoryFilterContextType | undefined
>(undefined)

export function CategoryFilterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [disabledCategories, setDisabledCategories] = useState<{
    [key: string]: boolean
  }>({})
  const [isLoading, setIsLoading] = useState(true)

  // DB에서 사용자 카테고리 설정 불러오기
  const loadCategorySettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // 로그인하지 않은 경우 빈 설정 사용
        setDisabledCategories({})
        setIsLoading(false)
        return
      }

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
          // category_settings에서 false인 카테고리를 disabledCategories로 변환
          // DB에서 true = 활성화, false = 비활성화
          // disabledCategories에서 true = 비활성화
          const disabled: { [key: string]: boolean } = {}
          if (profileData.category_settings) {
            Object.entries(profileData.category_settings).forEach(
              ([key, value]) => {
                // value가 false이면 해당 카테고리가 비활성화된 것
                if (value === false) {
                  disabled[key] = true
                }
              }
            )
          }
          setDisabledCategories(disabled)
        }
      }
    } catch (error) {
      console.error('카테고리 설정 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 설정 새로고침 함수 (프로필 페이지에서 호출 가능)
  const refreshSettings = async () => {
    setIsLoading(true)
    await loadCategorySettings()
  }

  useEffect(() => {
    loadCategorySettings()

    // 인증 상태 변경 리스너 - 로그인/로그아웃 시 설정 다시 로드
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadCategorySettings()
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleCategory = (category: string) => {
    setDisabledCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const isCategoryEnabled = (category: string) => {
    return !disabledCategories[category]
  }

  return (
    <CategoryFilterContext.Provider
      value={{
        disabledCategories,
        toggleCategory,
        isCategoryEnabled,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </CategoryFilterContext.Provider>
  )
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext)
  if (context === undefined) {
    throw new Error(
      'useCategoryFilter must be used within a CategoryFilterProvider'
    )
  }
  return context
}
