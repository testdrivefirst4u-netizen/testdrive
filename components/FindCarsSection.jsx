"use client"

import { useRouter } from "next/navigation"
import {
  IndianRupee,
  Car,
  Zap,
  Fuel,
  Leaf,
  Users,
  Settings,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function FindCarsSection() {

  const router = useRouter()

  const applyFilter = (query) => {
    router.push(`/cars?filter=${query}`)
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-2xl font-semibold mb-6">
          Find The Cars Of Your Choice
        </h2>

        <div className="bg-gray-50 rounded-2xl p-6 border">

          {/* Budget */}
          <div className="flex flex-wrap items-center gap-3 mb-4">

            <span className="text-gray-700 font-medium mr-2">
              Budget
            </span>

            <FilterButton
              icon={IndianRupee}
              label="Under 5 Lakh"
              onClick={() => applyFilter("under5")}
            />

            <FilterButton
              icon={IndianRupee}
              label="Under 10 Lakh"
              onClick={() => applyFilter("under10")}
            />

            <FilterButton
              icon={IndianRupee}
              label="Under 15 Lakh"
              onClick={() => applyFilter("under15")}
            />

            <span className="mx-2 text-gray-300">|</span>

            <span className="text-gray-700 font-medium">
              Body Type
            </span>

            <FilterButton icon={Car} label="SUV" onClick={() => applyFilter("SUV")} />
            <FilterButton icon={Car} label="Hatchback" onClick={() => applyFilter("Hatchback")} />
            <FilterButton icon={Car} label="Sedan" onClick={() => applyFilter("Sedan")} />

          </div>

          {/* Fuel */}

          <div className="flex flex-wrap items-center gap-3">

            <span className="text-gray-700 font-medium mr-2">
              Fuel Type & Others
            </span>

            <FilterButton icon={Zap} label="Electric" onClick={() => applyFilter("Electric")} />
            <FilterButton icon={Leaf} label="Hybrid" onClick={() => applyFilter("Hybrid")} />
            <FilterButton icon={Fuel} label="CNG" onClick={() => applyFilter("CNG")} />
            <FilterButton icon={Users} label="7 Seater" onClick={() => applyFilter("7Seater")} />
            <FilterButton icon={Settings} label="Automatic" onClick={() => applyFilter("Automatic")} />

          </div>

        </div>

        <div className="mt-4">
          <Link href='/cars'><button className="flex items-center text-gray-700 font-medium hover:text-red-500">
            View More Filters
            <ChevronRight className="w-4 h-4 ml-1" />
          </button></Link>
        </div>

      </div>
    </section>
  )
}

function FilterButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm bg-white hover:shadow-sm hover:border-gray-400 transition"
    >
      <Icon className="w-4 h-4 text-gray-600" />
      {label}
    </button>
  )
}