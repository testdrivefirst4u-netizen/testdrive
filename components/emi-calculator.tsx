"use client"

import { useState, useEffect } from "react"
import { Calculator, MapPin, TrendingUp, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface EMICalculatorProps {
  carPrice?: number
  carName?: string
}

interface EMIResult {
  monthlyEMI: number
  totalAmount: number
  totalInterest: number
  principalAmount: number
}

interface LocationData {
  city: string
  state: string
  country: string
}

export function EMICalculator({ carPrice = 800000, carName }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(carPrice * 0.8) // 80% of car price
  const [downPayment, setDownPayment] = useState(carPrice * 0.2) // 20% down payment
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTenure, setLoanTenure] = useState(5) // 5 years
  const [emiResult, setEMIResult] = useState<EMIResult | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Detect user location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Using a free geocoding service
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
                )
                const data = await response.json()
                setLocation({
                  city: data.city || data.locality || "Unknown",
                  state: data.principalSubdivision || "Unknown",
                  country: data.countryName || "India",
                })
              } catch (error) {
                console.error("Error fetching location:", error)
                setLocation({ city: "Mumbai", state: "Maharashtra", country: "India" })
              }
            },
            (error) => {
              console.error("Geolocation error:", error)
              setLocation({ city: "Mumbai", state: "Maharashtra", country: "India" })
            },
          )
        } else {
          setLocation({ city: "Mumbai", state: "Maharashtra", country: "India" })
        }
      } catch (error) {
        setLocation({ city: "Mumbai", state: "Maharashtra", country: "India" })
      }
    }

    detectLocation()
  }, [])

  // Update loan amount when car price or down payment changes
  useEffect(() => {
    const newLoanAmount = carPrice - downPayment
    setLoanAmount(Math.max(0, newLoanAmount))
  }, [carPrice, downPayment])

  // Calculate EMI
  const calculateEMI = () => {
    setIsCalculating(true)

    setTimeout(() => {
      const principal = loanAmount
      const monthlyRate = interestRate / 12 / 100
      const numberOfPayments = loanTenure * 12

      if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
        setEMIResult(null)
        setIsCalculating(false)
        return
      }

      // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

      const totalAmount = emi * numberOfPayments
      const totalInterest = totalAmount - principal

      setEMIResult({
        monthlyEMI: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        principalAmount: Math.round(principal),
      })
      setIsCalculating(false)
    }, 500) // Small delay for better UX
  }

  // Auto-calculate when values change
  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, loanTenure])

  const handleDownPaymentChange = (value: string) => {
    const amount = Number.parseFloat(value) || 0
    setDownPayment(Math.min(amount, carPrice))
  }

  const handleCarPriceChange = (value: string) => {
    const price = Number.parseFloat(value) || 0
    const newDownPayment = Math.min(downPayment, price)
    setDownPayment(newDownPayment)
  }

  return (
    <div className="space-y-6">
      {/* Location Display */}
      {location && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                Showing rates for:{" "}
                <strong>
                  {location.city}, {location.state}
                </strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>EMI Calculator {carName && `- ${carName}`}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Car Price */}
          <div>
            <Label htmlFor="carPrice">Car Price (₹)</Label>
            <Input
              id="carPrice"
              type="number"
              value={carPrice}
              onChange={(e) => handleCarPriceChange(e.target.value)}
              placeholder="Enter car price"
            />
          </div>

          {/* Down Payment */}
          <div>
            <Label htmlFor="downPayment">Down Payment (₹)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => handleDownPaymentChange(e.target.value)}
              placeholder="Enter down payment"
            />
            <div className="mt-2">
              <Label className="text-sm text-gray-600">Down Payment Percentage</Label>
              <Slider
                value={[Math.round((downPayment / carPrice) * 100)]}
                onValueChange={(value) => setDownPayment((carPrice * value[0]) / 100)}
                max={50}
                min={10}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>{Math.round((downPayment / carPrice) * 100)}%</span>
                <span>50%</span>
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
            <Select
              value={interestRate.toString()}
              onValueChange={(value) => setInterestRate(Number.parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interest rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7.5">7.5% - Excellent Credit</SelectItem>
                <SelectItem value="8.0">8.0% - Good Credit</SelectItem>
                <SelectItem value="8.5">8.5% - Average Credit</SelectItem>
                <SelectItem value="9.0">9.0% - Fair Credit</SelectItem>
                <SelectItem value="9.5">9.5% - Poor Credit</SelectItem>
                <SelectItem value="10.0">10.0% - Bad Credit</SelectItem>
                <SelectItem value="10.5">10.5% - Very Bad Credit</SelectItem>
                <SelectItem value="11.0">11.0% - Subprime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loan Tenure */}
          <div>
            <Label htmlFor="loanTenure">Loan Tenure</Label>
            <Select value={loanTenure.toString()} onValueChange={(value) => setLoanTenure(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year (12 months)</SelectItem>
                <SelectItem value="2">2 Years (24 months)</SelectItem>
                <SelectItem value="3">3 Years (36 months)</SelectItem>
                <SelectItem value="4">4 Years (48 months)</SelectItem>
                <SelectItem value="5">5 Years (60 months)</SelectItem>
                <SelectItem value="6">6 Years (72 months)</SelectItem>
                <SelectItem value="7">7 Years (84 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loan Amount Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Loan Amount</Label>
            <p className="text-2xl font-bold text-blue-600">₹{loanAmount.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* EMI Results */}
      {emiResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>EMI Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Label className="text-sm text-gray-600">Monthly EMI</Label>
                  <p className="text-3xl font-bold text-green-600">₹{emiResult.monthlyEMI.toLocaleString()}</p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border">
                  <Label className="text-sm text-gray-600">Total Interest</Label>
                  <p className="text-xl font-semibold text-orange-600">₹{emiResult.totalInterest.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Label className="text-sm text-gray-600">Total Amount Payable</Label>
                  <p className="text-xl font-semibold text-blue-700">₹{emiResult.totalAmount.toLocaleString()}</p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border">
                  <Label className="text-sm text-gray-600">Principal Amount</Label>
                  <p className="text-xl font-semibold text-blue-600">₹{emiResult.principalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-3">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Car Price:</span>
                  <span className="font-medium">₹{carPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Down Payment:</span>
                  <span className="font-medium">₹{downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan Amount:</span>
                  <span className="font-medium">₹{emiResult.principalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-medium">{interestRate}% per annum</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan Tenure:</span>
                  <span className="font-medium">
                    {loanTenure} years ({loanTenure * 12} months)
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Monthly EMI:</span>
                  <span className="text-green-600">₹{emiResult.monthlyEMI.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Apply for Loan</span>
              </Button>
              <Button variant="outline" className="flex-1">
                Get Best Rates
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Lenders
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 EMI Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-gray-600">
            <li>• Higher down payment reduces your EMI and total interest</li>
            <li>• Shorter loan tenure means higher EMI but lower total interest</li>
            <li>• Good credit score can help you get better interest rates</li>
            <li>• Compare rates from multiple lenders before finalizing</li>
            <li>• Consider processing fees and other charges in your budget</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
