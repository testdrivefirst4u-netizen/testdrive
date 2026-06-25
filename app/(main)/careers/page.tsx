import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ChevronRight, MapPin, Clock, ArrowRight, Users, Zap, Heart, Star, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at Walley by Broaddcast — Join Our Team",
  description: "Join Walley (Broaddcast) and help build India's best automotive marketplace. We're hiring engineers, designers, content writers, and sales professionals.",
};

const JOBS = [
  { title: "Senior Frontend Engineer", dept: "Engineering", location: "Hyderabad / Remote", type: "Full-time", exp: "3–6 years", skills: ["React", "Next.js", "TypeScript"], new: true },
  { title: "Backend Engineer (Node.js / Prisma)", dept: "Engineering", location: "Hyderabad / Remote", type: "Full-time", exp: "2–5 years", skills: ["Node.js", "PostgreSQL", "MongoDB"], new: true },
  { title: "Automotive Content Writer", dept: "Editorial", location: "Hyderabad", type: "Full-time", exp: "1–3 years", skills: ["Auto Journalism", "SEO", "Video Scripts"], new: false },
  { title: "Dealer Relations Manager", dept: "Sales", location: "Hyderabad / Mumbai", type: "Full-time", exp: "2–4 years", skills: ["B2B Sales", "CRM", "Automotive Industry"], new: false },
  { title: "Product Designer (UI/UX)", dept: "Design", location: "Remote", type: "Full-time", exp: "2–4 years", skills: ["Figma", "Prototyping", "User Research"], new: true },
  { title: "Digital Marketing Executive", dept: "Marketing", location: "Hyderabad", type: "Full-time", exp: "1–3 years", skills: ["Meta Ads", "Google Ads", "Analytics"], new: false },
];

const PERKS = [
  { Icon: Zap, title: "Fast-Moving Startup", desc: "Ship features weekly. Your work is live for millions of users." },
  { Icon: Heart, title: "Health & Wellness", desc: "Full medical cover for you and your family from day one." },
  { Icon: Star, title: "Competitive Pay", desc: "Market-leading salaries + ESOPs for all permanent employees." },
  { Icon: Users, title: "Great Team", desc: "Work with alumni from IIT, BITS, Google, Amazon, and Ola." },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Editorial: "bg-purple-100 text-purple-700",
  Sales: "bg-green-100 text-green-700",
  Design: "bg-pink-100 text-pink-700",
  Marketing: "bg-amber-100 text-amber-700",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-7">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Careers</span>
          </nav>
          <div className="w-14 h-14 bg-blue-700/50 border border-blue-400/30 rounded-2xl flex items-center justify-center mb-6">
            <Briefcase className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 max-w-2xl leading-tight">
            Build the Future of<br />Car Buying in India
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
            We&apos;re a small, hungry team building a product that millions of Indians use to make one of the biggest purchases of their lives. Come make it better.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "15 Team Members" },
              { label: "Hyderabad HQ" },
              { label: "Remote-Friendly" },
              { label: "Series A — Funded" },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PERKS.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-700" />
              </div>
              <p className="font-bold text-sm text-gray-900 mb-1.5">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Open roles */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Open Positions</h2>
          <span className="text-sm text-gray-400">{JOBS.length} roles</span>
        </div>

        <div className="space-y-3 mb-12">
          {JOBS.map((j) => (
            <div key={j.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{j.title}</h3>
                    {j.new && <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DEPT_COLORS[j.dept]}`}>{j.dept}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {j.type}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {j.exp}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {j.skills.map((s) => (
                      <span key={s} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <a href={`mailto:careers@broaddcast.com?subject=Application: ${encodeURIComponent(j.title)}`}
                  className="flex-shrink-0 flex items-center gap-2 h-10 px-5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">
                  Apply <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Open application */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white text-center">
          <h3 className="text-xl font-extrabold mb-2">Don&apos;t see a fit?</h3>
          <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
            We&apos;re always on the lookout for exceptional people. Send us your CV and tell us how you&apos;d contribute to the team.
          </p>
          <a href="mailto:careers@broaddcast.com?subject=Open Application"
            className="inline-flex items-center gap-2 h-11 px-8 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all">
            Send Open Application
          </a>
        </div>
      </div>
    </div>
  );
}
