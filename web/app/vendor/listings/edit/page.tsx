"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Material, Listing } from '@/lib/types'

function EditListingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')

  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    material_id: '',
    pincode: '',
    price_per_unit: '',
    notes: '',
    in_stock: true
  })

  useEffect(() => {
    async function init() {
      try {
        // 1. Fetch materials for dropdown
        const matRes = await fetch('/api/materials')
        const matData = await matRes.json()
        setMaterials(matData)

        // 2. Fetch listing if editing
        if (listingId) {
          const res = await fetch('/api/vendor/listings')
          const listings: Listing[] = await res.json()
          const item = listings.find(l => l.id === listingId)
          if (item) {
            setFormData({
              material_id: item.material_id,
              pincode: item.pincode,
              price_per_unit: item.price_per_unit.toString(),
              notes: item.notes || '',
              in_stock: item.in_stock
            })
          }
        }
      } catch (err) {
        console.error('Initialization failed', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [listingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const url = listingId ? `/api/vendor/listings/${listingId}` : '/api/vendor/listings'
      const method = listingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price_per_unit: parseFloat(formData.price_per_unit)
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save listing')

      router.push('/vendor/listings')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading form...</div>

  return (
    <main className="max-w-[clamp(320px,90vw,600px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-10">
        <h1 className="text-[clamp(24px,4vw,36px)] font-black text-slate-900 tracking-tight">
          {listingId ? 'Edit Listing' : 'Add New Listing'}
        </h1>
        <p className="text-slate-500 mt-2">Set your pricing and availability for a specific area.</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Material Type</label>
          <select
            value={formData.material_id}
            onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
            className="w-full px-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all disabled:opacity-50"
            required
            disabled={!!listingId} // Cannot change material after creation
          >
            <option value="" disabled>Select a material...</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Pincode</label>
          <input
            type="tel"
            placeholder="6-digit pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            className="w-full px-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all disabled:opacity-50"
            required
            disabled={!!listingId} // Cannot change pincode after creation
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price per unit (₹)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 450"
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
            className="w-full px-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Additional Notes</label>
          <textarea
            placeholder="Min order quantity, delivery time, etc."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[16px] font-medium text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all min-h-[120px]"
          />
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <input 
            type="checkbox" 
            id="in_stock" 
            checked={formData.in_stock}
            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
            className="w-6 h-6 rounded-md accent-slate-900"
          />
          <label htmlFor="in_stock" className="text-sm font-bold text-slate-700 cursor-pointer">Currently available and in stock</label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-4 min-h-[48px] bg-slate-900 text-white font-black text-[16px] rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-slate-900/20"
          >
            {submitting ? 'Saving...' : 'Save Listing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 min-h-[48px] bg-white border border-slate-200 text-slate-500 font-bold text-[16px] rounded-2xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}

export default function EditListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditListingContent />
    </Suspense>
  )
}
