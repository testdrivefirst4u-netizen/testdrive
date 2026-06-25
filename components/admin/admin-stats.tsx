"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Newspaper, Star, TrendingUp, Eye } from "lucide-react"

export function AdminStats() {
  const stats = [
    {
      title: "Total Cars",
      value: "1,234",
      change: "+12%",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Users",
      value: "45,678",
      change: "+8%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "News Articles",
      value: "89",
      change: "+5%",
      icon: Newspaper,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Reviews",
      value: "2,456",
      change: "+15%",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Page Views",
      value: "123,456",
      change: "+22%",
      icon: Eye,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="space-y-6">
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
              <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New car added", item: "Honda City 2024", time: "2 hours ago" },
                { action: "Review published", item: "Maruti Swift Review", time: "4 hours ago" },
                { action: "News article updated", item: "EV Market Trends", time: "6 hours ago" },
                { action: "User registered", item: "john.doe@email.com", time: "8 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Car className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium">Add New Car</p>
                <p className="text-sm text-gray-600">Add car to inventory</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Newspaper className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium">Create Article</p>
                <p className="text-sm text-gray-600">Write news article</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-6 h-6 text-yellow-600 mb-2" />
                <p className="font-medium">Moderate Reviews</p>
                <p className="text-sm text-gray-600">Review submissions</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium">User Management</p>
                <p className="text-sm text-gray-600">Manage users</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
