"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarManagement } from "./car-management"
import { NewsManagement } from "./news-management"
import { ReviewsManagement } from "./reviews-management"
import { AdminStats } from "./admin-stats"
import { Car, Newspaper, Star, LogOut, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin/login")
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CarWale Admin</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your CarWale platform</p>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Cars</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Newspaper className="w-4 h-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Reviews</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="cars">
            <CarManagement />
          </TabsContent>

          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
