"use client"

import { useEffect, useState } from 'react'

interface AdminVendor {
  id: string
  business_name: string
  gst_number: string | null
  address: string | null
  status: string
  created_at: string
  owner: {
    full_name: string | null
    phone: string | null
    email: string | null
  }
  documents: {
    id: string
    doc_type: string
    storage_path: string
  }[]
  listings?: {
    id: string
    price_per_unit: number
    in_stock: boolean
    material: { name: string; unit: string }
  }[]
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)

  const fetchVendors = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vendors?status=${status}`)
      const data = await res.json()
      if (res.ok) setVendors(data)
    } catch (err) {
      console.error('Failed to fetch vendors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors(activeTab)
  }, [activeTab])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    let rejection_note = ''
    if (action === 'reject') {
      const note = prompt('Enter rejection reason:')
      if (!note) return
      rejection_note = note
    }

    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejection_note })
      })
      if (res.ok) fetchVendors(activeTab)
    } catch (err) {
      console.error('Action failed', err)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-12">
        <h1 className="text-[clamp(28px,5vw,48px)] font-black text-slate-900 tracking-tight leading-tight">
          Vendor Management
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
          Manage vendor applications, approvals, and listings
        </p>
      </header>

      <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-200 pb-4">
        {(['pending', 'approved', 'rejected'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading vendors...</div>
      ) : (
        <div className="space-y-8">
          {vendors.map((vendor) => (
            <div key={vendor.id} className={`p-[clamp(20px,4vw,40px)] border-2 border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 transition-colors duration-300 ${vendor.status === 'approved' ? 'bg-transparent' : 'bg-white'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Business Info */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-[clamp(20px,2vw,24px)] font-black text-slate-900 dark:text-white">{vendor.business_name}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      vendor.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      vendor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Owner</span>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{vendor.owner?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">GST Number</span>
                      <p className="font-bold text-slate-700 dark:text-slate-200 font-mono">{vendor.gst_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Phone</span>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{vendor.owner?.phone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Applied On</span>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{new Date(vendor.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${vendor.status === 'approved' ? 'bg-transparent border-slate-200/20 dark:border-slate-800/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Address</span>
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">{vendor.address}</p>
                  </div>
                </div>

                {/* Documents & Actions */}
                <div className="flex flex-col h-full">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Verification Documents</h3>
                  <div className="flex flex-wrap gap-2 mb-auto">
                    {vendor.documents.map((doc) => {
                      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vendor-documents/${doc.storage_path}`
                      return (
                        <a 
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={doc.id}
                          className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <span>📄</span>
                          {doc.doc_type.toUpperCase()}
                        </a>
                      )
                    })}
                    {vendor.documents?.length === 0 && <p className="text-slate-400 italic text-sm">No documents uploaded.</p>}
                  </div>

                  <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
                    {vendor.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(vendor.id, 'approve')}
                          disabled={!!processing}
                          className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 min-h-[48px]"
                        >
                          {processing === vendor.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleAction(vendor.id, 'reject')}
                          disabled={!!processing}
                          className="flex-1 py-4 bg-red-50 text-red-700 border border-red-100 font-black rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50 min-h-[48px]"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                        className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all min-h-[48px]"
                      >
                        {expandedVendor === vendor.id ? 'Hide Listings' : `View Listings (${vendor.listings?.length || 0})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Listings View */}
              {expandedVendor === vendor.id && (
                <div className="mt-8 pt-8 border-t-2 border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-lg font-black text-slate-900 mb-6">Vendor Listings</h3>
                  {vendor.listings && vendor.listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {vendor.listings.map(listing => (
                        <div key={listing.id} className="p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors">
                          <p className="font-bold text-slate-900">{listing.material?.name}</p>
                          <p className="text-xs text-slate-500 mb-4">Unit: {listing.material?.unit}</p>
                          <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                            <p className="text-xl font-black text-amber-600">₹{listing.price_per_unit}</p>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${listing.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {listing.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                      <p className="text-slate-500 font-bold">No product listings found for this vendor.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {vendors.length === 0 && (
            <div className="p-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-5xl mb-6 block">📂</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No {activeTab} vendors</h2>
              <p className="text-slate-500 dark:text-slate-400">There are currently no vendor applications in this category.</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
