import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Walley by Broaddcast",
  description: "Read the terms and conditions for using Walley — India's automotive marketplace by Broaddcast.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing and using Walley (testdrivefirst.com), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any part of these terms, you must not use our platform.`,
  },
  {
    title: "2. Use of the Platform",
    body: `Walley grants you a limited, non-exclusive, non-transferable licence to use our platform for personal, non-commercial purposes. You agree not to: (a) use the platform for any unlawful purpose; (b) scrape or extract data without permission; (c) impersonate any person or entity; (d) transmit any harmful or disruptive content; or (e) attempt to gain unauthorised access to our systems.`,
  },
  {
    title: "3. Vehicle Information",
    body: `While we strive to ensure accuracy, vehicle prices, specifications, features, and availability are subject to change without notice. All prices shown are indicative ex-showroom or on-road estimates. Always verify final pricing with the authorised dealer before making a purchase decision.`,
  },
  {
    title: "4. Test Drive Bookings",
    body: `Test drive requests submitted through Walley are forwarded to authorised dealers or our partners. Walley does not guarantee availability or confirm test drives independently. The actual scheduling is coordinated by the dealer. Walley is not liable for any cancellations, delays, or disputes arising from test drive arrangements.`,
  },
  {
    title: "5. EMI Calculator",
    body: `The EMI calculator on our platform is provided for indicative purposes only. Actual loan amounts, interest rates, and EMIs will be determined by the lending institution based on your credit profile, income, and other factors. Walley is not a financial institution and does not offer loans.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on Walley, including text, images, logos, and software, is the property of Broaddcast Technologies Pvt. Ltd. and is protected by Indian copyright law. You may not reproduce, distribute, or create derivative works without prior written permission.`,
  },
  {
    title: "7. Disclaimer of Warranties",
    body: `Walley is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the platform's accuracy, availability, or fitness for a particular purpose. We do not guarantee that the platform will be error-free or uninterrupted.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the maximum extent permitted by law, Broaddcast Technologies Pvt. Ltd. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of Walley, including but not limited to loss of profits, data, or vehicle purchase decisions made based on our content.`,
  },
  {
    title: "9. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a notice on our platform. Continued use after changes constitute your acceptance of the revised terms.`,
  },
  {
    title: "10. Governing Law",
    body: `These Terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Terms of Service</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Terms of Service</h1>
          </div>
          <p className="text-blue-200 text-sm">Last updated: June 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8">
          <p className="text-sm text-gray-500 leading-relaxed border-b border-gray-100 pb-6">
            These Terms of Service (&quot;Terms&quot;) govern your use of the Walley platform operated by Broaddcast Technologies Pvt. Ltd. Please read them carefully before using our services.
          </p>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-bold text-gray-900 text-base mb-2">{s.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/privacy" className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-center">
            Read Privacy Policy →
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-gray-700 text-center">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
