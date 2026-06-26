"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock, MessageSquare, ChevronRight, Loader2, Tag } from "lucide-react";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "", brandId: "" };

interface Brand { id: string; name: string }

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : (d.brands ?? [])))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, brandId: form.brandId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Contact Us</span>
          </nav>
          <h1 className="text-3xl font-extrabold mb-2">Get in Touch</h1>
          <p className="text-blue-200 text-sm max-w-lg">
            Have a question? Our team is here to help. Reach us by phone, email, or drop a message below.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ ...EMPTY }); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Send a Message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name *</label>
                      <input required type="text" placeholder="Rahul Sharma" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone *</label>
                      <input required type="tel" placeholder="9876543210" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <input type="email" placeholder="you@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject *</label>
                    <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white appearance-none">
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Test Drive Booking</option>
                      <option>EMI / Finance Help</option>
                      <option>Dealer Complaint</option>
                      <option>Advertise With Us</option>
                      <option>Technical Support</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {brands.length > 0 && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        <Tag className="w-3 h-3 text-blue-500" /> Brand
                      </label>
                      <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white appearance-none">
                        <option value="">Select brand (optional)</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Message *</label>
                    <textarea required rows={5} placeholder="How can we help you?" value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all resize-none" />
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full h-12 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {[
              { Icon: Phone, label: "Helpline", value: "1800-123-4567", sub: "Mon–Sat, 9am–7pm", href: "tel:+911800123456", color: "text-blue-600 bg-blue-50" },
              { Icon: Mail,  label: "Email",    value: "support@broaddcast.com", sub: "Reply within 24 hours", href: "mailto:support@broaddcast.com", color: "text-purple-600 bg-purple-50" },
              { Icon: MapPin,label: "Office",   value: "Hyderabad, Telangana", sub: "Broaddcast Technologies", href: "#", color: "text-green-600 bg-green-50" },
              { Icon: Clock, label: "Hours",    value: "Mon – Sat", sub: "9:00 AM to 7:00 PM IST", href: "#", color: "text-orange-600 bg-orange-50" },
            ].map(({ Icon, label, value, sub, href, color }) => (
              <a key={label} href={href}
                className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </a>
            ))}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-amber-800 mb-1">Quick Help</p>
              <p className="text-xs text-amber-700 mb-3">For test drive bookings or price queries, use our dedicated tools:</p>
              <div className="space-y-2">
                <Link href="/test-drive" className="block text-xs font-semibold text-blue-700 bg-white border border-blue-100 rounded-xl px-3 py-2.5 hover:bg-blue-50 transition-colors">
                  → Book a Test Drive
                </Link>
                <Link href="/emi-calculator" className="block text-xs font-semibold text-blue-700 bg-white border border-blue-100 rounded-xl px-3 py-2.5 hover:bg-blue-50 transition-colors">
                  → Calculate EMI
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
