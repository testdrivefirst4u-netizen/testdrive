"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-xl">
              <Car className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Walley CMS</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center text-sm text-gray-400">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
