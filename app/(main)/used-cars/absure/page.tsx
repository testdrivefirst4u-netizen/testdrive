import Image from "next/image"
import Link from "next/link"
import { Shield, CheckCircle, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const abSureFeatures = [
  {
    icon: Shield,
    title: "200+ Quality Checks",
    description: "Every abSure car undergoes comprehensive quality inspection",
  },
  {
    icon: CheckCircle,
    title: "Verified Documentation",
    description: "All legal documents verified and cleared",
  },
  {
    icon: Award,
    title: "6 Month Warranty",
    description: "Comprehensive warranty on engine and transmission",
  },
  {
    icon: Clock,
    title: "7-Day Return Policy",
    description: "Return the car within 7 days if not satisfied",
  },
]

const abSureCars = [
  {
    id: 1,
    name: "Maruti Suzuki Swift VDI",
    year: 2019,
    price: 6.25,
    image: "/placeholder.svg?height=200&width=300",
    kmDriven: 45000,
    location: "Mumbai, Maharashtra",
    warranty: "6 Months",
  },
  {
    id: 2,
    name: "Hyundai Creta SX",
    year: 2020,
    price: 12.5,
    image: "/placeholder.svg?height=200&width=300",
    kmDriven: 32000,
    location: "Delhi, NCR",
    warranty: "6 Months",
  },
  {
    id: 3,
    name: "Tata Nexon XZ Plus",
    year: 2021,
    price: 9.8,
    image: "/placeholder.svg?height=200&width=300",
    kmDriven: 25000,
    location: "Pune, Maharashtra",
    warranty: "6 Months",
  },
]

export default function AbSurePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/used-cars">Used Cars</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>CarWale abSure</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8 mb-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">CarWale abSure</h1>
          <p className="text-xl mb-6">
            India's most trusted certified used cars with comprehensive quality checks and warranty
          </p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
            Browse abSure Cars
          </Button>
        </div>
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose abSure?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {abSureFeatures.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quality Process */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Our Quality Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Inspection</h3>
                <p className="text-gray-600 text-sm">200+ point quality check by certified technicians</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Certification</h3>
                <p className="text-gray-600 text-sm">Complete documentation verification and legal clearance</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Warranty</h3>
                <p className="text-gray-600 text-sm">6-month comprehensive warranty and 7-day return policy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured abSure Cars */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured abSure Cars</h2>
          <Button asChild variant="outline">
            <Link href="/used-cars?filter=absure">View All abSure Cars</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {abSureCars.map((car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={car.image || "/placeholder.svg"}
                  alt={car.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  abSure Certified
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{car.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {car.year} • {car.kmDriven.toLocaleString()} km
                </p>
                <p className="text-2xl font-bold text-green-600 mb-2">₹{car.price} L</p>
                <p className="text-sm text-gray-600 mb-4">{car.location}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{car.warranty} Warranty</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/used-cars/${car.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
