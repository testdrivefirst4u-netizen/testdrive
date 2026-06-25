"use client"

import { useState } from "react"
import Image from "next/image"
import { Edit, Trash2, Eye, Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Listing {
  id: number
  name: string
  year: number
  price: number
  image: string
  status: "active" | "sold" | "pending"
  views: number
  inquiries: number
  postedDate: string
  kmDriven: number
  fuelType: string
  transmission: string
}

const myListings: Listing[] = [
  {
    id: 1,
    name: "Maruti Suzuki Swift VDI",
    year: 2019,
    price: 6.25,
    image: "/placeholder.svg?height=200&width=300",
    status: "active",
    views: 156,
    inquiries: 12,
    postedDate: "2024-01-15",
    kmDriven: 45000,
    fuelType: "Diesel",
    transmission: "Manual",
  },
  {
    id: 2,
    name: "Honda City ZX CVT",
    year: 2018,
    price: 8.75,
    image: "/placeholder.svg?height=200&width=300",
    status: "sold",
    views: 234,
    inquiries: 18,
    postedDate: "2024-01-10",
    kmDriven: 58000,
    fuelType: "Petrol",
    transmission: "CVT",
  },
  {
    id: 3,
    name: "Hyundai Creta SX",
    year: 2020,
    price: 12.5,
    image: "/placeholder.svg?height=200&width=300",
    status: "pending",
    views: 89,
    inquiries: 7,
    postedDate: "2024-01-20",
    kmDriven: 32000,
    fuelType: "Petrol",
    transmission: "Automatic",
  },
]

export default function MyListingsPage() {
  const [listings, setListings] = useState(myListings)
  const [filter, setFilter] = useState<"all" | "active" | "sold" | "pending">("all")

  const filteredListings = filter === "all" ? listings : listings.filter((listing) => listing.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = (id: number) => {
    setListings(listings.filter((listing) => listing.id !== id))
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
            <BreadcrumbPage>My Listings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Car Listings</h1>
            <p className="text-gray-600">Manage your car listings and track their performance</p>
          </div>
          <Button asChild>
            <a href="/used-cars/sell">
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </a>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {["all", "active", "sold", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === status ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {status} ({status === "all" ? listings.length : listings.filter((l) => l.status === status).length})
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={listing.image || "/placeholder.svg"}
                    alt={listing.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-2 left-2 ${getStatusColor(listing.status)}`}>{listing.status}</Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{listing.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {listing.year} • {listing.kmDriven.toLocaleString()} km • {listing.fuelType} •{" "}
                    {listing.transmission}
                  </p>

                  <p className="text-2xl font-bold text-green-600 mb-3">₹{listing.price} L</p>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{listing.inquiries} inquiries</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Posted on {new Date(listing.postedDate).toLocaleDateString()}
                  </p>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-4">
              {filter === "all" ? "You haven't created any car listings yet" : `No ${filter} listings found`}
            </p>
            <Button asChild>
              <a href="/used-cars/sell">Create Your First Listing</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
