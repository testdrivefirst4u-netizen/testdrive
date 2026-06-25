"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Check, X, Eye } from "lucide-react"

export function ReviewsManagement() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      carName: "Maruti Swift",
      userName: "Rahul Kumar",
      rating: 4,
      title: "Great car for city driving",
      content: "The Swift is perfect for daily commuting. Good mileage and comfortable ride.",
      date: "2024-01-15",
      status: "Pending",
    },
    {
      id: 2,
      carName: "Hyundai Creta",
      userName: "Priya Sharma",
      rating: 5,
      title: "Excellent SUV",
      content: "Amazing features and build quality. Highly recommended for families.",
      date: "2024-01-14",
      status: "Approved",
    },
    {
      id: 3,
      carName: "Tata Nexon",
      userName: "Amit Singh",
      rating: 3,
      title: "Average experience",
      content: "The car is okay but could be better in terms of service quality.",
      date: "2024-01-13",
      status: "Rejected",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const handleApprove = (id: number) => {
    setReviews(reviews.map((review) => (review.id === id ? { ...review, status: "Approved" } : review)))
  }

  const handleReject = (id: number) => {
    setReviews(reviews.map((review) => (review.id === id ? { ...review, status: "Rejected" } : review)))
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Reviews Management</h3>
          <p className="text-gray-600">Moderate and manage user reviews</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-yellow-600">
            {reviews.filter((r) => r.status === "Pending").length} Pending
          </Badge>
          <Badge variant="outline" className="text-green-600">
            {reviews.filter((r) => r.status === "Approved").length} Approved
          </Badge>
          <Badge variant="outline" className="text-red-600">
            {reviews.filter((r) => r.status === "Rejected").length} Rejected
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <Badge
                      variant={
                        review.status === "Approved"
                          ? "default"
                          : review.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="font-medium text-blue-600">{review.carName}</span>
                    <span className="text-gray-600">by {review.userName}</span>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>
                  <CardDescription className="text-gray-700">{review.content}</CardDescription>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {review.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(review.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(review.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
