'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface NewsSectionProps {
  id: string
  title: string
  description: string
  articles: {
    id: number
    title: string
    summary: string
    date: string
    source: string
    image?: string
    category: string
  }[]
}

export default function NewsSection({
  id,
  title,
  description,
  articles,
}: NewsSectionProps) {
  return (
    <section id={id} className="mb-16 scroll-mt-32">
      <div className="border-l-4 border-blue-600 pl-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="news-swiper"
        >
          {articles.map((article) => (
            <SwiperSlide key={article.id}>
              <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full">
                {/* 이미지 */}
                {article.image && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-semibold text-white bg-blue-600 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {!article.image && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {article.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        {article.date}
                      </span>
                    </div>
                  )}

                  {article.image && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        {article.date}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
