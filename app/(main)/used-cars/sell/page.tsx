"use client"

import { useState } from "react"
import { Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function SellCarPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Details
    brand: "",
    model: "",
    variant: "",
    year: "",
    kmDriven: "",
    fuelType: "",
    transmission: "",
    ownerType: "",

    // Pricing
    expectedPrice: "",

    // Contact Details
    name: "",
    phone: "",
    email: "",
    city: "",

    // Additional Details
    description: "",
    features: [] as string[],

    // Documents
    hasRC: false,
    hasInsurance: false,
    hasPUC: false,
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const carFeatures = [
    "Air Conditioning",
    "Power Steering",
    "ABS",
    "Airbags",
    "Alloy Wheels",
    "Central Locking",
    "Power Windows",
    "Music System",
    "Bluetooth",
    "GPS Navigation",
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
            <BreadcrumbPage>Sell Your Car</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell Your Car</h1>
          <p className="text-gray-600">Get the best price for your car with our trusted platform</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && <div className={`w-16 h-1 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Car Details"}
              {step === 2 && "Pricing & Contact"}
              {step === 3 && "Additional Information"}
              {step === 4 && "Photos & Documents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
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
                  <Label htmlFor="variant">Variant *</Label>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
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
                    <Label htmlFor="kmDriven">KM Driven *</Label>
                    <Input
                      id="kmDriven"
                      type="number"
                      placeholder="e.g., 45000"
                      value={formData.kmDriven}
                      onChange={(e) => setFormData({ ...formData, kmDriven: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Fuel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="amt">AMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ownerType">Owner Type *</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expectedPrice">Expected Price (₹) *</Label>
                  <Input
                    id="expectedPrice"
                    type="number"
                    placeholder="e.g., 650000"
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="city">City *</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
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
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Car Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your car's condition, maintenance history, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Car Features</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {carFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, features: [...formData.features, feature] })
                            } else {
                              setFormData({ ...formData, features: formData.features.filter((f) => f !== feature) })
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Upload Car Photos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Upload high-quality photos of your car</p>
                    <p className="text-sm text-gray-500 mb-4">Front, Back, Interior, Engine Bay (Max 10 photos)</p>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photos
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Documents Available</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasRC"
                        checked={formData.hasRC}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasRC: checked as boolean })}
                      />
                      <Label htmlFor="hasRC">Registration Certificate (RC)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasInsurance"
                        checked={formData.hasInsurance}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasInsurance: checked as boolean })}
                      />
                      <Label htmlFor="hasInsurance">Valid Insurance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPUC"
                        checked={formData.hasPUC}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasPUC: checked as boolean })}
                      />
                      <Label htmlFor="hasPUC">Pollution Under Control (PUC)</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {step < 4 ? (
                <Button onClick={handleNext} className="ml-auto">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="ml-auto">
                  Submit Listing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
