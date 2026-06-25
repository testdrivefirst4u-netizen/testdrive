"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import Link from "next/link"

export default function CarSectionSlider({ title, cars, type }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 mb-10">

      {/* Title */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1.2 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 }
        }}
      >
        {cars.map((car, index) => (
          <SwiperSlide key={index}>

            {/* Card Click Link */}
            <Link href={`/cars/${car.id}`}>

              <div className="border rounded-xl overflow-hidden hover:shadow-lg transition bg-white cursor-pointer">

                {/* Image */}
                <div className="bg-gray-100 p-4">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-40 object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-4">

                  <h3 className="font-semibold text-lg mb-1">
                    {car.name}
                  </h3>

                  <p className="text-gray-600 mb-3">
                    {car.priceDisplay || car.price}
                  </p>

                  <button className="w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-500 hover:text-white transition">
                    View Offers
                  </button>

                </div>

              </div>

            </Link>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* View All */}
      <div className="mt-4">
        <Link href={`/cars?filter=${type}`}>
          <button className="text-red-500 font-semibold">
            View All {title} →
          </button>
        </Link>
      </div>

    </div>
  )
}