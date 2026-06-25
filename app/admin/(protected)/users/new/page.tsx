"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("User created");
      router.push("/admin/users");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">Add User</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new admin user</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="Min 8 characters" minLength={8} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
