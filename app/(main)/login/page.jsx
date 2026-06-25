"use client"

import { useState } from "react"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (data.role === "superadmin") {
      window.location = "/admin"
    }

    if (data.role === "dealer") {
      window.location = "/dealer"
    }

  }

  return (

    <div className="flex items-center justify-center h-screen">

      <div className="w-96 p-6 border rounded">

        <input
          placeholder="Email"
          className="w-full border p-2 mb-3"
        />

        <input
          placeholder="Password"
          className="w-full border p-2 mb-3"
        />

        <button
          onClick={login}
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>

      </div>

    </div>

  )

}