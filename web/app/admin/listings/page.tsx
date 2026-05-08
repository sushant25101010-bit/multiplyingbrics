"use client"

import { useEffect, useState } from 'react'

interface AdminListing {
  id: string
  pincode: string
  price_per_unit: number
  in_stock: boolean
  created_at: string
  vendor: {
    business_name: string
  }
  material: {
    name: string
    unit: string
  }
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/admin/listings')
      const data = await res.json()
      if (res.ok) setListings(data)
    } catch (err) {
      console.error('Failed to fetch listings', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const removeListing = async (id: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY remove this listing?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' })
      if (res.ok) fetchListings()
    } catch (err) {
      console.error('Removal failed', err)
    } finally {
      setDeleting(null)
    }
  }

  const filteredListings = listings.filter(l => 
    l.vendor?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.material?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.pincode.includes(searchTerm)
  )

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading moderation board...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-10 flex justify-between items-end flex-wrap gap-6">
        <div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black text-slate-900 tracking-tight">Listings Moderation</h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Total: {listings.length} live listings</p>
        </div>
        <div className="w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search vendor, material or pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
          />
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material & Vendor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-6">
                    <p className="font-black text-slate-900 leading-tight">{listing.material?.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">{listing.vendor?.business_name}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-black text-slate-600 font-mono">
                      📍 {listing.pincode}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-lg font-black text-slate-900">₹{listing.price_per_unit}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">per {listing.material?.unit}</p>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button 
                      onClick={() => removeListing(listing.id)}
                      disabled={deleting === listing.id}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                      aria-label="Remove Listing"
                    >
                      {deleting === listing.id ? '⌛' : '🗑️ Remove'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold">
                    No matching listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
