"use client"

import { useState } from "react"
import { Calculator, CreditCard, FileText, CheckCircle } from "lucide-react"
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

export default function UsedCarLoanPage() {
  const [loanData, setLoanData] = useState({
    carPrice: "",
    downPayment: "",
    loanTenure: "",
    monthlyIncome: "",
    name: "",
    phone: "",
    email: "",
    city: "",
  })

  const [emiCalculation, setEmiCalculation] = useState<{
    emi: number
    totalAmount: number
    totalInterest: number
  } | null>(null)

  const calculateEMI = () => {
    const principal = Number.parseFloat(loanData.carPrice) - Number.parseFloat(loanData.downPayment || "0")
    const rate = 0.12 / 12 // 12% annual rate
    const tenure = Number.parseInt(loanData.loanTenure) * 12

    if (principal > 0 && tenure > 0) {
      const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1)
      const totalAmount = emi * tenure
      const totalInterest = totalAmount - principal

      setEmiCalculation({
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
      })
    }
  }

  const loanFeatures = [
    {
      icon: CreditCard,
      title: "Quick Approval",
      description: "Get loan approval in 24 hours",
    },
    {
      icon: Calculator,
      title: "Competitive Rates",
      description: "Interest rates starting from 8.5% per annum",
    },
    {
      icon: FileText,
      title: "Minimal Documentation",
      description: "Simple and hassle-free documentation process",
    },
    {
      icon: CheckCircle,
      title: "100% Financing",
      description: "Get up to 100% financing on car value",
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
            <BreadcrumbPage>Used Car Loan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Used Car Loan</h1>
          <p className="text-gray-600">Get instant approval for your used car loan with competitive interest rates</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {loanFeatures.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EMI Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>EMI Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="carPrice">Car Price (₹)</Label>
                  <Input
                    id="carPrice"
                    type="number"
                    placeholder="e.g., 800000"
                    value={loanData.carPrice}
                    onChange={(e) => setLoanData({ ...loanData, carPrice: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="downPayment">Down Payment (₹)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    placeholder="e.g., 200000"
                    value={loanData.downPayment}
                    onChange={(e) => setLoanData({ ...loanData, downPayment: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
                  <Select
                    value={loanData.loanTenure}
                    onValueChange={(value) => setLoanData({ ...loanData, loanTenure: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="7">7 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateEMI} className="w-full">
                  Calculate EMI
                </Button>

                {emiCalculation && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">EMI Calculation</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly EMI:</span>
                        <span className="font-bold">₹{emiCalculation.emi.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span>₹{emiCalculation.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest:</span>
                        <span>₹{emiCalculation.totalInterest.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loan Application */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="e.g., 50000"
                    value={loanData.monthlyIncome}
                    onChange={(e) => setLoanData({ ...loanData, monthlyIncome: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={loanData.name}
                    onChange={(e) => setLoanData({ ...loanData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={loanData.phone}
                    onChange={(e) => setLoanData({ ...loanData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loanData.email}
                    onChange={(e) => setLoanData({ ...loanData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Select value={loanData.city} onValueChange={(value) => setLoanData({ ...loanData, city: value })}>
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

                <Button className="w-full" size="lg">
                  Apply for Loan
                </Button>

                <p className="text-xs text-gray-500 text-center">By applying, you agree to our terms and conditions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Process */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Simple Loan Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Apply Online</h3>
                <p className="text-gray-600 text-sm">Fill the application form with basic details</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Document Verification</h3>
                <p className="text-gray-600 text-sm">Submit required documents for verification</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Approval</h3>
                <p className="text-gray-600 text-sm">Get instant approval within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">Disbursement</h3>
                <p className="text-gray-600 text-sm">Loan amount disbursed directly to dealer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
