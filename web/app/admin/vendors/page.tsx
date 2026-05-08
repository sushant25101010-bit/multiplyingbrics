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
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/admin/vendors?status=pending')
      const data = await res.json()
      if (res.ok) setVendors(data)
    } catch (err) {
      console.error('Failed to fetch pending vendors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

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
      if (res.ok) fetchVendors()
    } catch (err) {
      console.error('Action failed', err)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading queue...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-12">
        <h1 className="text-[clamp(28px,5vw,48px)] font-black text-slate-900 tracking-tight leading-tight">
          Vendor Approval Queue
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
          {vendors.length} Pending Applications
        </p>
      </header>

      <div className="space-y-8">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="p-[clamp(20px,4vw,40px)] bg-white border-2 border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Business Info */}
              <div>
                <h2 className="text-[clamp(20px,2vw,24px)] font-black text-slate-900 mb-4">{vendor.business_name}</h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Owner</span>
                    <p className="font-bold text-slate-700">{vendor.owner?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">GST Number</span>
                    <p className="font-bold text-slate-700 font-mono">{vendor.gst_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Phone</span>
                    <p className="font-bold text-slate-700">{vendor.owner?.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Applied On</span>
                    <p className="font-bold text-slate-700">{new Date(vendor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Address</span>
                  <p className="text-sm text-slate-600 leading-relaxed">{vendor.address}</p>
                </div>
              </div>

              {/* Documents & Actions */}
              <div className="flex flex-col h-full">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Verification Documents</h3>
                <div className="flex flex-wrap gap-2 mb-auto">
                  {vendor.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2"
                    >
                      <span>📄</span>
                      {doc.doc_type.toUpperCase()}
                    </div>
                  ))}
                  {vendor.documents.length === 0 && <p className="text-slate-400 italic text-sm">No documents uploaded.</p>}
                </div>

                <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
                  <button 
                    onClick={() => handleAction(vendor.id, 'approve')}
                    disabled={!!processing}
                    className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 min-h-[48px]"
                  >
                    {processing === vendor.id ? 'Processing...' : 'Approve Vendor'}
                  </button>
                  <button 
                    onClick={() => handleAction(vendor.id, 'reject')}
                    disabled={!!processing}
                    className="flex-1 py-4 bg-red-50 text-red-700 border border-red-100 font-black rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50 min-h-[48px]"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {vendors.length === 0 && (
          <div className="p-24 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
            <span className="text-5xl mb-6 block">✅</span>
            <h2 className="text-xl font-black text-slate-900 mb-2">Queue Clear</h2>
            <p className="text-slate-500">All vendor applications have been processed.</p>
          </div>
        )}
      </div>
    </main>
  )
}
