"use client"

import { useState } from "react"
import { Shield, Car, CreditCard, Phone, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface InsuranceQuote {
  provider: string
  logo: string
  premium: number
  coverage: string
  rating: number
  features: string[]
  discount: number
}

const insuranceProviders: InsuranceQuote[] = [
  {
    provider: "HDFC ERGO",
    logo: "/placeholder.svg?height=60&width=120",
    premium: 12500,
    coverage: "₹5,00,000",
    rating: 4.5,
    features: ["Zero Depreciation", "Engine Protection", "24x7 Roadside Assistance"],
    discount: 15,
  },
  {
    provider: "ICICI Lombard",
    logo: "/placeholder.svg?height=60&width=120",
    premium: 11800,
    coverage: "₹5,00,000",
    rating: 4.3,
    features: ["Comprehensive Coverage", "Personal Accident Cover", "Return to Invoice"],
    discount: 20,
  },
  {
    provider: "Bajaj Allianz",
    logo: "/placeholder.svg?height=60&width=120",
    premium: 13200,
    coverage: "₹5,00,000",
    rating: 4.2,
    features: ["Zero Depreciation", "Key Replacement", "Emergency Transport"],
    discount: 10,
  },
  {
    provider: "Tata AIG",
    logo: "/placeholder.svg?height=60&width=120",
    premium: 12000,
    coverage: "₹5,00,000",
    rating: 4.1,
    features: ["Comprehensive Coverage", "NCB Protection", "Consumables Cover"],
    discount: 18,
  },
]

export default function CarInsurancePage() {
  const [formData, setFormData] = useState({
    carBrand: "",
    carModel: "",
    carVariant: "",
    registrationYear: "",
    registrationNumber: "",
    city: "",
    name: "",
    phone: "",
    email: "",
    previousInsurer: "",
    claimHistory: "",
  })

  const [showQuotes, setShowQuotes] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const handleGetQuotes = () => {
    setShowQuotes(true)
  }

  const addOnOptions = [
    { id: "zero-dep", name: "Zero Depreciation Cover", price: 2500 },
    { id: "engine-protect", name: "Engine Protection Cover", price: 1800 },
    { id: "roadside", name: "24x7 Roadside Assistance", price: 800 },
    { id: "key-replace", name: "Key Replacement Cover", price: 500 },
    { id: "consumables", name: "Consumables Cover", price: 1200 },
    { id: "return-invoice", name: "Return to Invoice Cover", price: 2000 },
  ]

  const insuranceFeatures = [
    {
      icon: Shield,
      title: "Comprehensive Coverage",
      description: "Complete protection against accidents, theft, and natural disasters",
    },
    {
      icon: Car,
      title: "Instant Policy Issuance",
      description: "Get your insurance policy issued instantly online",
    },
    {
      icon: CreditCard,
      title: "Easy Premium Payment",
      description: "Multiple payment options with EMI facilities available",
    },
    {
      icon: Phone,
      title: "24x7 Claim Support",
      description: "Round-the-clock claim assistance and support",
    },
  ]

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
            <BreadcrumbPage>Car Insurance</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Car Insurance</h1>
          <p className="text-gray-600">Compare and buy the best car insurance policy for your vehicle</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {insuranceFeatures.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showQuotes ? (
          /* Quote Form */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Get Insurance Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Car Details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carBrand">Car Brand</Label>
                      <Select
                        value={formData.carBrand}
                        onValueChange={(value) => setFormData({ ...formData, carBrand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maruti">Maruti Suzuki</SelectItem>
                          <SelectItem value="hyundai">Hyundai</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="tata">Tata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carModel">Car Model</Label>
                      <Select
                        value={formData.carModel}
                        onValueChange={(value) => setFormData({ ...formData, carModel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="swift">Swift</SelectItem>
                          <SelectItem value="creta">Creta</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="carVariant">Car Variant</Label>
                    <Select
                      value={formData.carVariant}
                      onValueChange={(value) => setFormData({ ...formData, carVariant: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Variant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lxi">LXI</SelectItem>
                        <SelectItem value="vxi">VXI</SelectItem>
                        <SelectItem value="zxi">ZXI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registrationYear">Registration Year</Label>
                      <Select
                        value={formData.registrationYear}
                        onValueChange={(value) => setFormData({ ...formData, registrationYear: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => 2024 - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="bangalore">Bangalore</SelectItem>
                          <SelectItem value="pune">Pune</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
                    <Input
                      id="registrationNumber"
                      type="text"
                      placeholder="e.g., MH01AB1234"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Details</h3>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="previousInsurer">Previous Insurer (Optional)</Label>
                    <Select
                      value={formData.previousInsurer}
                      onValueChange={(value) => setFormData({ ...formData, previousInsurer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Previous Insurer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hdfc">HDFC ERGO</SelectItem>
                        <SelectItem value="icici">ICICI Lombard</SelectItem>
                        <SelectItem value="bajaj">Bajaj Allianz</SelectItem>
                        <SelectItem value="tata">Tata AIG</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="claimHistory">Claim History</Label>
                    <Select
                      value={formData.claimHistory}
                      onValueChange={(value) => setFormData({ ...formData, claimHistory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Claim History" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-claim">No Previous Claims</SelectItem>
                        <SelectItem value="1-claim">1 Claim in Last 3 Years</SelectItem>
                        <SelectItem value="2-claims">2+ Claims in Last 3 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleGetQuotes} className="w-full mt-6" size="lg">
                Get Insurance Quotes
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Insurance Quotes */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Insurance Quotes for Your Car</h2>
              <Button variant="outline" onClick={() => setShowQuotes(false)}>
                Modify Details
              </Button>
            </div>

            {/* Add-ons Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Add-on Covers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addOnOptions.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddOns.includes(addon.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddOns([...selectedAddOns, addon.id])
                          } else {
                            setSelectedAddOns(selectedAddOns.filter((id) => id !== addon.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={addon.id} className="font-medium cursor-pointer">
                          {addon.name}
                        </Label>
                        <p className="text-sm text-gray-600">+₹{addon.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Quotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insuranceProviders.map((provider, index) => (
                <Card key={index} className="relative">
                  {index === 1 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                      Best Value
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">{provider.provider}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{provider.rating}</span>
                        </div>
                      </div>
                      {provider.discount > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          {provider.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                          ₹
                          {(
                            provider.premium +
                            selectedAddOns.reduce((sum, id) => {
                              const addon = addOnOptions.find((a) => a.id === id)
                              return sum + (addon?.price || 0)
                            }, 0)
                          ).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/year</span>
                      </div>
                      <p className="text-sm text-gray-600">Coverage: {provider.coverage}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {provider.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1">Buy Now</Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Why Choose CarWale Insurance?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Trusted Partners</h3>
                <p className="text-gray-600 text-sm">We partner with top-rated insurance companies in India</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">Compare quotes and get the best deals on car insurance</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">24x7 Support</h3>
                <p className="text-gray-600 text-sm">Round-the-clock customer support for all your needs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
