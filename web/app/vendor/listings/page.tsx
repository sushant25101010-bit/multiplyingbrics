"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Listing } from '@/lib/types'

export default function ManageListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/vendor/listings')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, { method: 'DELETE' })
      if (res.ok) fetchListings()
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleStock = async (id: string, currentStock: boolean) => {
    try {
      await fetch(`/api/vendor/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ in_stock: !currentStock })
      })
      fetchListings()
    } catch (err) {
      console.error('Update failed', err)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading listings...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900">Manage Listings</h1>
          <p className="text-slate-500 mt-1">Control your pricing per material and pincode</p>
        </div>
        <Link 
          href="/vendor/listings/edit" 
          className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold min-h-[48px] flex items-center"
        >
          Add New Listing
        </Link>
      </header>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Material</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Pincode</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price (₹)</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{item.material?.name}</p>
                  <p className="text-xs text-slate-500">Unit: {item.material?.unit}</p>
                </td>
                <td className="p-4 font-mono text-slate-600">{item.pincode}</td>
                <td className="p-4">
                  <span className="text-lg font-black text-slate-900">₹{item.price_per_unit}</span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStock(item.id, item.in_stock)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      item.in_stock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.in_stock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link 
                      href={`/vendor/listings/edit?id=${item.id}`}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Edit"
                    >
                      ✏️
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deletingId === item.id ? '⌛' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  No listings found. Start by adding your first material price.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
