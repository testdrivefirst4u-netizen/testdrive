import Link from "next/link"
import { MapPin, CreditCard, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BuyerTools() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Car Buyer's Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link
          href="/locate-dealer"
          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
        >
          <div className="bg-gray-100 p-2 rounded-full">
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">Locate Dealer</h3>
            <p className="text-sm text-gray-500">Find a dealer near your current location</p>
          </div>
        </Link>

        <Link href="/car-loan" className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
          <div className="bg-gray-100 p-2 rounded-full">
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">Instant Car Loan</h3>
            <p className="text-sm text-gray-500">Apply and Get Best Car Loan Offers within minutes</p>
          </div>
        </Link>

        <Link
          href="/new-car-launches"
          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
        >
          <div className="bg-gray-100 p-2 rounded-full">
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">New Launches</h3>
            <p className="text-sm text-gray-500">Explore the latest 2025–26 car models and upcoming launches</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
