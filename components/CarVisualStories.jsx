"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { Play } from "lucide-react"
import Link from "next/link"

import "swiper/css"
import "swiper/css/navigation"

export default function CarVisualStories({ stories }) {
  return (
    <div className="bg-white max-w-7xl mx-auto rounded-2xl shadow-sm p-6 mb-10">
 
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-6">
        Car visual stories
      </h2>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1.3 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
      >
        {stories.map((story, index) => (
          <SwiperSlide key={index}>
            
            <Link href={`/visual-stories/${story.id}`}>
              
              <div className="relative rounded-xl overflow-hidden cursor-pointer group">

                {/* Thumbnail */}
                <img
                  src={story.thumbnail}
                  className="h-[300px] w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/30 backdrop-blur rounded-full p-3">
                    <Play className="text-white" />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-sm font-medium">
                    {story.title}
                  </h3>
                </div>

              </div>

            </Link>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* View All */}
      <div className="mt-5">
        <Link
          href="/visual-stories"
          className="text-orange-500 font-semibold"
        >
          View All Car Visual Stories →
        </Link>
      </div>

    </div>
  )
}