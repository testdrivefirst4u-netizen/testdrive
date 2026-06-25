"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// ─── colour tokens ───────────────────────────────────────────────────────────
const AUDI_RED = "#BB0A21";
const AUDI_DARK = "#1A1A1A";
const GOLD = "#C9A84C";
const SLATE = "#64748b";
const PIE_COLORS = ["#BB0A21", "#1e3a5f", "#C9A84C", "#2563eb", "#16a34a"];

// ─── data ─────────────────────────────────────────────────────────────────────
const mayVsJune = [
  { metric: "Leads", May: 109, June: 80 },
  { metric: "Spend (₹K)", May: 103.7, June: 118 },
  { metric: "Avg CPL (₹)", May: 953, June: 1474 },
  { metric: "CTR %", May: 0.7, June: 0.74 },
];

const impressionsReach = [
  { metric: "Impressions (M)", May: 9.51, June: 7.48 },
  { metric: "Reach (L)", May: 4.41, June: 4.47 },
];

const campaigns = [
  { name: "Audi A6 Video Jun", model: "A6", type: "Video", leads: 3, qsl: 0, qslPct: "0%", cpl: 3160, spend: 9481 },
  { name: "Audi A6 Static Jun", model: "A6", type: "Static", leads: 5, qsl: 0, qslPct: "0%", cpl: 1650, spend: 8248 },
  { name: "Audi Q3 June campaign", model: "Q3", type: "Static", leads: 11, qsl: 0, qslPct: "0%", cpl: 690, spend: 7590 },
  { name: "Audi Q3 June 2nd", model: "Q3", type: "Static", leads: 1, qsl: 0, qslPct: "0%", cpl: 5251, spend: 5251 },
  { name: "Audi Q3 vid Jun", model: "Q3", type: "Video", leads: 5, qsl: 2, qslPct: "40%", cpl: 1146, spend: 5731 },
  { name: "Audi Q3 Video Jun 2026", model: "Q3", type: "Video", leads: 10, qsl: 2, qslPct: "20%", cpl: 1246, spend: 12462 },
  { name: "Audi Q3 Remarketing", model: "Q3", type: "Static", leads: 1, qsl: 0, qslPct: "0%", cpl: 3239, spend: 3239 },
  { name: "Audi Q5 Video Jun", model: "Q5", type: "Video", leads: 14, qsl: 6, qslPct: "43%", cpl: 874, spend: 12241 },
  { name: "Audi Q5 June 2", model: "Q5", type: "Static", leads: 4, qsl: 0, qslPct: "0%", cpl: 1439, spend: 5754 },
  { name: "Audi Q5 vid Jun", model: "Q5", type: "Video", leads: 5, qsl: 4, qslPct: "80%", cpl: 1230, spend: 6148 },
  { name: "Audi Q5 Remarketing", model: "Q5", type: "Static", leads: 3, qsl: 0, qslPct: "0%", cpl: 1313, spend: 3938 },
  { name: "Audi Q7 June 2nd", model: "Q7", type: "Static", leads: 3, qsl: 0, qslPct: "0%", cpl: 7225, spend: 21676 },
  { name: "Audi Q7 June", model: "Q7", type: "Static", leads: 5, qsl: 0, qslPct: "0%", cpl: 1049, spend: 5243 },
  { name: "Audi SQ8 Static Jun", model: "SQ8", type: "Static", leads: 5, qsl: 1, qslPct: "20%", cpl: 1138, spend: 5689 },
  { name: "Audi SQ8 Video Jun", model: "SQ8", type: "Video", leads: 5, qsl: 1, qslPct: "20%", cpl: 1054, spend: 5269 },
];

const modelContribution = [
  { name: "Q5", value: 44, leads: 35 },
  { name: "Q3", value: 33, leads: 26 },
  { name: "Q7", value: 8, leads: 6 },
  { name: "SQ8", value: 10, leads: 8 },
  { name: "A6", value: 6, leads: 5 },
];

