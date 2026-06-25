"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export function CarManagement() {
  const [cars, setCars] = useState([
    {
      id: 1,
      name: "Maruti Swift",
      brand: "Maruti Suzuki",
      price: "₹5.85 - 8.67 Lakh",
      type: "Hatchback",
      fuel: "Petrol",
      status: "Active",
    },
    {
      id: 2,
      name: "Hyundai Creta",
      brand: "Hyundai",
      price: "₹10.87 - 19.20 Lakh",
      type: "SUV",
      fuel: "Petrol/Diesel",
      status: "Active",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    price: "",
    type: "",
    fuel: "",
    engine: "",
    mileage: "",
    transmission: "",
    description: "",
    features: "",
    image: "",
  })

  const handleAddCar = () => {
    const car = {
      id: cars.length + 1,
      name: newCar.name,
      brand: newCar.brand,
      price: newCar.price,
      type: newCar.type,
      fuel: newCar.fuel,
      status: "Active",
    }
    setCars([...cars, car])
    setNewCar({
      name: "",
      brand: "",
      price: "",
      type: "",
      fuel: "",
      engine: "",
      mileage: "",
      transmission: "",
      description: "",
      features: "",
      image: "",
    })
    setIsAddDialogOpen(false)
  }

  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Car Management</h3>
          <p className="text-gray-600">Manage your car inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Car</DialogTitle>
              <DialogDescription>Add a new car to your inventory with all details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Car Name</Label>
                <Input
                  id="name"
                  value={newCar.name}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  placeholder="e.g., Maruti Swift"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select onValueChange={(value) => setNewCar({ ...newCar, brand: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maruti">Maruti Suzuki</SelectItem>
                    <SelectItem value="hyundai">Hyundai</SelectItem>
                    <SelectItem value="tata">Tata</SelectItem>
                    <SelectItem value="mahindra">Mahindra</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price Range</Label>
                <Input
                  id="price"
                  value={newCar.price}
                  onChange={(e) => setNewCar({ ...newCar, price: e.target.value })}
                  placeholder="e.g., ₹5.85 - 8.67 Lakh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Body Type</Label>
                <Select onValueChange={(value) => setNewCar({ ...newCar, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="muv">MUV</SelectItem>
                    <SelectItem value="coupe">Coupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <Select onValueChange={(value) => setNewCar({ ...newCar, fuel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine">Engine</Label>
                <Input
                  id="engine"
                  value={newCar.engine}
                  onChange={(e) => setNewCar({ ...newCar, engine: e.target.value })}
                  placeholder="e.g., 1.2L VVT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  value={newCar.mileage}
                  onChange={(e) => setNewCar({ ...newCar, mileage: e.target.value })}
                  placeholder="e.g., 22.38 kmpl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select onValueChange={(value) => setNewCar({ ...newCar, transmission: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                    <SelectItem value="amt">AMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newCar.image}
                  onChange={(e) => setNewCar({ ...newCar, image: e.target.value })}
                  placeholder="https://example.com/car-image.jpg"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCar.description}
                  onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
                  placeholder="Enter car description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="features">Key Features (comma separated)</Label>
                <Textarea
                  id="features"
                  value={newCar.features}
                  onChange={(e) => setNewCar({ ...newCar, features: e.target.value })}
                  placeholder="ABS, Airbags, Power Steering, AC..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCar} className="bg-gradient-to-r from-red-500 to-orange-500">
                Add Car
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <Card key={car.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{car.name}</CardTitle>
                  <CardDescription>{car.brand}</CardDescription>
                </div>
                <Badge variant={car.status === "Active" ? "default" : "secondary"}>{car.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Price:</span> {car.price}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {car.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Fuel:</span> {car.fuel}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
