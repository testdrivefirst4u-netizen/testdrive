"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Newspaper, Send, Eye, TrendingUp } from "lucide-react"

export interface AdminStatsProps {
  publishedVehicles?: number
  users?: number
  news?: number
  newsletterSubscribers?: number
  totalViews?: number
  conversionRate?: number
}

export function AdminStats({
  publishedVehicles = 0,
  users = 0,
  news = 0,
  newsletterSubscribers = 0,
  totalViews = 0,
  conversionRate = 0,
}: AdminStatsProps) {
  const stats = [
    {
      title:   "Published Vehicles",
      value:   publishedVehicles.toLocaleString(),
      icon:    Car,
      color:   "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title:   "Registered Users",
      value:   users.toLocaleString(),
      icon:    Users,
      color:   "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title:   "News Articles",
      value:   news.toLocaleString(),
      icon:    Newspaper,
      color:   "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title:   "Newsletter Subscribers",
      value:   newsletterSubscribers.toLocaleString(),
      icon:    Send,
      color:   "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title:   "Total Vehicle Views",
      value:   totalViews.toLocaleString(),
      icon:    Eye,
      color:   "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title:   "Lead Conversion Rate",
      value:   `${conversionRate}%`,
      icon:    TrendingUp,
      color:   "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
