"use client";

import { useState, useEffect } from "react";
import { Loader2, BrainCircuit, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AI_FEATURES = [
  { icon: "✍️", title: "Vehicle Description", desc: "Auto-generate rich vehicle descriptions" },
  { icon: "👍", title: "Pros & Cons", desc: "Generate balanced pros and cons for any vehicle" },
  { icon: "💡", title: "Key Highlights", desc: "Extract and generate key feature highlights" },
  { icon: "❓", title: "FAQs", desc: "Generate common questions and answers for vehicles" },
  { icon: "🔍", title: "SEO Content", desc: "Generate meta titles, descriptions, and keywords" },
  { icon: "📝", title: "News Excerpts", desc: "Auto-generate article summaries and excerpts" },
  { icon: "🔄", title: "Comparison Summaries", desc: "AI-powered vehicle comparison conclusions" },
];

export default function AISettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings?key=openai_api_key")
      .then((r) => r.json())
      .then((d) => { if (d.value) setApiKey(d.value); })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "openai_api_key", value: apiKey, label: "OpenAI API Key", group: "ai", type: "string" }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("API key saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!apiKey) { toast.error("Enter an API key first"); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "description", vehicleName: "Test Car", brand: "Test Brand", type: "CAR" }),
      });
      if (res.ok) {
        setTestResult("success");
        toast.success("AI connection successful!");
      } else {
        setTestResult("error");
        toast.error("AI connection failed");
      }
    } catch {
      setTestResult("error");
      toast.error("AI connection failed");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">AI Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure OpenAI integration for content generation</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>OpenAI Configuration</CardTitle>
              <CardDescription>Connect your OpenAI API key to enable AI features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={show ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 font-mono text-sm"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></p>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${testResult === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <CheckCircle className="w-4 h-4" />
              {testResult === "success" ? "API key is valid and working" : "API key is invalid or quota exceeded"}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700" disabled={saving || !apiKey}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save API Key
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing || !apiKey}>
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Features Available</CardTitle>
          <CardDescription>Features unlocked when API key is configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {AI_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 border rounded-lg">
                <span className="text-xl">{f.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
                <Badge className={apiKey ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                  {apiKey ? "Ready" : "Needs key"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
