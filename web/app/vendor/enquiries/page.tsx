"use client"

import { useEffect, useState, useCallback } from 'react'

interface EnquiryData {
  id: string
  message: string
  status: 'open' | 'responded' | 'closed'
  created_at: string
  quantity_requested: number
  pincode: string
  buyer: {
    full_name: string | null
    phone: string | null
    email: string | null
  }
  listing: {
    price_per_unit: number
    service_pincodes: string[]
    material: {
      name: string
      unit: string
      image_url: string | null
    }
  } | null
}

interface PaginatedResponse {
  enquiries: EnquiryData[]
  total: number
  page: number
  limit: number
}

const categoryImages: Record<string, string> = {
  'cement-concrete': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  'bricks-blocks': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
  'steel-metal': 'https://images.unsplash.com/photo-1532509774739-ce311542f5bf?w=800&q=80',
  'sand': 'https://images.unsplash.com/photo-1621274403997-36e78848dcf3?w=800&q=80',
  'tiles': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
  'electrical': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  'plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
}

export default function VendorEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  const fetchEnquiries = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      const res = await fetch(`/api/vendor/enquiries?page=${pageNum}&limit=${limit}`)
      const data: PaginatedResponse = await res.json()
      if (res.ok) {
        if (append) {
          setEnquiries(prev => [...prev, ...(data.enquiries || [])])
        } else {
          setEnquiries(data.enquiries || [])
        }
        setTotal(data.total || 0)
        setHasMore((data.enquiries?.length || 0) === limit)
      }
    } catch (err) {
      console.error('Failed to poll enquiries', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnquiries(1)
    const interval = setInterval(() => fetchEnquiries(1), 30000)
    return () => clearInterval(interval)
  }, [fetchEnquiries])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchEnquiries(nextPage, true)
  }

  const updateStatus = async (id: string, status: 'open' | 'responded' | 'closed') => {
    // Optimistic update
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    try {
      const res = await fetch(`/api/vendor/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) {
        // Refresh to revert
        fetchEnquiries(1)
      }
    } catch (err) {
      console.error('Failed to update status', err)
      fetchEnquiries(1)
    }
  }

  if (loading && page === 1) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading inbox...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1000px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-10 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-[clamp(24px,4vw,36px)] font-black text-slate-900 dark:text-white tracking-tight">
            Enquiries Inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage leads from interested buyers.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm">
          Total: {total}
        </div>
      </header>

      <div className="space-y-6">
        {enquiries.map((enquiry) => {
          const displayImage = enquiry.listing?.material.image_url || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'
          
          return (
            <div 
              key={enquiry.id} 
              className={`p-[clamp(16px,3vw,32px)] border-2 rounded-3xl transition-all ${
                enquiry.status === 'open' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 opacity-90'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
                {/* Buyer Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      enquiry.status === 'open' ? 'bg-amber-100 text-amber-700' : 
                      enquiry.status === 'responded' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {enquiry.status}
                    </span>
                    <p className="text-xs font-bold text-slate-400">{new Date(enquiry.created_at).toLocaleDateString()} {new Date(enquiry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {enquiry.buyer?.full_name || 'Anonymous Buyer'}
                  </h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center gap-2">
                      <span className="text-lg">📞</span> {enquiry.buyer?.phone || 'No phone'}
                    </p>
                    {enquiry.buyer?.email && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center gap-2">
                        <span className="text-lg">✉️</span> {enquiry.buyer?.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayImage} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Interested In</p>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight mb-1">
                      {enquiry.listing?.material.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-1">Qty: {enquiry.quantity_requested || 1} {enquiry.listing?.material.unit}</p>
                    <p className="text-xs text-slate-500 font-medium">Deliver to: <span className="font-bold text-slate-700 dark:text-slate-200">{enquiry.pincode || 'Not specified'}</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-8 pl-4 border-l-4 border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message from buyer</p>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-lg italic leading-relaxed">"{enquiry.message}"</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => updateStatus(enquiry.id, 'responded')}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none"
                  disabled={enquiry.status === 'responded' || enquiry.status === 'closed'}
                >
                  Mark as Responded
                </button>
                <button 
                  onClick={() => updateStatus(enquiry.id, 'closed')}
                  className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all disabled:opacity-50"
                  disabled={enquiry.status === 'closed'}
                >
                  Close Lead
                </button>
                {enquiry.buyer?.phone && (
                  <a 
                    href={`tel:${enquiry.buyer?.phone}`}
                    className="px-6 py-3 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-xl text-sm font-black hover:bg-emerald-100 transition-all flex items-center ml-auto"
                  >
                    Call Buyer
                  </a>
                )}
              </div>
            </div>
          )
        })}

        {enquiries.length === 0 && !loading && (
          <div className="p-20 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-4xl mb-4 block">📥</span>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Your inbox is empty.</p>
            <p className="text-slate-400 dark:text-slate-500">New leads from buyers will appear here.</p>
          </div>
        )}

        {hasMore && (
          <div className="mt-8 text-center">
            <button 
              onClick={loadMore}
              className="px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-full hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Load Older Leads
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
