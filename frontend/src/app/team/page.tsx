'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// 팀 멤버 데이터 타입 정의
interface TeamMember {
  id: number // 고유 식별자
  name: string // 이름
  role: string // 역할/학번
  description: string // 설명
  image: string // 프로필 이미지 경로
  color: string // 카드 그라데이션 색상
  portfolio?: string // 포트폴리오 링크
  github?: string // 깃허브 링크
}

export default function TeamPage() {
  // 상태 관리: 캐러셀의 Y축 회전 각도 (도 단위)
  const [rotation, setRotation] = useState(0)

  // 상태 관리: 사용자가 현재 드래그 중인지 여부
  const [isDragging, setIsDragging] = useState(false)

  // 상태 관리: 드래그 시작 시 마우스 X 위치
  const [startX, setStartX] = useState(0)

  // 상태 관리: 드래그 시작 시점의 회전 각도 (누적 회전 저장용)
  const [currentRotation, setCurrentRotation] = useState(0)

  // 상태 관리: 현재 뒤집힌 카드의 ID (null이면 뒤집힌 카드 없음)
  const [flippedCard, setFlippedCard] = useState<number | null>(null)

  // 상태 관리: 카드가 뒤집혔을 때 회전을 잠글지 여부
  const [isLocked, setIsLocked] = useState(false)

  // DOM 참조: 3D 캐러셀 컨테이너 (스크롤 방지 등에 사용)
  const containerRef = useRef<HTMLDivElement>(null)

  // 팀 멤버 데이터 배열
  const teamMembers: TeamMember[] = [
    {
      id: 0,
      name: '철야의 코딩',
      role: '보안뉴스',
      description: '',
      image: '/team/team-intro.jpg',
      color: 'from-slate-700 to-slate-800',
    },
    {
      id: 1,
      name: '김서진',
      role: '92212764',
      description: '팀장',
      image: '/kimseojin.png',
      color: 'from-[#729A8A] to-[#5a7a6d]',
      portfolio: 'https://webserver-final-portfolio.vercel.app/',
      github: 'https://github.com/Daru0613',
    },
    {
      id: 2,
      name: '박한빈',
      role: '92212867',
      description: '팀원',
      image: '/parkhanbin.png',
      color: 'from-[#4c5be5] to-[#3a47b8]',
      portfolio: 'https://2025-2-mypage.vercel.app/ ',
      github: 'https://github.com/han122400',
    },
    {
      id: 3,
      name: '이지훈',
      role: '92213031',
      description: '팀원',
      image: '/leejihun.png',
      color: 'from-[#DBDFEA] to-[#b8bdd1]',
      portfolio: 'https://web-final-five-sigma.vercel.app/',
      github: 'https://github.com/LEEJIHUN6844',
    },
    {
      id: 4,
      name: '윤주혁',
      role: '92410847',
      description: '팀원',
      image: '/yunjuhyeok.png',
      color: 'from-[#b773ec] to-[#9456c9]',
      portfolio: 'https://web-server-final-theta.vercel.app/',
      github: 'https://github.com/Juhyeok0603',
    },
  ]

  // 마우스 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return // 카드가 뒤집혔을 때는 회전 금지
    setIsDragging(true) // 드래그 상태 활성화
    setStartX(e.clientX) // 시작 X 좌표 저장
    setCurrentRotation(rotation) // 현재 회전 각도 저장
  }

  // 마우스 드래그 중 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isLocked) return // 드래그 중이 아니거나 잠김 상태면 무시
    const diff = e.clientX - startX // 마우스 이동 거리 계산
    setRotation(currentRotation + diff * 0.5) // 이동 거리의 50%만큼 회전 (민감도 조절)
  }

  // 마우스 드래그 종료 핸들러
  const handleMouseUp = () => {
    setIsDragging(false) // 드래그 상태 해제
  }

  // 마우스 휠 스크롤 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    if (isLocked) return // 카드가 뒤집혔을 때는 회전 금지
    e.preventDefault() // 기본 스크롤 동작 방지
    setRotation((prev) => prev + e.deltaY * 0.1) // 스크롤 양의 10%만큼 회전
  }

  // 터치 시작 핸들러 (모바일 지원)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked) return // 카드가 뒤집혔을 때는 회전 금지
    setIsDragging(true) // 드래그 상태 활성화
    setStartX(e.touches[0].clientX) // 첫 번째 터치 포인트의 X 좌표 저장
    setCurrentRotation(rotation) // 현재 회전 각도 저장
  }

  // 터치 이동 핸들러 (모바일 지원)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isLocked) return // 드래그 중이 아니거나 잠김 상태면 무시
    const diff = e.touches[0].clientX - startX // 터치 이동 거리 계산
    setRotation(currentRotation + diff * 0.5) // 이동 거리의 50%만큼 회전
  }

  // 터치 종료 핸들러 (모바일 지원)
  const handleTouchEnd = () => {
    setIsDragging(false) // 드래그 상태 해제
  }

  // 카드 클릭 핸들러 (카드 중앙 정렬 및 뒤집기)
  const handleCardClick = (cardId: number, index: number) => {
    if (flippedCard === cardId) {
      // 이미 뒤집힌 카드를 다시 클릭하면 원래대로
      setFlippedCard(null) // 뒤집기 해제
      setIsLocked(false) // 회전 잠금 해제
    } else {
      // 새로운 카드를 클릭하면 중앙으로 이동 후 뒤집기
      // 목표 각도 계산 (해당 카드를 정면으로)
      const targetAngle = -cardAngle * index
      const currentNormalized = rotation % 360 // 현재 각도를 0~360 범위로 정규화
      const diff = targetAngle - currentNormalized // 목표 각도와의 차이

      // -180 ~ 180 범위로 정규화하여 가장 짧은 경로 선택
      // 예: 350도 회전보다 -10도 회전이 더 짧음
      let shortestRotation = diff
      if (diff > 180) {
        shortestRotation = diff - 360 // 시계 반대 방향이 더 빠름
      } else if (diff < -180) {
        shortestRotation = diff + 360 // 시계 방향이 더 빠름
      }

      const newRotation = rotation + shortestRotation // 최종 회전 각도
      setRotation(newRotation) // 회전 적용
      setCurrentRotation(newRotation) // 누적 회전 각도 업데이트
      setFlippedCard(cardId) // 카드 뒤집기
      setIsLocked(true) // 회전 잠금 (뒤집는 동안 회전 방지)
    }
  }

  // 각 카드 사이의 각도 계산 (360도를 카드 개수로 나눔)
  // 예: 5개 카드 = 72도씩 떨어짐
  const cardAngle = 360 / teamMembers.length

  return (
    // 메인 컨테이너: 전체 화면 높이, 그라데이션 배경
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden relative">
      {/* 배경 이미지 레이어 */}
      <div className="absolute inset-0 z-0">
        {/* Next.js 최적화 이미지 컴포넌트 */}
        <Image
          src="/1315633.jpeg" // 배경 이미지 경로
          alt="Team Background"
          fill // 부모 요소 크기에 맞춤
          className="object-cover brightness-110 contrast-110 blur-sm" // 밝기/대비 증가, 블러 효과
          priority // 우선 로딩 (LCP 최적화)
        />
        {/* 어두운 오버레이 (가독성 향상) */}
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* 메인 컨텐츠 레이어 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 상단 헤더: 팀 이름 및 사용 안내 */}
        <div className="pt-8 pb-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            철야의 코딩
          </h1>
          <p className="text-white/70 mt-2">
            드래그하거나 스크롤하여 카드를 회전하세요
          </p>
        </div>

        {/* 3D 캐러셀 컨테이너: 마우스/터치 이벤트 핸들링 */}
        <div
          ref={containerRef} // DOM 참조
          className="flex items-center justify-center cursor-grab active:cursor-grabbing py-8"
          style={{
            minHeight: '500px',
            maxHeight: 'calc(100vh - 320px)',
            perspective: '2000px', // 3D 원근감
          }}
          // 마우스 이벤트
          onMouseDown={handleMouseDown} // 드래그 시작
          onMouseMove={handleMouseMove} // 드래그 중
          onMouseUp={handleMouseUp} // 드래그 종료
          onMouseLeave={handleMouseUp} // 마우스가 영역 벗어남
          onWheel={handleWheel} // 마우스 휠 스크롤
          // 터치 이벤트 (모바일)
          onTouchStart={handleTouchStart} // 터치 시작
          onTouchMove={handleTouchMove} // 터치 이동
          onTouchEnd={handleTouchEnd} // 터치 종료
        >
          {/* 회전하는 카드 그룹 컨테이너 */}
          <div
            className="relative w-full h-[500px]"
            style={{
              transform: `rotateY(${rotation}deg)`, // Y축 회전 적용
              transition: isDragging ? 'none' : 'transform 0.7s ease-out', // 드래그 중엔 즉시 반응, 아니면 부드럽게
              transformStyle: 'preserve-3d', // 3D 변형 유지
            }}
          >
            {/* 각 팀 멤버 카드를 원형으로 배치 */}
            {teamMembers.map((member, index) => {
              // 원형 배치를 위한 각도 및 좌표 계산
              const angle = cardAngle * index // 해당 카드의 각도
              const radius = 450 // 원의 반지름 (픽셀)
              const x = Math.sin((angle * Math.PI) / 180) * radius // X 좌표 (사용 안 함)
              const z = Math.cos((angle * Math.PI) / 180) * radius // Z 좌표 (사용 안 함)

              return (
                // 카드 위치 컨테이너 (원형 궤도 상 위치)
                <div
                  key={member.id} // React 리스트 키
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" // 중앙 기준
                  style={{
                    // 3D 변형: Y축 회전 + Z축 이동으로 원형 배치
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  }}
                >
                  {/* 카드 본체 (앞/뒤면 포함) */}
                  <div
                    className={`relative w-[280px] h-[400px] md:w-[320px] md:h-[450px] cursor-pointer transition-all duration-700 ${
                      flippedCard === member.id ? 'scale-110 z-50' : '' // 뒤집힌 카드는 확대 및 앞으로
                    }`}
                    style={{
                      transformStyle: 'preserve-3d', // 자식의 3D 변형 유지
                    }}
                    onClick={() => handleCardClick(member.id, index)} // 클릭 시 카드 중앙 정렬 및 뒤집기
                  >
                    {/* 카드 앞면: 왕관 아이콘 + 이름 + 역할 */}
                    <div
                      className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg bg-gradient-to-br ${
                        member.color // 각 멤버별 그라데이션 색상
                      } border-2 border-white/30 transition-all duration-700 ${
                        flippedCard === member.id ? 'opacity-0' : 'opacity-100' // 뒤집히면 투명
                      }`}
                      style={{
                        backfaceVisibility: 'hidden', // 뒷면에서 보이지 않음
                        transform:
                          flippedCard === member.id
                            ? 'rotateY(180deg)' // 뒤집힘
                            : 'rotateY(0deg)', // 정면
                      }}
                    >
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-white">
                        {/* 별 모양 아이콘 (SVG) */}
                        <div className="mb-6">
                          <svg
                            className="w-24 h-24 md:w-32 md:h-32 text-white/80" // 반투명 흰색
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            {/* 별 모양 경로 */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                        </div>

                        {/* 멤버 정보 표시 */}
                        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">
                          {member.name} {/* 이름 */}
                        </h2>
                        {/* 구분선 */}
                        <div className="w-20 h-1 bg-white/50 rounded-full mb-4"></div>
                        <p className="text-xl md:text-2xl opacity-90 text-center">
                          {member.role} {/* 역할/학번 */}
                        </p>
                      </div>
                    </div>

                    {/* 카드 뒷면: 사진 + 정보 + 버튼 */}
                    <div
                      className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg bg-white/10 border-2 border-white/20 transition-all duration-700 ${
                        flippedCard === member.id ? 'opacity-100' : 'opacity-0' // 뒤집히면 보임
                      }`}
                      style={{
                        backfaceVisibility: 'hidden', // 앞면에서 보이지 않음
                        transform:
                          flippedCard === member.id
                            ? 'rotateY(0deg)' // 정면으로
                            : 'rotateY(180deg)', // 180도 뒤집힌 상태로 대기
                      }}
                    >
                      {member.id === 0 ? (
                        // 팀 소개 카드 뒷면 (특별 레이아웃)
                        <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col">
                          {/* 팀명 */}
                          <h2 className="text-4xl md:text-3xl font-bold text-white text-center mb-4">
                            철야의 코딩
                          </h2>

                          {/* 팀 소개 섹션 */}
                          <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white/90 mb-3 flex items-center">
                              <span className="mr-2">👥</span> 팀 소개
                            </h3>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                              <p className="text-white/80 text-sm leading-relaxed">
                                김서진, 박한빈, 이지훈, 윤주혁으로 구성된 팀으로
                                철야까지 코딩에 <br />
                                몰두 한다는 뜻을 담았습니다.
                              </p>
                            </div>
                          </div>

                          {/* 프로젝트 소개 섹션 */}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white/90 mb-3 flex items-center">
                              <span className="mr-2">🚀</span> 프로젝트 소개
                            </h3>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                              <p className="text-white/80 text-sm leading-relaxed">
                                실시간 보안 뉴스 현황, 커뮤니티 기능을 제공하는
                                종합 보안 정보 플랫폼입니다. Next.js와 FastAPI를
                                활용한 <br />
                                풀스택 웹 애플리케이션입니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // 일반 팀원 카드 뒷면 (기존 레이아웃)
                        <div className="relative w-full h-full">
                          {/* 프로필 사진 */}
                          <Image
                            src={member.image} // 이미지 경로
                            alt={member.name}
                            fill // 부모 크기에 맞춤
                            className="object-cover" // 비율 유지하며 채움
                          />
                          {/* 그라데이션 오버레이 (하단 텍스트 가독성 향상) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                          {/* 하단 정보 영역 */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">
                              {member.name} {/* 이름 */}
                            </h3>
                            <p className="text-lg opacity-90 mb-3">
                              {member.role} {/* 역할/학번 */}
                            </p>
                            {/* 구분선 */}
                            <div className="w-full h-px bg-white/30 mb-3"></div>
                            <p className="text-sm opacity-80 mb-4">
                              {member.description} {/* 설명 */}
                            </p>

                            {/* 포트폴리오/깃허브 버튼 (있을 경우에만 표시) */}
                            {(member.portfolio || member.github) && (
                              <div className="flex gap-3 mt-4">
                                {/* 포트폴리오 버튼 */}
                                {member.portfolio && (
                                  <a
                                    href={member.portfolio} // 링크
                                    target="_blank" // 새 탭에서 열기
                                    rel="noopener noreferrer" // 보안 강화
                                    onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 전파 방지
                                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-300 text-center text-sm font-medium border border-white/30 hover:border-white/50"
                                  >
                                    Portfolio
                                  </a>
                                )}
                                {/* 깃허브 버튼 */}
                                {member.github && (
                                  <a
                                    href={member.github} // 링크
                                    target="_blank" // 새 탭에서 열기
                                    rel="noopener noreferrer" // 보안 강화
                                    onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 전파 방지
                                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-300 text-center text-sm font-medium border border-white/30 hover:border-white/50"
                                  >
                                    GitHub
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 하단 힌트: 사용 방법 안내 */}
        <div className="py-6 px-4 md:py-8 text-center space-y-3 md:space-y-4 flex-shrink-0">
          <div className="inline-flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/20">
            {/* 왼쪽 화살표 아이콘 */}
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18" // 좌측 화살표 경로
              />
            </svg>
            <span className="text-white font-medium text-sm md:text-base whitespace-nowrap">
              드래그 또는 스크롤
            </span>
            {/* 오른쪽 화살표 아이콘 */}
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3" // 우측 화살표 경로
              />
            </svg>
          </div>

          {/* 홈으로 이동 버튼 */}
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm md:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="whitespace-nowrap">홈으로 이동</span>
            </a>
          </div>
        </div>
      </div>

      {/* 커스텀 CSS 스타일 (3D 변형용) */}
      <style jsx>{`
        /* 원근감 설정 (3D 깊이감) */
        .perspective-\\[2000px\\] {
          perspective: 2000px;
        }
        /* 3D 변형 유지 (자식 요소의 3D 위치 보존) */
        .preserve-3d {
          transform-style: preserve-3d;
        }
        /* Y축 180도 회전 */
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
