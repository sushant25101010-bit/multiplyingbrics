"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Listing } from '@/lib/types'

interface VendorProfile {
  id: string
  business_name: string
  address: string | null
  contact: {
    phone: string | null
    email: string | null
  } | null
}

export default function VendorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<{ vendor: VendorProfile, listings: Listing[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await fetch(`/api/vendors/${params.id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch vendor')
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [params.id])

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading profile...</div>
  if (error) return <div className="p-12 text-center text-red-500 font-bold">{error}</div>
  if (!data) return null

  const { vendor, listings } = data

  return (
    <main className="max-w-[clamp(320px,95vw,1000px)] mx-auto p-[clamp(16px,4vw,48px)]">
      {/* Vendor Header */}
      <header className="mb-12">
        <Link href="/" className="text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors mb-6 inline-block">
          ← Back to Search
        </Link>
        <h1 className="text-[clamp(28px,5vw,48px)] font-black text-slate-900 tracking-tight leading-tight mb-4">
          {vendor.business_name}
        </h1>
        <p className="text-[clamp(16px,2vw,18px)] text-slate-600 max-w-2xl leading-relaxed">
          {vendor.address || 'Address not provided'}
        </p>
      </header>

      {/* Gated Contact Section */}
      <section className="mb-16 p-[clamp(20px,4vw,40px)] bg-slate-900 text-white rounded-[32px] overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-[clamp(18px,3vw,24px)] font-bold mb-6">Contact Details</h2>
          
          {vendor.contact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2">Phone Number</span>
                <p className="text-[clamp(20px,2vw,24px)] font-bold">{vendor.contact.phone || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2">Email Address</span>
                <p className="text-[clamp(20px,2vw,24px)] font-bold">{vendor.contact.email || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-6">
              <p className="text-slate-400 text-[clamp(14px,1.5vw,16px)]">
                Login is required to view vendor contact details and send enquiries.
              </p>
              <Link 
                href={`/auth?redirect=/vendor/${vendor.id}`}
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[clamp(15px,1.5vw,16px)] hover:bg-slate-100 transition-all min-h-[48px] flex items-center"
              >
                Login to View Contact
              </Link>
            </div>
          )}
        </div>
        {/* Abstract background shape */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </section>

      {/* Active Listings */}
      <section>
        <h2 className="text-[clamp(20px,3vw,28px)] font-black text-slate-900 mb-8 tracking-tight">
          Current Material Prices
        </h2>
        
        <div className="grid gap-4">
          {listings.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.material?.name}</h3>
                <p className="text-sm text-slate-500">📍 Servicing Pincode: {item.pincode}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">₹{item.price_per_unit}</span>
                <span className="text-xs text-slate-400 font-bold block">per {item.material?.unit}</span>
              </div>
            </div>
          ))}

          {listings.length === 0 && (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">This vendor hasn't listed any prices yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
