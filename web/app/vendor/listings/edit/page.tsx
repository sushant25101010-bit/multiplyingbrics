"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Material, Listing, Category } from '@/lib/types'

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

function EditListingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')

  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
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
        const [catRes, matRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/materials')
        ])
        const catData = await catRes.json()
        const matData = await matRes.json()
        
        setCategories(catData)
        setMaterials(matData)

        // 2. Fetch listing if editing
        if (listingId) {
          const res = await fetch('/api/vendor/listings')
          const listings: Listing[] = await res.json()
          const item = listings.find(l => l.id === listingId)
          if (item) {
            const material = matData.find((m: any) => m.id === item.material_id)
            if (material) {
              setSelectedCategory(material.category_id)
            }
            
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
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setFormData({ ...formData, material_id: '' })
            }}
            className="w-full px-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all disabled:opacity-50"
            required
            disabled={!!listingId}
          >
            <option value="" disabled>Select a category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {selectedCategory && (
            <div className="mt-4 rounded-xl overflow-hidden h-32 w-full relative border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={categoryImages[categories.find(c => c.id === selectedCategory)?.slug || ''] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'} 
                alt="Category Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {selectedCategory && (
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
              {materials.filter(m => m.category_id === selectedCategory).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
              ))}
            </select>
          </div>
        )}

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
