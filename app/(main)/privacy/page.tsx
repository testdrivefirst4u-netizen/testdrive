import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Walley by Broaddcast",
  description: "Read Walley's privacy policy — how we collect, use, and protect your data.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us, such as when you create an account, book a test drive, or contact us. This includes your name, email address, phone number, city, and vehicle preferences. We also automatically collect certain information when you use our platform — including your IP address, browser type, pages visited, and search queries — through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to: (a) provide and improve our services; (b) connect you with authorised dealers for test drives or inquiries; (c) send you promotional communications with your consent; (d) analyse usage trends to enhance user experience; and (e) comply with legal obligations. We do not sell your personal information to third parties.`,
  },
  {
    title: "3. Information Sharing",
    body: `We share your information only with: (a) authorised dealers when you request a test drive or inquiry; (b) service providers who help us operate the platform (under confidentiality agreements); (c) legal authorities when required by law. All third parties are contractually obligated to keep your data secure and confidential.`,
  },
  {
    title: "4. Cookies",
    body: `We use cookies and similar tracking technologies to analyse traffic, remember your preferences, and personalise content. You can control cookies through your browser settings. Disabling cookies may affect certain features of our platform.`,
  },
  {
    title: "5. Data Security",
    body: `We implement industry-standard security measures including SSL encryption, secure server infrastructure, and regular security audits. While we strive to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and not share your account credentials.`,
  },
  {
    title: "6. Your Rights",
    body: `You have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data; (d) opt out of marketing communications at any time; and (e) withdraw consent for data processing. To exercise these rights, contact us at privacy@broaddcast.com.`,
  },
  {
    title: "7. Children's Privacy",
    body: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page with a revised date. Your continued use of our platform after any changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "9. Contact Us",
    body: `For privacy-related questions or to exercise your rights, contact us at:\nBroaddcast Technologies Pvt. Ltd.\nEmail: privacy@broaddcast.com\nPhone: 1800-123-4567\nHyderabad, Telangana, India`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Privacy Policy</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Privacy Policy</h1>
          </div>
          <p className="text-blue-200 text-sm">Last updated: June 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8">
          <p className="text-sm text-gray-500 leading-relaxed border-b border-gray-100 pb-6">
            This Privacy Policy describes how Broaddcast Technologies Pvt. Ltd. (&quot;Walley&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and shares information when you use our website at testdrivefirst.com and related services.
          </p>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-bold text-gray-900 text-base mb-2">{s.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/terms" className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-center">
            Read Terms of Service →
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-gray-700 text-center">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
