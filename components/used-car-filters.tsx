"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const brands = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota"]
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"]
const transmissions = ["Manual", "Automatic", "CVT", "AMT"]
const ownerTypes = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"]

export function UsedCarFilters() {
  const [priceRange, setPriceRange] = useState([0, 50])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [kmRange, setKmRange] = useState([0, 200000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [selectedOwnerTypes, setSelectedOwnerTypes] = useState<string[]>([])
  const [abSureOnly, setAbSureOnly] = useState(false)

  const clearAllFilters = () => {
    setPriceRange([0, 50])
    setYearRange([2010, 2024])
    setKmRange([0, 200000])
    setSelectedBrands([])
    setSelectedFuelTypes([])
    setSelectedTransmissions([])
    setSelectedOwnerTypes([])
    setAbSureOnly(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* abSure Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox id="absure" checked={abSureOnly} onCheckedChange={(checked) => setAbSureOnly(checked as boolean)} />
          <Label htmlFor="absure" className="text-sm font-medium text-green-600">
            Show only abSure cars
          </Label>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Price Range (₹ Lakh)</Label>
          <div className="px-2">
            <Slider value={priceRange} onValueChange={setPriceRange} max={50} step={1} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange[0]} L</span>
              <span>₹{priceRange[1]} L</span>
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Year</Label>
          <div className="px-2">
            <Slider value={yearRange} onValueChange={setYearRange} min={2000} max={2024} step={1} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        </div>

        {/* KM Driven */}
        <div>
          <Label className="text-base font-semibold mb-3 block">KM Driven</Label>
          <div className="px-2">
            <Slider value={kmRange} onValueChange={setKmRange} max={200000} step={5000} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{kmRange[0].toLocaleString()}</span>
              <span>{kmRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Brand</Label>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand])
                    } else {
                      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                    }
                  }}
                />
                <Label htmlFor={brand} className="text-sm cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Type Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Fuel Type</Label>
          <div className="space-y-2">
            {fuelTypes.map((fuel) => (
              <div key={fuel} className="flex items-center space-x-2">
                <Checkbox
                  id={fuel}
                  checked={selectedFuelTypes.includes(fuel)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFuelTypes([...selectedFuelTypes, fuel])
                    } else {
                      setSelectedFuelTypes(selectedFuelTypes.filter((f) => f !== fuel))
                    }
                  }}
                />
                <Label htmlFor={fuel} className="text-sm cursor-pointer">
                  {fuel}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Transmission Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Transmission</Label>
          <div className="space-y-2">
            {transmissions.map((transmission) => (
              <div key={transmission} className="flex items-center space-x-2">
                <Checkbox
                  id={transmission}
                  checked={selectedTransmissions.includes(transmission)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTransmissions([...selectedTransmissions, transmission])
                    } else {
                      setSelectedTransmissions(selectedTransmissions.filter((t) => t !== transmission))
                    }
                  }}
                />
                <Label htmlFor={transmission} className="text-sm cursor-pointer">
                  {transmission}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Owner Type Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Owner Type</Label>
          <div className="space-y-2">
            {ownerTypes.map((owner) => (
              <div key={owner} className="flex items-center space-x-2">
                <Checkbox
                  id={owner}
                  checked={selectedOwnerTypes.includes(owner)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOwnerTypes([...selectedOwnerTypes, owner])
                    } else {
                      setSelectedOwnerTypes(selectedOwnerTypes.filter((o) => o !== owner))
                    }
                  }}
                />
                <Label htmlFor={owner} className="text-sm cursor-pointer">
                  {owner}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
