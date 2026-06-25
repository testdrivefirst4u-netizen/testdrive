"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"

export default function BrandLogoSwiper({ brands }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Popular brands
        </h2>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
      >
        {brands.map((brand, index) => (
          <SwiperSlide key={index}>
            
            <div className="border rounded-xl p-6 text-center hover:shadow-md transition cursor-pointer bg-gray-50 hover:bg-white">
              
              {/* Logo */}
              <div className="h-16 flex items-center justify-center mb-3">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 object-contain"
                />
              </div>

              {/* Name */}
              <h3 className="text-gray-700 font-medium">
                {brand.name}
              </h3>

            </div>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* View All */}
      <div className="mt-5">
        <button className="text-orange-500 font-semibold flex items-center gap-2">
          View All Brands 
          <span>➜</span>
        </button>
      </div>

    </div>
  )
}