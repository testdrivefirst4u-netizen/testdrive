"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, TrendingUp, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function CarValuationPage() {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    variant: "",
    year: "",
    kmDriven: "",
    city: "",
    ownerType: "",
  })
  const [valuation, setValuation] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate valuation calculation
    const basePrice = 800000 // 8 lakhs
    const yearDepreciation = (2024 - Number.parseInt(formData.year)) * 50000
    const kmDepreciation = (Number.parseInt(formData.kmDriven) / 10000) * 25000
    const ownerDepreciation = formData.ownerType === "2nd" ? 30000 : formData.ownerType === "3rd" ? 60000 : 0

    const estimatedValue = Math.max(basePrice - yearDepreciation - kmDepreciation - ownerDepreciation, 200000)
    setValuation(estimatedValue)
  }

  const features = [
    {
      icon: Calculator,
      title: "Accurate Valuation",
      description: "Get precise market value based on real-time data",
    },
    {
      icon: TrendingUp,
      title: "Market Trends",
      description: "Valuation based on current market trends and demand",
    },
    {
      icon: Award,
      title: "Expert Analysis",
      description: "Evaluated by automotive experts and AI algorithms",
    },
    {
      icon: Users,
      title: "Trusted by Millions",
      description: "Over 10 million car valuations completed successfully",
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
            <BreadcrumbPage>Car Valuation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Check Your Car's Value</h1>
          <p className="text-gray-600">
            Get instant and accurate valuation of your car based on current market conditions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData({ ...formData, brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maruti">Maruti Suzuki</SelectItem>
                        <SelectItem value="hyundai">Hyundai</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="tata">Tata</SelectItem>
                        <SelectItem value="mahindra">Mahindra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swift">Swift</SelectItem>
                        <SelectItem value="baleno">Baleno</SelectItem>
                        <SelectItem value="creta">Creta</SelectItem>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="nexon">Nexon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Select
                    value={formData.variant}
                    onValueChange={(value) => setFormData({ ...formData, variant: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lxi">LXI</SelectItem>
                      <SelectItem value="vxi">VXI</SelectItem>
                      <SelectItem value="zxi">ZXI</SelectItem>
                      <SelectItem value="zxi-plus">ZXI Plus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year of Purchase</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
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
                    <Label htmlFor="kmDriven">KM Driven</Label>
                    <Input
                      id="kmDriven"
                      type="number"
                      placeholder="e.g., 45000"
                      value={formData.kmDriven}
                      onChange={(e) => setFormData({ ...formData, kmDriven: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ownerType">Owner Type</Label>
                    <Select
                      value={formData.ownerType}
                      onValueChange={(value) => setFormData({ ...formData, ownerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Owner</SelectItem>
                        <SelectItem value="2nd">2nd Owner</SelectItem>
                        <SelectItem value="3rd">3rd Owner</SelectItem>
                        <SelectItem value="4th">4th+ Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Get Car Valuation
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {valuation && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Your Car's Estimated Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">₹{(valuation / 100000).toFixed(2)} L</div>
                    <p className="text-gray-600 mb-4">Current Market Value</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Minimum Value</p>
                        <p className="text-green-600">₹{((valuation * 0.9) / 100000).toFixed(2)} L</p>
                      </div>
                      <div>
                        <p className="font-medium">Maximum Value</p>
                        <p className="text-green-600">₹{((valuation * 1.1) / 100000).toFixed(2)} L</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Sell Your Car Now</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Why Use Our Valuation Tool?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <feature.icon className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
