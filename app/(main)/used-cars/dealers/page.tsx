"use client"

import { useState } from "react"
import { MapPin, Phone, Star, Clock, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Dealer {
  id: number
  name: string
  address: string
  city: string
  phone: string
  rating: number
  reviews: number
  distance: string
  openTime: string
  closeTime: string
  specialization: string[]
  isVerified: boolean
}

const dealers: Dealer[] = [
  {
    id: 1,
    name: "Premium Auto Hub",
    address: "Shop No. 15, Sector 18, Noida",
    city: "Delhi NCR",
    phone: "+91 98765 43210",
    rating: 4.5,
    reviews: 234,
    distance: "2.3 km",
    openTime: "9:00 AM",
    closeTime: "8:00 PM",
    specialization: ["Maruti Suzuki", "Hyundai", "Honda"],
    isVerified: true,
  },
  {
    id: 2,
    name: "City Car Bazaar",
    address: "Plot 45, Andheri East, Mumbai",
    city: "Mumbai",
    phone: "+91 87654 32109",
    rating: 4.2,
    reviews: 189,
    distance: "5.1 km",
    openTime: "10:00 AM",
    closeTime: "9:00 PM",
    specialization: ["Tata", "Mahindra", "Toyota"],
    isVerified: true,
  },
  {
    id: 3,
    name: "Elite Motors",
    address: "MG Road, Koramangala, Bangalore",
    city: "Bangalore",
    phone: "+91 76543 21098",
    rating: 4.7,
    reviews: 312,
    distance: "1.8 km",
    openTime: "9:30 AM",
    closeTime: "8:30 PM",
    specialization: ["BMW", "Audi", "Mercedes"],
    isVerified: true,
  },
  {
    id: 4,
    name: "Trusted Auto Sales",
    address: "FC Road, Shivajinagar, Pune",
    city: "Pune",
    phone: "+91 65432 10987",
    rating: 4.0,
    reviews: 156,
    distance: "3.7 km",
    openTime: "9:00 AM",
    closeTime: "7:30 PM",
    specialization: ["Maruti Suzuki", "Tata", "Hyundai"],
    isVerified: false,
  },
]

export default function FindDealersPage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [filteredDealers, setFilteredDealers] = useState(dealers)

  const handleSearch = () => {
    let filtered = dealers

    if (selectedCity) {
      filtered = filtered.filter((dealer) => dealer.city === selectedCity)
    }

    if (searchLocation) {
      filtered = filtered.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
          dealer.address.toLowerCase().includes(searchLocation.toLowerCase()),
      )
    }

    setFilteredDealers(filtered)
  }

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
            <BreadcrumbPage>Find Dealers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Find Trusted Car Dealers</h1>
          <p className="text-gray-600">Locate verified car dealers near you for the best deals on used cars</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by dealer name or location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="md:w-48">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>
                <Navigation className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dealers List */}
        <div className="space-y-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{dealer.name}</h3>
                      {dealer.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{dealer.address}</span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{dealer.rating}</span>
                        <span className="text-gray-500 text-sm">({dealer.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm">{dealer.distance} away</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Open: {dealer.openTime} - {dealer.closeTime}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Specializes in:</p>
                      <div className="flex flex-wrap gap-1">
                        {dealer.specialization.map((brand, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:w-48 flex flex-col space-y-2">
                    <Button className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Get Directions
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Inventory
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDealers.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No dealers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
