"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Car, X } from "lucide-react"

export function ContactPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
  })

  useEffect(() => {
    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    alert("Thank you! We will contact you soon.")
    setIsOpen(false)
    setFormData({ name: "", phone: "", carModel: "" })
  }

  const carModels = [
    "Maruti Swift",
    "Hyundai Creta",
    "Tata Nexon",
    "Mahindra Thar",
    "Honda City",
    "Toyota Innova",
    "Maruti Baleno",
    "Hyundai i20",
    "Tata Harrier",
    "Mahindra XUV700",
    "Other",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <DialogTitle>Get Best Car Deals!</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Share your details and get personalized car recommendations with best prices
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carModel">Interested Car Model</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, carModel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select car model" />
                  </SelectTrigger>
                  <SelectContent>
                    {carModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Maybe Later
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  Get Best Deals
                </Button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-800 font-medium">
                  🎉 Special Offer: Get up to ₹50,000 discount on selected cars!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
