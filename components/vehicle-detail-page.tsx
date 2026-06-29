'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  XCircle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  Droplets,
  Wind,
  Zap,
  Settings2,
  Gauge,
  BatteryCharging,
  Phone,
  BadgeCheck,
  ArrowRight,
  Share2,
  CalendarDays,
  Car,
  X,
  Loader2,
  Tag,
  MapPin,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EMICalculator } from '@/components/emi-calculator';
import OfferPopup from '@/components/forms/OfferPopup';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  type: string;
  brandId: string;
  priceMin: number | null;
  priceMax: number | null;
  priceDisplay: string | null;
  exShowroomPrice: number | null;
  onRoadPrice: number | null;
  description: string | null;
  overview: string | null;
  keyHighlights: string[];
  pros: string[];
  cons: string[];
  mileage: string | null;
  topSpeed: string | null;
  engine: string | null;
  power: string | null;
  torque: string | null;
  range: string | null;
  batteryCapacity: string | null;
  motorPower: string | null;
  isElectric: boolean;
  isPopular: boolean;
  isNew: boolean;
  brand: { name: string; slug: string; logo?: string | null };
  category: { name: string; slug: string };
  variants: Array<{
    id: string;
    name: string;
    priceDisplay: string | null;
    fuelType: string | null;
    transmission: string | null;
    mileage: string | null;
    range: string | null;
    engine: string | null;
    power: string | null;
  }>;
  images: Array<{ id: string; url: string; alt: string | null; type: string }>;
  colours: Array<{
    id: string;
    name: string;
    hexCode: string | null;
    imageUrl: string | null;
  }>;
  specGroups: Array<{
    id: string;
    group: { name: string };
    specValues: Array<{
      specItem: { name: string; unit: string | null };
      value: string;
    }>;
  }>;
  features: Array<{
    id: string;
    category: string;
    name: string;
    available: boolean;
  }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  featuredImage?: string | null;
}

interface Props {
  vehicle: Vehicle;
  similar: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    priceDisplay: string | null;
    featuredImage?: string | null;
    brand: { name: string; slug: string };
    images: Array<{ url: string }>;
  }>;
  vehicleType: 'car' | 'bike' | 'scooter' | 'ev' | 'commercial';
}

interface DealerEntry {
  id: string;
  name: string;
  city: string;
  state?: string | null;
  address?: string | null;
  phone: string;
  logo?: string | null;
  offer: {
    id: string;
    variantName?: string | null;
    offerPrice?: number | null;
    discount?: number | null;
    discountType?: string | null;
    priceDisplay?: string | null;
    validUntil?: string | null;
    notes?: string | null;
  } | null;
}

function typeToPath(type: string) {
  if (type === 'BIKE' || type === 'SCOOTER') return 'bikes';
  if (type === 'EV') return 'ev';
  if (type === 'COMMERCIAL') return 'commercial';
  return 'cars';
}

function FuelBadge({ fuel }: { fuel: string }) {
  const f = fuel.toLowerCase();
  if (f.includes('electric') || f === 'ev')
    return (
      <span className='flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full'>
        <Zap className='w-3 h-3' />
        {fuel}
      </span>
    );
  if (f.includes('cng') || f.includes('lpg'))
    return (
      <span className='flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full'>
        <Wind className='w-3 h-3' />
        {fuel}
      </span>
    );
  return (
    <span className='flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full'>
      <Droplets className='w-3 h-3' />
      {fuel}
    </span>
  );
}

