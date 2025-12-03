'use client'

import { redirect } from 'next/navigation'

export default function NewsPage() {
  // /news 경로는 홈으로 리디렉트
  redirect('/')
}