const cityData = [
  { city: "Hyderabad", leads: 53, qualified: 9, pct: "66%" },
  { city: "Vijayawada", leads: 22, qualified: 7, pct: "28%" },
  { city: "Visakhapatnam", leads: 5, qualified: 0, pct: "6%" },
];

const leadStatus = [
  { name: "Call Back", value: 37, color: "#2563eb" },
  { name: "No Remarks", value: 19, color: "#f97316" },
  { name: "Qualified", value: 16, color: "#16a34a" },
  { name: "Not Interested", value: 6, color: "#BB0A21" },
  { name: "Test Call", value: 2, color: "#64748b" },
];

const googleAds = [
  { metric: "Clicks", May: 174000, June: 194000 },
  { metric: "Impressions", May: 1470000, June: 1490000 },
];

const googleMetrics = [
  { name: "Clicks", may: "174K", june: "194K", change: "+11.5%", up: true },
  { name: "Impressions", may: "1.47M", june: "1.49M", change: "+1.4%", up: true },
  { name: "CTR", may: "11.78%", june: "12.98%", change: "+10.2%", up: true },
  { name: "Conv. Rate", may: "93.40%", june: "93.92%", change: "+0.52%", up: true },
];

const northDealers = [
  { name: "Audi Delhi South", total: 13, static: 5, video: 5, carousel: 3 },
  { name: "Audi Delhi West", total: 14, static: 5, video: 5, carousel: 4 },
  { name: "Audi Mumbai West", total: 19, static: 5, video: 6, carousel: 8 },
];

const southDealers = [
  { name: "Audi Bengaluru Central", total: 9, static: 4, video: 5, carousel: 0 },
  { name: "Audi Kochi", total: 12, static: 5, video: 7, carousel: 0 },
  { name: "Audi Chennai", total: 13, static: 7, video: 6, carousel: 0 },
];

const hydDealers = [
  { name: "Audi Hyderabad", total: 17, static: 8, video: 8, carousel: 1 },
  { name: "Audi Hyderabad Central", total: 5, static: 1, video: 4, carousel: 0 },
];

const julyPlan = [
  { channel: "Google Ads – Sales", campaign: "Search + Call + PMAX", budget: 150000, leads: 80 },
  { channel: "Meta Ads – Sales", campaign: "Lead Generation", budget: 200000, leads: 200 },
  { channel: "Google Ads – Service", campaign: "Search + Call", budget: 20000, leads: 10 },
  { channel: "Meta – Service", campaign: "Lead Gen + Awareness", budget: 20000, leads: 15 },
  { channel: "LinkedIn Ads", campaign: "Sponsored + Lead Forms", budget: 70000, leads: 25 },
  { channel: "Social Media", campaign: "Organic Content", budget: 20000, leads: 0 },
  { channel: "GMB", campaign: "GMB Management", budget: 20000, leads: 0 },
  { channel: "Creative Adaptation", campaign: "Resize & Platform", budget: 48000, leads: 0 },
  { channel: "Agency Charges", campaign: "Campaign Management", budget: 46000, leads: 0 },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function cplColor(cpl: number) {
  if (cpl <= 1000) return "text-green-600 font-semibold";
  if (cpl <= 1500) return "text-yellow-600 font-semibold";
  return "text-red-600 font-semibold";
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-6 rounded-full" style={{ background: AUDI_RED }} />
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
    </div>
  );
}

