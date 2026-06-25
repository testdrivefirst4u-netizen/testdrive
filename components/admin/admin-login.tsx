"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield } from "lucide-react"

export function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Demo credentials - in real app, validate against backend
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminAuth", "true")
      router.push("/admin")
    } else {
      alert("Invalid credentials. Use admin/admin123")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Panel</CardTitle>
          <CardDescription className="text-gray-600">Sign in to manage CarWale platform</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="h-11 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
          <p className="text-sm text-blue-600">Username: admin</p>
          <p className="text-sm text-blue-600">Password: admin123</p>
        </div>
      </CardContent>
    </Card>
  )
}
