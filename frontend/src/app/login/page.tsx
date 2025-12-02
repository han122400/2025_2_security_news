'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [checking, setChecking] = useState(true)

  // placeholder 색상을 위한 스타일
  const inputStyle = {
    display: 'block' as const,
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #D1D5DB',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  }

  const passwordInputStyle = {
    display: 'block' as const,
    width: '100%',
    padding: '0.75rem 3rem 0.75rem 1rem',
    border: '1px solid #D1D5DB',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  }

  // 로그인 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 이미 로그인되어 있으면 프로필 페이지로 리다이렉트
        router.push('/profile')
      } else {
        setChecking(false)
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      setIsLoading(false)
      return
    }

    if (mode === 'signup' && !formData.name) {
      setError('이름을 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        // 회원가입
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        })

        if (signUpError) {
          // Supabase 에러 처리
          if (signUpError.message.includes('User already registered')) {
            throw new Error('이미 가입된 이메일입니다.')
          } else if (
            signUpError.message.includes('Password should be at least')
          ) {
            throw new Error('비밀번호는 최소 6자 이상이어야 합니다.')
          } else {
            throw signUpError
          }
        }

        // 회원가입 성공 여부 확인
        if (!data.user) {
          throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.')
        }

        // 세션이 없는 경우 = 이메일 인증 필요
        if (!data.session) {
          setError('')
          alert(
            '회원가입이 완료되었습니다!\n\n가입하신 이메일로 인증 링크가 발송되었습니다.\n이메일에서 인증을 완료해주세요.'
          )
          setMode('login')
          setFormData({ name: '', email: '', password: '' })
        } else {
          // 즉시 로그인 가능한 경우
          setError('')
          alert('가입 완료!')
          router.push('/')
        }
      } else {
        // 로그인
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error('가입 시 발송된 인증 메일을 확인해주세요.')
          } else {
            throw signInError
          }
        }
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // 로그인 확인 중일 때 로딩 표시
  if (checking) {
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        background:
          'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 50%, #EEF2FF 100%)',
      }}
    >
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* 로고 및 제목 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(to right, #2563EB, #4F46E5)',
              borderRadius: '50%',
              marginBottom: '1rem',
            }}
          >
            <svg
              style={{ width: '2rem', height: '2rem', color: 'white' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem',
            }}
          >
            Security News
          </h1>
          <p style={{ color: '#6B7280' }}>
            {mode === 'login'
              ? '보안 뉴스 플랫폼에 로그인하세요'
              : '보안 뉴스 플랫폼에 가입하세요'}
          </p>
        </div>

        {/* 로그인/회원가입 폼 */}
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* 에러 메시지 */}
            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                {error}
              </div>
            )}

            {/* 이름 입력 - 회원가입 모드일 때만 표시 */}
            {mode === 'signup' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    color: '#111827',
                  }}
                  placeholder="홍길동"
                  required
                />
              </div>
            )}

            {/* 이메일 입력 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  color: '#111827',
                }}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    color: '#111827',
                  }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9CA3AF',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 로그인 모드일 때만 표시 */}
            {mode === 'login' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label
                    htmlFor="remember-me"
                    style={{ fontSize: '0.875rem', color: '#374151' }}
                  >
                    로그인 상태 유지
                  </label>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <a
                    href="#"
                    style={{
                      fontWeight: '500',
                      color: '#2563EB',
                      textDecoration: 'none',
                    }}
                  >
                    비밀번호 찾기
                  </a>
                </div>
              </div>
            )}

            {/* 로그인/회원가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'white',
                background: 'linear-gradient(to right, #2563EB, #4F46E5)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isLoading
                ? mode === 'login'
                  ? '로그인 중...'
                  : '가입 중...'
                : mode === 'login'
                ? '로그인'
                : '회원가입'}
            </button>

            {/* 모드 전환 버튼 */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setError('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  color: '#2563EB',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {mode === 'login'
                  ? '처음이신가요? 회원가입하기'
                  : '이미 계정이 있으신가요? 로그인하기'}
              </button>
            </div>

            {/* 소셜 로그인 - 로그인 모드일 때만 */}
            {mode === 'login' && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      borderTop: '1px solid #D1D5DB',
                      top: '50%',
                    }}
                  ></div>
                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0 0.5rem',
                        background: 'white',
                        color: '#6B7280',
                        fontSize: '0.875rem',
                      }}
                    >
                      또는 다음으로 로그인
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0.625rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      background: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>G</span> Google
                  </button>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0.625rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      background: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>K</span> Kakao
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 하단 링크 */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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
    </div>
  )
}
