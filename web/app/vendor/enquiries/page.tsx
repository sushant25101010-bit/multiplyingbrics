"use client"

import { useEffect, useState } from 'react'

interface EnquiryData {
  id: string
  message: string
  status: 'open' | 'responded' | 'closed'
  created_at: string
  buyer: {
    full_name: string | null
    phone: string | null
  }
  listing: {
    pincode: string
    material: {
      name: string
      unit: string
    }
  } | null
}

export default function VendorEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/vendor/enquiries')
      const data = await res.json()
      if (res.ok) setEnquiries(data.enquiries)
    } catch (err) {
      console.error('Failed to poll enquiries', err)
    } finally {
      setLoading(false)
    }
  }

  // Polling pattern: immediate load + every 30s
  useEffect(() => {
    fetchEnquiries()
    const interval = setInterval(fetchEnquiries, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: string, status: 'open' | 'responded' | 'closed') => {
    try {
      const res = await fetch(`/api/vendor/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) fetchEnquiries()
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading inbox...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1000px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-10">
        <h1 className="text-[clamp(24px,4vw,36px)] font-black text-slate-900 tracking-tight">
          Enquiries Inbox
        </h1>
        <p className="text-slate-500 mt-2">Manage leads from interested buyers.</p>
      </header>

      <div className="space-y-6">
        {enquiries.map((enquiry) => (
          <div 
            key={enquiry.id} 
            className={`p-[clamp(16px,3vw,32px)] border-2 rounded-3xl transition-all ${
              enquiry.status === 'open' ? 'bg-white border-slate-900 shadow-xl shadow-slate-200/50' : 'bg-slate-50 border-slate-200 opacity-80'
            }`}
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  enquiry.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  enquiry.status === 'responded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {enquiry.status}
                </span>
                <h2 className="text-[clamp(18px,2vw,22px)] font-black text-slate-900 mt-2">
                  {enquiry.buyer?.full_name || 'Anonymous Buyer'}
                </h2>
                <p className="text-slate-500 text-sm font-bold">📞 {enquiry.buyer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Received</p>
                <p className="text-sm font-bold text-slate-600">{new Date(enquiry.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Interested in</p>
              <p className="font-bold text-slate-900">
                {enquiry.listing?.material.name} ({enquiry.listing?.material.unit})
              </p>
              <p className="text-xs text-slate-500">Pincode: {enquiry.listing?.pincode}</p>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</p>
              <p className="text-slate-700 leading-relaxed italic">"{enquiry.message}"</p>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-6">
              <button 
                onClick={() => updateStatus(enquiry.id, 'responded')}
                className="px-6 py-3 min-h-[48px] bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                disabled={enquiry.status === 'responded'}
              >
                Mark as Responded
              </button>
              <button 
                onClick={() => updateStatus(enquiry.id, 'closed')}
                className="px-6 py-3 min-h-[48px] bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                disabled={enquiry.status === 'closed'}
              >
                Close enquiry
              </button>
              <a 
                href={`tel:${enquiry.buyer?.phone}`}
                className="px-6 py-3 min-h-[48px] bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center"
              >
                Call Buyer
              </a>
            </div>
          </div>
        ))}

        {enquiries.length === 0 && (
          <div className="p-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <span className="text-4xl mb-4 block">📥</span>
            <p className="text-slate-500 font-bold">Your inbox is empty. New leads will appear here.</p>
          </div>
        )}
      </div>
    </main>
  )
}