function DealerTable({ data }: { data: typeof northDealers }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            <th className="text-left p-3 font-medium">Dealer</th>
            <th className="text-center p-3 font-medium">Total</th>
            <th className="text-center p-3 font-medium">Static</th>
            <th className="text-center p-3 font-medium">Video</th>
            <th className="text-center p-3 font-medium">Carousel</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="p-3 font-medium text-gray-800">{d.name}</td>
              <td className="p-3 text-center font-bold" style={{ color: AUDI_RED }}>{d.total}</td>
              <td className="p-3 text-center">{d.static}</td>
              <td className="p-3 text-center">{d.video}</td>
              <td className="p-3 text-center">{d.carousel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AudiJuneDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Audi rings SVG */}
            <svg width="48" height="16" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              {[0, 22, 44, 66].map((x) => (
                <circle key={x} cx={x + 12} cy="15" r="11" stroke={AUDI_DARK} strokeWidth="2.5" fill="none" />
              ))}
            </svg>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Imperion Audi · Hyderabad</p>
              <h1 className="text-xl font-bold text-gray-900">June 2026 Performance Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">Till 20th June 2026</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: AUDI_RED }}>
              BroaddCast Business Solutions
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ── KPI Summary ── */}
        <section>
          <SectionTitle>Campaign Overview — June (till 20th)</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label="Meta Leads" value="80" sub="vs 109 in May" accent="text-red-600" />
            <KpiCard label="Meta Spend" value="₹1.18L" sub="+12% vs May" />
            <KpiCard label="Avg CPL" value="₹1,474" sub="+55% vs May" accent="text-orange-600" />
            <KpiCard label="QSL (Qualified)" value="16 / 80" sub="20% quality rate" accent="text-green-600" />
            <KpiCard label="Google Clicks" value="194K" sub="+11.5% vs May" accent="text-blue-600" />
            <KpiCard label="Google CTR" value="12.98%" sub="+10.2% vs May" accent="text-green-600" />
          </div>
        </section>

        {/* ── Meta May vs June ── */}
        <section>
          <SectionTitle>Meta Ads — May vs June Comparison</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* leads & CPL bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Leads & CPL Comparison</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mayVsJune} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="May" fill={AUDI_DARK} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="June" fill={AUDI_RED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* impressions & reach */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Impressions & Reach</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={impressionsReach} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="May" fill={AUDI_DARK} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="June" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* comparison badges */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Leads", may: "109", jun: "80", pct: "−36%", up: false },
              { label: "Spend", may: "₹1.04L", jun: "₹1.18L", pct: "+12%", up: true },
              { label: "Avg CPL", may: "₹953", jun: "₹1,474", pct: "+55%", up: false },
              { label: "Impressions", may: "9.51M", jun: "7.48M", pct: "−27%", up: false },
              { label: "Reach", may: "4.41L", jun: "4.47L", pct: "+1%", up: true },
              { label: "CTR", may: "0.70%", jun: "0.74%", pct: "+5%", up: true },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-xs text-gray-500">May: {item.may}</p>
                <p className="text-xs text-gray-700 font-medium">Jun: {item.jun}</p>
                <span className={`text-xs font-bold ${item.up ? "text-green-600" : "text-red-600"}`}>{item.pct}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lead Analysis ── */}
        <section>
          <SectionTitle>Lead Quality & City Breakdown</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* lead status pie */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Lead Status Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={leadStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {leadStatus.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-3 space-y-1">
                {leadStatus.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-semibold">{s.value} ({Math.round((s.value / 80) * 100)}%)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* city breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">City-wise Leads</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cityData} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="leads" name="Total Leads" fill={AUDI_RED} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="qualified" name="Qualified" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {cityData.map((c) => (
                  <div key={c.city} className="flex justify-between text-xs border-b border-gray-50 pb-1">
                    <span className="text-gray-600">{c.city}</span>
                    <span>{c.leads} leads · {c.qualified} qualified · <strong>{c.pct}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* model contribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Model-wise Contribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={modelContribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {modelContribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-3 space-y-1">
                {modelContribution.map((m, i) => (
                  <li key={m.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} />
                      {m.name}
                    </span>
                    <span className="font-semibold">{m.leads} leads ({m.value}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Campaign Performance Table ── */}
        <section>
          <SectionTitle>Meta Campaign Performance — June (All 15 Campaigns)</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100" style={{ background: "#f8f9fb" }}>
                    <th className="text-left p-3 font-medium">Campaign</th>
                    <th className="text-center p-3 font-medium">Model</th>
                    <th className="text-center p-3 font-medium">Type</th>
                    <th className="text-center p-3 font-medium">Leads</th>
                    <th className="text-center p-3 font-medium">QSL</th>
                    <th className="text-center p-3 font-medium">QSL %</th>
                    <th className="text-center p-3 font-medium">CPL (₹)</th>
                    <th className="text-center p-3 font-medium">Spend (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-800 font-medium max-w-[200px] truncate">{c.name}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: AUDI_RED }}>
                          {c.model}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-medium ${c.type === "Video" ? "text-blue-600" : "text-gray-600"}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-gray-800">{c.leads}</td>
                      <td className="p-3 text-center font-semibold text-green-700">{c.qsl}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-bold ${c.qsl > 0 ? "text-green-600" : "text-gray-400"}`}>{c.qslPct}</span>
                      </td>
                      <td className={`p-3 text-center ${cplColor(c.cpl)}`}>₹{c.cpl.toLocaleString()}</td>
                      <td className="p-3 text-center text-gray-600">₹{c.spend.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-sm border-t-2 border-gray-200" style={{ background: "#f8f9fb" }}>
                    <td className="p-3" colSpan={3}>Total</td>
                    <td className="p-3 text-center text-red-600">80</td>
                    <td className="p-3 text-center text-green-700">16</td>
                    <td className="p-3 text-center text-green-600">20%</td>
                    <td className="p-3 text-center text-orange-600">₹1,474 avg</td>
                    <td className="p-3 text-center">₹1,17,959</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">CPL colour: <span className="text-green-600 font-semibold">green</span> ≤ ₹1,000 · <span className="text-yellow-600 font-semibold">amber</span> ≤ ₹1,500 · <span className="text-red-600 font-semibold">red</span> &gt; ₹1,500</p>
        </section>

        {/* ── Google Ads ── */}
        <section>
          <SectionTitle>Google Ads — Search Campaigns (May vs June)</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {googleMetrics.map((g) => (
              <div key={g.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{g.name}</p>
                <p className="text-xs text-gray-500">May: {g.may}</p>
                <p className="text-lg font-bold text-gray-900">Jun: {g.june}</p>
                <span className="text-xs font-bold text-green-600">{g.change}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm font-semibold text-gray-600 mb-4">Clicks & Impressions (Normalised)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={googleAds} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(2)}M` : `${(v / 1000).toFixed(0)}K`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="May" fill={AUDI_DARK} radius={[4, 4, 0, 0]} />
                <Bar dataKey="June" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* tele-in */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-blue-500 uppercase font-medium tracking-wider">Tele-in Leads (June)</p>
              <p className="text-2xl font-bold text-blue-800">32</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 uppercase font-medium tracking-wider">QLs</p>
              <p className="text-2xl font-bold text-blue-800">31</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 uppercase font-medium tracking-wider">Test Drives</p>
              <p className="text-2xl font-bold text-blue-800">13</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 uppercase font-medium tracking-wider">Bookings</p>
              <p className="text-2xl font-bold text-blue-800">1</p>
            </div>
          </div>
        </section>

        {/* ── Co-Dealer Analysis ── */}
        <section>
          <SectionTitle>Co-Dealer Ads Analysis</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> North Region
              </p>
              <DealerTable data={northDealers} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> South Region
              </p>
              <DealerTable data={southDealers} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-600 inline-block" /> Hyderabad Region
              </p>
              <DealerTable data={hydDealers} />
            </div>
          </div>
          {/* common intel */}
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-2">Common Competitor Strategies Across All Dealers</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-700">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <span><strong>60% Assured Buyback</strong> is the single most dominant offer across all 8 dealers and all model lines.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <span><strong>Zero Down Payment</strong> heavily promoted on Q3 &amp; A6 to lower luxury entry barrier.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <span><strong>10-Year Complimentary RSA</strong> and Exchange/Loyalty Bonuses up to ₹4L featured prominently.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing June Forecast ── */}
        <section>
          <SectionTitle>Closing June — Forecast</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Meta Plan</p>
              <div className="space-y-3">
                {[
                  { label: "Leads as on 20th", value: "80" },
                  { label: "Expected Remaining Leads", value: "120" },
                  { label: "Spend as on 20th", value: "₹1,17,959" },
                  { label: "Expected Remaining Spend", value: "₹1,50,000" },
                  { label: "Total Expected Spend", value: "₹2,67,959", bold: true },
                  { label: "Total Expected Leads", value: "200", bold: true, accent: true },
                ].map((r) => (
                  <div key={r.label} className={`flex justify-between text-sm ${r.bold ? "border-t border-gray-100 pt-3 font-bold" : ""}`}>
                    <span className="text-gray-500">{r.label}</span>
                    <span className={r.accent ? "text-green-600 text-base" : ""}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">Google Plan</p>
              <div className="space-y-3">
                {[
                  { label: "Spend as on 20th", value: "₹1,14,756" },
                  { label: "Expected Remaining Spend", value: "₹78,000" },
                  { label: "Total Expected Spend", value: "₹1,92,756", bold: true },
                ].map((r) => (
                  <div key={r.label} className={`flex justify-between text-sm ${r.bold ? "border-t border-gray-100 pt-3 font-bold" : ""}`}>
                    <span className="text-gray-500">{r.label}</span>
                    <span>{r.value}</span>
                  </div>
                ))}
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                  Google conversion rate holding strong at <strong>93.92%</strong> — pipeline quality is excellent.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── July 2026 Plan ── */}
        <section>
          <SectionTitle>July 2026 — Proposed Media Plan</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100" style={{ background: "#f8f9fb" }}>
                    <th className="text-left p-3 font-medium">Channel</th>
                    <th className="text-left p-3 font-medium">Campaign</th>
                    <th className="text-center p-3 font-medium">Budget (₹)</th>
                    <th className="text-center p-3 font-medium">Exp. Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {julyPlan.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{r.channel}</td>
                      <td className="p-3 text-gray-500">{r.campaign}</td>
                      <td className="p-3 text-center font-mono text-gray-700">₹{r.budget.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold" style={{ color: r.leads ? "#16a34a" : "#9ca3af" }}>
                        {r.leads || "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-gray-200" style={{ background: "#f8f9fb" }}>
                    <td className="p-3" colSpan={2}>Total</td>
                    <td className="p-3 text-center" style={{ color: AUDI_RED }}>₹5,94,000</td>
                    <td className="p-3 text-center text-green-700">330 leads</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Requirements ── */}
        <section>
          <SectionTitle>Content Requirements from Client</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🎬", title: "Delivery Videos", desc: "Customer delivery videos for SMM pages." },
              { icon: "🗣️", title: "Testimonials", desc: "Video testimonials for both Sales and Service." },
              { icon: "🔧", title: "Service Bay Videos", desc: "Behind-the-scenes service bay footage." },
              { icon: "🌧️", title: "Pre-Monsoon Campaign", desc: "Videos and static images for monsoon service campaign." },
              { icon: "🚗", title: "Test Drive Feedback", desc: "Post test-drive feedback video clips." },
              { icon: "🏠", title: "Home Visit Test Drives", desc: "Video content from home-visit test drive sessions." },
            ].map((r) => (
              <div key={r.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <p>Imperion Audi Hyderabad · Performance Report — Till 20th June 2026</p>
          <p>Prepared by BroaddCast Business Solutions</p>
        </div>
      </footer>
    </div>
  );
}