/* ─── Test Drive Modal ─── */
function TestDriveModal({
  open,
  onClose,
  vehicleId,
  vehicleName,
  brandId,
}: {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  brandId: string;
}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setDate] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(false);

  // reset on open
  useEffect(() => {
    if (open) {
      setName('');
      setMobile('');
      setEmail('');
      setDate('');
      setCity('');
      setLoading(false);
      setSuccess(false);
      setError('');
      setToast(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: mobile,
          email: email.trim() || undefined,
          model: vehicleName,
          city: city.trim() || undefined,
          date: preferredDate || undefined,
          brandId,
          source: 'test_drive_cta',
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setToast(true);
      setTimeout(() => {
        onClose();
      }, 2800);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='bg-blue-700 px-6 py-5'>
          <DialogTitle className='text-white text-lg font-bold flex items-center gap-2'>
            <Car className='w-5 h-5' /> Book a Test Drive
          </DialogTitle>
          <p className='text-blue-100 text-sm mt-0.5'>
            Experience the {vehicleName} — we&apos;ll arrange it for you
          </p>
        </DialogHeader>

        {success ? (
          <div className='flex flex-col items-center justify-center py-12 px-6 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
            <h3 className='text-xl font-bold text-slate-900 mb-2'>
              Test Drive Booked!
            </h3>
            <p className='text-gray-500 text-sm leading-relaxed'>
              We&apos;ll contact you shortly to confirm your test drive slot for
              the{' '}
              <span className='font-semibold text-blue-700'>{vehicleName}</span>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='px-6 py-5 space-y-4'>
            {/* Vehicle (read-only) */}
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Vehicle
              </label>
              <div className='mt-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-800'>
                {vehicleName}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Full Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder='Enter your full name'
                className='mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all'
              />
            </div>

            {/* Mobile */}
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Mobile Number <span className='text-red-500'>*</span>
              </label>
              <div className='mt-1 flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all'>
                <span className='px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-sm text-gray-500 font-medium'>
                  +91
                </span>
                <input
                  type='tel'
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setError('');
                  }}
                  placeholder='10-digit mobile'
                  className='flex-1 px-3 py-2.5 text-sm outline-none bg-transparent'
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Email (optional)
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                className='mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all'
              />
            </div>

            {/* Date + City — 2-col */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                  Preferred Date
                </label>
                <input
                  type='date'
                  value={preferredDate}
                  min={minDateStr}
                  onChange={(e) => setDate(e.target.value)}
                  className='mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all'
                />
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                  Dealer City
                </label>
                <input
                  type='text'
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder='e.g. Mumbai'
                  className='mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all'
                />
              </div>
            </div>

            {error && (
              <div className='bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2.5'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2'
            >
              {loading && <Loader2 className='w-4 h-4 animate-spin' />}
              {loading ? 'Booking...' : 'Confirm Test Drive'}
            </button>

            <p className='text-center text-[11px] text-gray-400'>
              By submitting you agree to be contacted by our team. No spam.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Toast ─── */
function SuccessToast({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl transition-all duration-300 ${
        show
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <CheckCircle className='w-4 h-4 text-green-400 shrink-0' />
      Test drive booked! We&apos;ll contact you shortly.
    </div>
  );
}

/* ─── Dealer Offers Section ─── */
function DealerOffersSection({
  vehicleSlug,
  vehicleName,
  brandName,
}: {
  vehicleSlug: string;
  vehicleName: string;
  brandName: string;
}) {
  const [dealers, setDealers] = useState<DealerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/vehicles/${vehicleSlug}/dealer-offers`)
      .then((r) => {
        if (!r.ok) throw new Error('failed');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setDealers(data.dealers ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vehicleSlug]);

  const dealersWithOffers = dealers.filter((d) => d.offer);
  const dealersWithoutOffers = dealers.filter((d) => !d.offer);

  function fmtPrice(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }

  return (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
        <h2 className='font-bold text-slate-900 flex items-center gap-2'>
          <BadgeCheck className='w-4 h-4 text-blue-600' />
          {brandName} Authorized Dealers
          {!loading && dealers.length > 0 && (
            <span className='bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
              {dealers.length}
            </span>
          )}
        </h2>
        {!loading && dealersWithOffers.length > 0 && (
          <span className='text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full flex items-center gap-1'>
            <Tag className='w-3 h-3' /> {dealersWithOffers.length} Active Offer
            {dealersWithOffers.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className='flex items-center justify-center py-10'>
          <Loader2 className='w-5 h-5 animate-spin text-blue-500' />
        </div>
      )}

      {/* Error / No dealers */}
      {!loading && (error || dealers.length === 0) && (
        <div className='p-5'>
          <div className='bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4'>
            <div className='flex-1'>
              <p className='font-semibold text-slate-900 text-sm mb-1'>
                Find the best deal on {vehicleName}
              </p>
              <p className='text-gray-500 text-xs leading-relaxed'>
                Our team will connect you with the nearest authorised{' '}
                {brandName} dealer and get you exclusive offers.
              </p>
            </div>
            <a
              href='tel:+918888888888'
              className='flex-shrink-0 flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors'
            >
              <Phone className='w-4 h-4' /> Call Us
            </a>
          </div>
        </div>
      )}

      {/* Dealers with active offers */}
      {!loading && !error && dealersWithOffers.length > 0 && (
        <div className='p-5 space-y-3'>
          <p className='text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5'>
            <Tag className='w-3.5 h-3.5' /> Special Offers on {vehicleName}
          </p>
          {dealersWithOffers.map((d) => {
            const o = d.offer!;
            return (
              <div
                key={d.id}
                className='border border-emerald-100 bg-emerald-50/40 rounded-2xl p-4 hover:border-emerald-200 transition-all'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    {/* Dealer name + location */}
                    <div className='flex items-center flex-wrap gap-2 mb-1'>
                      {d.logo && (
                        <Image
                          src={d.logo}
                          alt={d.name}
                          width={20}
                          height={20}
                          className='object-contain rounded'
                        />
                      )}
                      <p className='font-bold text-sm text-slate-900'>
                        {d.name}
                      </p>
                      <span className='flex items-center gap-1 text-xs text-gray-500'>
                        <MapPin className='w-3 h-3' />
                        {d.city}
                        {d.state ? `, ${d.state}` : ''}
                      </span>
                    </div>

                    {/* Offer badges */}
                    <div className='flex flex-wrap gap-3 mt-2'>
                      {o.variantName && (
                        <span className='text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full'>
                          {o.variantName}
                        </span>
                      )}
                      {o.offerPrice != null && (
                        <div>
                          <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
                            Offer Price
                          </p>
                          <p className='font-bold text-blue-700 text-sm'>
                            {fmtPrice(o.offerPrice)}
                          </p>
                        </div>
                      )}
                      {o.discount != null && (
                        <div>
                          <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
                            {o.discountType === 'percentage'
                              ? 'Discount %'
                              : 'Discount'}
                          </p>
                          <p className='font-bold text-emerald-600 text-sm'>
                            {o.discountType === 'percentage'
                              ? `${o.discount}% off`
                              : fmtPrice(o.discount)}
                          </p>
                        </div>
                      )}
                      {o.priceDisplay && !o.offerPrice && (
                        <div>
                          <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
                            Price
                          </p>
                          <p className='font-bold text-blue-700 text-sm'>
                            {o.priceDisplay}
                          </p>
                        </div>
                      )}
                      {o.validUntil && (
                        <div>
                          <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
                            Valid Till
                          </p>
                          <p className='font-semibold text-slate-700 text-xs'>
                            {new Date(o.validUntil).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {o.notes && (
                      <p className='text-[11px] text-gray-500 mt-2 italic'>
                        {o.notes}
                      </p>
                    )}
                  </div>

                  {/* Call button */}
                  <a
                    href={`tel:${d.phone}`}
                    className='flex-shrink-0 flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap'
                  >
                    <Phone className='w-3 h-3' /> Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dealers without specific offer — still show as available */}
      {!loading && !error && dealersWithoutOffers.length > 0 && (
        <div
          className={`p-5 space-y-3 ${dealersWithOffers.length > 0 ? 'border-t border-gray-100' : ''}`}
        >
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5'>
            <BadgeCheck className='w-3.5 h-3.5 text-blue-500' /> All Authorised
            Dealers
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {dealersWithoutOffers.map((d) => (
              <div
                key={d.id}
                className='border border-gray-100 rounded-2xl p-3.5 hover:border-blue-200 hover:bg-blue-50/20 transition-all'
              >
                <div className='flex items-start gap-3'>
                  {d.logo ? (
                    <Image
                      src={d.logo}
                      alt={d.name}
                      width={32}
                      height={32}
                      className='object-contain rounded-lg shrink-0'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0'>
                      <Car className='w-4 h-4 text-blue-600' />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='font-bold text-sm text-slate-900 truncate'>
                      {d.name}
                    </p>
                    <p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                      <MapPin className='w-3 h-3 shrink-0' />
                      {d.city}
                      {d.state ? `, ${d.state}` : ''}
                    </p>
                    {d.address && (
                      <p className='text-[11px] text-gray-400 mt-0.5 truncate'>
                        {d.address}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${d.phone}`}
                  className='mt-2.5 w-full flex items-center justify-center gap-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors'
                >
                  <Phone className='w-3 h-3' /> {d.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page Component ─── */
export function VehicleDetailPage({ vehicle, similar, vehicleType }: Props) {
  const [offerOpen, setOfferOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColour, setActiveColour] = useState(-1);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const tabsRef = useRef<HTMLDivElement>(null);
  const isEV = vehicle.isElectric || vehicle.type === 'EV';

  function scrollToEmi() {
    setActiveTab('emi');
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function openTestDrive() {
    setTestDriveOpen(true);
  }

  function handleTestDriveSuccess() {
    setTestDriveOpen(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }

  function getShareUrl() {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }
  function shareWhatsApp() {
    const url = getShareUrl();
    const text = `Check out the ${vehicle.brand.name} ${vehicle.name} on Walley! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShareOpen(false);
  }
  function copyLink() {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }

  const mainImage =
    activeColour >= 0
      ? vehicle.colours[activeColour]?.imageUrl ||
        vehicle.images[activeImage]?.url ||
        vehicle.featuredImage ||
        '/placeholder.svg'
      : vehicle.images[activeImage]?.url ||
        vehicle.featuredImage ||
        '/placeholder.svg';

  const featureGroups = vehicle.features.reduce<
    Record<string, typeof vehicle.features>
  >((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  const categoryPath = vehicleType === 'car' ? '/cars' : `/${vehicleType}s`;

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Breadcrumb strip */}
      <div className='bg-white border-b border-gray-100'>
        <div className='max-w-[1400px] mx-auto px-4 sm:px-6 py-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href='/'
                  className='text-gray-400 hover:text-blue-700 text-xs'
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={categoryPath}
                  className='text-gray-400 hover:text-blue-700 text-xs'
                >
                  {vehicle.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`${categoryPath}?brand=${vehicle.brand.slug}`}
                  className='text-gray-400 hover:text-blue-700 text-xs'
                >
                  {vehicle.brand.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='text-xs font-medium'>
                  {vehicle.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Left / Main ── */}
          <div className='lg:col-span-2 space-y-5'>
            {/* Gallery */}
            <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm'>
              <div className='relative h-64 sm:h-80 md:h-[400px] bg-slate-50'>
                <Image
                  src={mainImage}
                  alt={vehicle.name}
                  fill
                  priority
                  className='object-cover'
                  sizes='(max-width: 1024px) 100vw, 66vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />

                {/* Badges */}
                <div className='absolute top-3 left-3 flex gap-1.5 flex-wrap'>
                  {vehicle.isNew && (
                    <Badge className='bg-emerald-500 text-white border-0'>
                      New
                    </Badge>
                  )}
                  {vehicle.isPopular && (
                    <Badge className='bg-blue-600 text-white border-0'>
                      Popular
                    </Badge>
                  )}
                  {isEV && (
                    <Badge className='bg-teal-500 text-white border-0'>
                      <Zap className='w-3 h-3 mr-0.5' />
                      Electric
                    </Badge>
                  )}
                </div>

                {/* Counter */}
                <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm'>
                  {activeImage + 1} / {vehicle.images.length}
                </div>

                {/* Share */}
                <div className='absolute top-3 right-3'>
                  <button
                    onClick={() => setShareOpen((p) => !p)}
                    className='w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm'
                  >
                    <Share2 className='w-4 h-4 text-gray-600' />
                  </button>
                  {shareOpen && (
                    <div className='absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[160px]'>
                      <button
                        onClick={shareWhatsApp}
                        className='flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors'
                      >
                        <svg
                          viewBox='0 0 24 24'
                          className='w-4 h-4 fill-green-500 shrink-0'
                        >
                          <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={copyLink}
                        className='flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                      >
                        <svg
                          viewBox='0 0 24 24'
                          className='w-4 h-4 stroke-current shrink-0'
                          fill='none'
                          strokeWidth='2'
                        >
                          <rect x='9' y='9' width='13' height='13' rx='2' />
                          <path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1' />
                        </svg>
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div
                  className='flex gap-2 p-3 overflow-x-auto'
                  style={{ scrollbarWidth: 'none' }}
                >
                  {vehicle.images.slice(0, 8).map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setActiveImage(i);
                        setActiveColour(-1);
                      }}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i && activeColour < 0
                          ? 'border-blue-600 shadow-sm'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`View ${i + 1}`}
                        width={64}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick spec bar */}
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4'>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-gray-100'>
                {[
                  {
                    label: isEV ? 'Range' : 'Mileage',
                    value: isEV ? vehicle.range : vehicle.mileage,
                    icon: isEV ? BatteryCharging : Gauge,
                    color: 'text-teal-600',
                  },
                  {
                    label: 'Engine',
                    value: vehicle.engine,
                    icon: Zap,
                    color: 'text-blue-600',
                  },
                  {
                    label: 'Power',
                    value: vehicle.power,
                    icon: Zap,
                    color: 'text-blue-600',
                  },
                  {
                    label: 'Torque',
                    value: vehicle.torque,
                    icon: Settings2,
                    color: 'text-purple-600',
                  },
                ]
                  .filter((s) => s.value)
                  .map((s) => (
                    <div key={s.label} className='pl-4 first:pl-0'>
                      <div className='flex items-center gap-1.5 mb-0.5'>
                        <s.icon className={`w-3 h-3 ${s.color}`} />
                        <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                          {s.label}
                        </p>
                      </div>
                      <p className='font-bold text-sm text-slate-900'>
                        {s.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tabs */}
            <div
              ref={tabsRef}
              className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='w-full rounded-none border-b border-gray-100 bg-slate-50 h-auto p-0 justify-start overflow-x-auto'>
                  {[
                    'overview',
                    'specs',
                    'features',
                    'variants',
                    'colours',
                    'emi',
                  ].map((t) => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 data-[state=active]:bg-white px-5 py-3 text-sm font-semibold text-gray-500 capitalize whitespace-nowrap'
                    >
                      {t === 'emi'
                        ? 'EMI'
                        : t.charAt(0).toUpperCase() + t.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value='overview' className='p-5 space-y-5 m-0'>
                  {(vehicle.overview || vehicle.description) && (
                    <p className='text-gray-600 leading-relaxed text-sm'>
                      {vehicle.overview || vehicle.description}
                    </p>
                  )}
                  {vehicle.keyHighlights?.length > 0 && (
                    <div>
                      <h3 className='font-bold text-sm text-slate-900 mb-3 flex items-center gap-2'>
                        <BadgeCheck className='w-4 h-4 text-blue-600' /> Key
                        Highlights
                      </h3>
                      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        {vehicle.keyHighlights.map((h, i) => (
                          <li
                            key={i}
                            className='flex gap-2 items-start bg-blue-50 rounded-xl px-3 py-2'
                          >
                            <CheckCircle className='w-4 h-4 text-blue-600 mt-0.5 shrink-0' />
                            <span className='text-sm text-slate-700'>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(vehicle.pros?.length > 0 || vehicle.cons?.length > 0) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
                      {vehicle.pros?.length > 0 && (
                        <div className='bg-emerald-50 rounded-2xl p-4'>
                          <h3 className='font-bold text-sm text-emerald-800 flex items-center gap-2 mb-3'>
                            <ThumbsUp className='w-4 h-4' /> What&apos;s Great
                          </h3>
                          <ul className='space-y-2'>
                            {vehicle.pros.map((p, i) => (
                              <li
                                key={i}
                                className='flex gap-2 text-sm text-emerald-800'
                              >
                                <CheckCircle className='w-4 h-4 text-emerald-500 shrink-0 mt-0.5' />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {vehicle.cons?.length > 0 && (
                        <div className='bg-red-50 rounded-2xl p-4'>
                          <h3 className='font-bold text-sm text-red-800 flex items-center gap-2 mb-3'>
                            <ThumbsDown className='w-4 h-4' /> What Could Be
                            Better
                          </h3>
                          <ul className='space-y-2'>
                            {vehicle.cons.map((c, i) => (
                              <li
                                key={i}
                                className='flex gap-2 text-sm text-red-800'
                              >
                                <XCircle className='w-4 h-4 text-red-400 shrink-0 mt-0.5' />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Specs */}
                <TabsContent value='specs' className='p-5 m-0'>
                  {vehicle.specGroups.length > 0 ? (
                    vehicle.specGroups.map((sg) => (
                      <div key={sg.id} className='mb-6 last:mb-0'>
                        <h3 className='font-bold text-sm bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 mb-3 text-slate-900'>
                          {sg.group.name}
                        </h3>
                        <div className='divide-y divide-gray-50'>
                          {sg.specValues.map((sv) => (
                            <div
                              key={sv.specItem.name}
                              className='flex justify-between py-2.5 px-2 text-sm'
                            >
                              <span className='text-gray-500'>
                                {sv.specItem.name}
                              </span>
                              <span className='font-semibold text-slate-800'>
                                {sv.value}
                                {sv.specItem.unit ? ` ${sv.specItem.unit}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-400 text-sm text-center py-8'>
                      No specifications available yet
                    </p>
                  )}
                </TabsContent>

                {/* Features */}
                <TabsContent value='features' className='p-5 m-0'>
                  {Object.entries(featureGroups).length > 0 ? (
                    Object.entries(featureGroups).map(([cat, feats]) => (
                      <div key={cat} className='mb-5 last:mb-0'>
                        <h3 className='font-bold text-sm bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 mb-3 text-slate-900'>
                          {cat}
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                          {feats.map((f) => (
                            <div
                              key={f.id}
                              className='flex items-center gap-2.5 text-sm py-1'
                            >
                              {f.available ? (
                                <CheckCircle className='w-4 h-4 text-emerald-500 shrink-0' />
                              ) : (
                                <XCircle className='w-4 h-4 text-gray-200 shrink-0' />
                              )}
                              <span
                                className={
                                  f.available
                                    ? 'text-slate-700'
                                    : 'text-gray-400'
                                }
                              >
                                {f.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-400 text-sm text-center py-8'>
                      No features data available
                    </p>
                  )}
                </TabsContent>

                {/* Variants */}
                <TabsContent value='variants' className='p-5 m-0'>
                  {vehicle.variants.length > 0 ? (
                    <div className='space-y-3'>
                      {vehicle.variants.map((v) => (
                        <div
                          key={v.id}
                          className='border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all'
                        >
                          <div className='flex justify-between items-start gap-4'>
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-bold text-sm text-slate-900 mb-2'>
                                {v.name}
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {v.fuelType && <FuelBadge fuel={v.fuelType} />}
                                {v.transmission && (
                                  <span className='flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full'>
                                    <Settings2 className='w-3 h-3' />
                                    {v.transmission}
                                  </span>
                                )}
                                {(v.mileage || v.range) && (
                                  <span className='flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full'>
                                    {isEV ? (
                                      <BatteryCharging className='w-3 h-3 text-teal-500' />
                                    ) : (
                                      <Gauge className='w-3 h-3' />
                                    )}
                                    {isEV ? v.range : v.mileage}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className='text-right flex-shrink-0'>
                              <p className='font-bold text-blue-700 text-base'>
                                {v.priceDisplay || '—'}
                              </p>
                              <Button
                                size='sm'
                                className='mt-2 bg-blue-700 hover:bg-blue-800 text-white h-8 text-xs px-3'
                                onClick={() => setOfferOpen(true)}
                              >
                                Get Quote
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-400 text-sm text-center py-8'>
                      No variants available
                    </p>
                  )}
                </TabsContent>

                {/* Colours */}
                <TabsContent value='colours' className='p-5 m-0'>
                  {vehicle.colours.length > 0 ? (
                    <div className='space-y-5'>
                      {vehicle.colours[activeColour >= 0 ? activeColour : 0]
                        ?.imageUrl && (
                        <div className='relative h-48 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100'>
                          <Image
                            src={
                              vehicle.colours[
                                activeColour >= 0 ? activeColour : 0
                              ].imageUrl!
                            }
                            alt='Colour variant'
                            fill
                            className='object-contain'
                            sizes='(max-width: 1024px) 100vw, 50vw'
                          />
                        </div>
                      )}
                      <div>
                        <p className='text-sm font-semibold text-slate-700 mb-3'>
                          {activeColour >= 0
                            ? vehicle.colours[activeColour].name
                            : 'Select a colour'}
                        </p>
                        <div className='flex flex-wrap gap-3'>
                          {vehicle.colours.map((c, i) => (
                            <button
                              key={c.id}
                              onClick={() => setActiveColour(i)}
                              title={c.name}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                                activeColour === i
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-transparent hover:border-gray-200'
                              }`}
                            >
                              <div
                                className='w-8 h-8 rounded-full border border-gray-200 shadow-sm'
                                style={{ backgroundColor: c.hexCode || '#ccc' }}
                              />
                              <span className='text-[10px] text-gray-500 max-w-[60px] text-center leading-tight'>
                                {c.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className='text-gray-400 text-sm text-center py-8'>
                      No colour information available
                    </p>
                  )}
                </TabsContent>

                {/* EMI */}
                <TabsContent value='emi' className='m-0'>
                  <EMICalculator
                    carPrice={vehicle.priceMin || 0}
                    carName={vehicle.name}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Dealer Offers Section ── */}
            <DealerOffersSection
              vehicleSlug={vehicle.slug}
              vehicleName={vehicle.name}
              brandName={vehicle.brand.name}
            />

            {/* FAQs */}
            {vehicle.faqs.length > 0 && (
              <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5'>
                <h2 className='font-bold text-slate-900 mb-4'>
                  Frequently Asked Questions
                </h2>
                <Accordion type='single' collapsible className='space-y-2'>
                  {vehicle.faqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className='border border-gray-100 rounded-xl px-4 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/30'
                    >
                      <AccordionTrigger className='text-sm font-semibold py-3 hover:text-blue-700 hover:no-underline text-left'>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className='text-gray-600 text-sm pb-3 leading-relaxed'>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className='space-y-4'>
            {/* Main CTA card */}
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20'>
              <div className='flex items-center gap-2 mb-1'>
                {vehicle.brand.logo && (
                  <Image
                    src={vehicle.brand.logo}
                    alt={vehicle.brand.name}
                    width={24}
                    height={24}
                    className='object-contain'
                  />
                )}
                <span className='text-xs font-semibold text-gray-400'>
                  {vehicle.brand.name}
                </span>
              </div>
              <h1 className='text-xl font-extrabold text-slate-900 leading-tight mb-1'>
                {vehicle.name}
              </h1>
              <p className='text-3xl font-black text-blue-700 mt-2 leading-none'>
                {vehicle.priceDisplay || 'Price on request'}
              </p>
              {vehicle.exShowroomPrice && (
                <p className='text-xs text-gray-400 mt-1'>
                  Ex-showroom: ₹{(vehicle.exShowroomPrice / 100000).toFixed(2)}{' '}
                  Lakh
                </p>
              )}

              <div className='space-y-2 mt-5'>
                <Button
                  className='w-full bg-blue-700 hover:bg-blue-800 h-11 font-bold text-sm gap-2'
                  onClick={() => setOfferOpen(true)}
                >
                  Check Best Offers <ArrowRight className='w-4 h-4' />
                </Button>
                <Button
                  variant='outline'
                  className='w-full h-10 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-semibold text-sm gap-2'
                  onClick={openTestDrive}
                >
                  <CalendarDays className='w-4 h-4' /> Book Test Drive
                </Button>
              </div>

              {/* Quick EMI preview */}
              {vehicle.priceMin && vehicle.priceMin > 0 && (
                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-1.5'>
                      <Calculator className='w-3.5 h-3.5 text-blue-500' />
                      <p className='text-xs font-semibold text-gray-600'>
                        EMI starts at
                      </p>
                    </div>
                    <button
                      className='text-[10px] text-blue-600 font-semibold hover:underline'
                      onClick={scrollToEmi}
                    >
                      Calculate →
                    </button>
                  </div>
                  <p className='text-lg font-black text-blue-700'>
                    ₹
                    {Math.round(
                      (vehicle.priceMin * 0.8 * (8.5 / 1200)) /
                        (1 - Math.pow(1 + 8.5 / 1200, -60)),
                    ).toLocaleString('en-IN')}
                    <span className='text-xs font-medium text-gray-400 ml-1'>
                      /month*
                    </span>
                  </p>
                  <p className='text-[10px] text-gray-400 mt-0.5'>
                    20% down · 8.5% p.a. · 5 yr tenure
                  </p>
                </div>
              )}

              {/* Quick specs */}
              <div className='grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100'>
                {[
                  {
                    label: isEV ? 'Range' : 'Mileage',
                    value: isEV ? vehicle.range : vehicle.mileage,
                  },
                  { label: 'Engine', value: vehicle.engine },
                  { label: 'Power', value: vehicle.power },
                  { label: 'Torque', value: vehicle.torque },
                ]
                  .filter((s) => s.value)
                  .map((s) => (
                    <div key={s.label}>
                      <p className='text-[10px] text-gray-400 uppercase tracking-wide'>
                        {s.label}
                      </p>
                      <p className='font-bold text-sm text-slate-900 mt-0.5'>
                        {s.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Similar Vehicles */}
            {similar.length > 0 && (
              <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4 '>
                <h2 className='font-bold text-sm text-slate-900 mb-3 flex items-center justify-between'>
                  Similar Vehicles
                  <Link
                    href={categoryPath}
                    className='text-xs text-blue-700 font-semibold hover:underline'
                  >
                    View all
                  </Link>
                </h2>
                <div className='space-y-2 '>
                  {similar.slice(0, 5).map((s) => {
                    const path = `/${typeToPath(s.type)}/${s.brand.slug}/${s.slug}`;
                    return (
                      <Link
                        key={s.id}
                        href={path}
                        className='flex gap-3 items-center p-2 rounded-xl hover:bg-blue-50 transition-colors group '
                      >
                        <div className='flex-shrink-0 rounded-lg overflow-hidden bg-gray-50'>
                          <Image
                            src={
                              s.images[0]?.url ||
                              s.featuredImage ||
                              '/placeholder.svg'
                            }
                            alt={s.name}
                            width={64}
                            height={48}
                            className='w-16 h-12 object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors'>
                            {s.name}
                          </p>
                          <p className='text-xs text-blue-700 font-bold'>
                            {s.priceDisplay || '—'}
                          </p>
                        </div>
                        <ChevronRight className='w-4 h-4 text-gray-300 flex-shrink-0' />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky mobile Test Drive CTA ── above mobile bottom nav */}
      <div className='fixed bottom-[76px] right-4 z-40 lg:hidden'>
        <button
          onClick={openTestDrive}
          className='flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white px-5 py-3 rounded-full shadow-2xl font-bold text-sm transition-colors'
        >
          <CalendarDays className='w-4 h-4' />
          Book Test Drive
        </button>
      </div>

      {/* ── Modals & overlays ── */}
      <OfferPopup
        isOpen={offerOpen}
        onClose={() => setOfferOpen(false)}
        carName={vehicle.name}
        vehicleType={vehicleType}
        brandId={vehicle.brandId}
      />

      <TestDriveModal
        open={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.brand.name} ${vehicle.name}`}
        brandId={vehicle.brandId}
      />

      <SuccessToast show={toastVisible} />
    </div>
  );
}
