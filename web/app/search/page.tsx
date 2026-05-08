"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SearchResult, Listing } from '@/lib/types'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const materialId = searchParams.get('material_id')
  const pincode = searchParams.get('pincode')
  const materialName = searchParams.get('material_name') || 'Material'

  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [savingId, setSavingId] = useState<string | null>(null)
  const [enquiryListing, setEnquiryListing] = useState<Listing | null>(null)
  const [enquiryMsg, setEnquiryMsg] = useState('')

  useEffect(() => {
    async function fetchResults() {
      if (!materialId || !pincode) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/search?material_id=${materialId}&pincode=${pincode}`)
        const result = await res.json()
        
        if (!res.ok) throw new Error(result.error || 'Failed to fetch results')
        
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [materialId, pincode])

  const handleSave = async (vendorId: string) => {
    setSavingId(vendorId)
    try {
      const res = await fetch('/api/saved-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId })
      })
      if (res.status === 401) {
        router.push(`/auth?redirect=${window.location.pathname}${window.location.search}`)
        return
      }
      if (res.ok) alert('Vendor saved!')
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSavingId(null)
    }
  }

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryListing) return
    setLoading(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: enquiryListing.vendor_id,
          listing_id: enquiryListing.id,
          message: enquiryMsg
        })
      })
      if (res.status === 401) {
        router.push(`/auth?redirect=${window.location.pathname}${window.location.search}`)
        return
      }
      if (res.ok) {
        alert('Enquiry sent successfully!')
        setEnquiryListing(null)
        setEnquiryMsg('')
      }
    } catch (err) {
      console.error('Enquiry failed', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !enquiryListing) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[clamp(320px,90vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!materialId || !pincode) {
    return (
      <div className="max-w-[clamp(320px,90vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)] text-center">
        <h1 className="text-[clamp(24px,4vw,40px)] font-bold mb-4">Start your search</h1>
        <p className="text-slate-600">Please provide a material and pincode to see prices.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      {/* Enquiry Modal */}
      {enquiryListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Send Enquiry</h3>
            <p className="text-slate-500 mb-6">Contact {enquiryListing.vendor?.business_name} about {enquiryListing.material?.name}</p>
            <form onSubmit={handleSendEnquiry} className="space-y-4">
              <textarea 
                required
                value={enquiryMsg}
                onChange={(e) => setEnquiryMsg(e.target.value)}
                placeholder="Hi, I am interested in this material. Please share your availability and delivery terms."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[150px] outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800">
                  Send Now
                </button>
                <button type="button" onClick={() => setEnquiryListing(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="mb-[clamp(24px,5vw,48px)]">
        <h1 className="text-[clamp(20px,4vw,32px)] font-bold text-slate-900">
          {materialName} prices in {pincode}
        </h1>
        {data?.fallback_pincode && (
          <p className="mt-2 text-[clamp(14px,1.5vw,16px)] text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
            No exact matches for {pincode}. Showing results from nearby areas in {data.fallback_area}.
          </p>
        )}
        <p className="mt-2 text-slate-500 text-[clamp(14px,1.5vw,16px)]">
          {data?.listings.length || 0} vendors found
        </p>
      </header>

      <div className="grid gap-[clamp(16px,3vw,24px)]">
        {data?.listings.map((listing) => (
          <div 
            key={listing.id} 
            className="flex flex-col p-[clamp(16px,3vw,32px)] bg-white border border-slate-200 rounded-[32px] hover:shadow-xl hover:shadow-slate-200/50 transition-all gap-6 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-[clamp(18px,2.5vw,22px)] font-black text-slate-900">
                    {listing.vendor?.business_name}
                  </h2>
                  <button 
                    onClick={() => handleSave(listing.vendor_id)}
                    disabled={savingId === listing.vendor_id}
                    className="p-2 text-slate-300 hover:text-amber-500 transition-colors"
                    aria-label="Save Vendor"
                  >
                    {savingId === listing.vendor_id ? '⌛' : '⭐'}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[clamp(13px,1.5vw,15px)]">
                  <span className="flex items-center gap-1 font-bold">
                    📍 {listing.pincode}
                  </span>
                  <span>•</span>
                  <span>Unit: {listing.material?.unit}</span>
                </div>
              </div>

              <div className="flex flex-col md:items-end">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Price per {listing.material?.unit}</span>
                <span className="text-[clamp(28px,4vw,36px)] font-black text-slate-950 leading-none">
                  ₹{listing.price_per_unit}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-50 pt-6">
              <button 
                onClick={() => setEnquiryListing(listing)}
                className="flex-1 min-h-[48px] px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Send Enquiry</span>
                <span>✉️</span>
              </button>
              <Link 
                href={`/vendor/${listing.vendor_id}`}
                className="flex-1 min-h-[48px] px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}

        {data?.listings.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 text-[clamp(16px,2vw,20px)]">No vendors found for this material and location.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
