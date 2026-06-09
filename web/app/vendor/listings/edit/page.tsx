"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface Material {
  id: string
  category_id: string
  name: string
  unit: string
  image_url: string | null
}

interface VendorPincode {
  id: string
  pincode: string
  area_name: string
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

function EditListingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')

  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [vendorPincodes, setVendorPincodes] = useState<VendorPincode[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    material_id: '',
    price_per_unit: '',
    available_stock: '0',
    delivery_availability: true,
    service_pincodes: [] as string[],
    in_stock: true,
    notes: ''
  })

  useEffect(() => {
    async function init() {
      try {
        const [catRes, matRes, pinRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/materials'),
          fetch('/api/vendor/pincodes')
        ])
        const catData = await catRes.json()
        const matData = await matRes.json()
        const pinData = pinRes.ok ? await pinRes.json() : []
        
        setCategories(catData)
        setMaterials(matData)
        setVendorPincodes(pinData)

        if (listingId) {
          const res = await fetch('/api/vendor/listings')
          const data = await res.json()
          const item = data?.listings?.find((l: any) => l.id === listingId) || data?.find?.((l: any) => l.id === listingId)
          if (item) {
            const material = matData.find((m: any) => m.id === item.material_id)
            if (material) {
              setSelectedCategory(material.category_id)
            }
            
            setFormData({
              material_id: item.material_id,
              price_per_unit: item.price_per_unit.toString(),
              available_stock: (item.available_stock || 0).toString(),
              delivery_availability: item.delivery_availability ?? true,
              service_pincodes: item.service_pincodes || [],
              in_stock: item.in_stock ?? true,
              notes: item.notes || ''
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
    if (!formData.material_id) {
      setError('Please select a material product')
      return
    }
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
          price_per_unit: parseFloat(formData.price_per_unit),
          available_stock: parseFloat(formData.available_stock)
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

  const selectedMaterial = materials.find(m => m.id === formData.material_id)
  const categoryFallbackImage = categoryImages[categories.find(c => c.id === selectedCategory)?.slug || ''] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'
  const displayImage = selectedMaterial?.image_url || categoryFallbackImage

  const togglePincode = (pincode: string) => {
    setFormData(prev => {
      const current = prev.service_pincodes
      if (current.includes(pincode)) {
        return { ...prev, service_pincodes: current.filter(p => p !== pincode) }
      } else {
        return { ...prev, service_pincodes: [...current, pincode] }
      }
    })
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading form...</div>

  return (
    <main className="max-w-[clamp(320px,90vw,800px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-10">
        <h1 className="text-[clamp(24px,4vw,36px)] font-black text-slate-900 dark:text-white tracking-tight">
          {listingId ? 'Edit Listing' : 'Add New Listing'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Streamlined product listing with precise control over your stock and delivery areas.</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-transparent p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border-2 border-slate-100 dark:border-slate-800">
        
        {/* Step 1: Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px]">1</span>
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setFormData({ ...formData, material_id: '' })
            }}
            className="w-full px-4 py-4 min-h-[48px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[16px] font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-slate-100/5 outline-none transition-all disabled:opacity-50"
            required
            disabled={!!listingId}
          >
            <option value="" disabled>Choose a construction material category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Product Selection */}
        {selectedCategory && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
              Select Specific Product
            </label>
            <select
              value={formData.material_id}
              onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
              className="w-full px-4 py-4 min-h-[48px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[16px] font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-slate-100/5 outline-none transition-all disabled:opacity-50"
              required
              disabled={!!listingId}
            >
              <option value="" disabled>Select exact product to list...</option>
              {materials.filter(m => m.category_id === selectedCategory).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 3: Auto Product Image */}
        {selectedCategory && (
          <div className="mt-4 rounded-2xl overflow-hidden h-48 w-full relative border-2 border-slate-100 dark:border-slate-800 shadow-inner group animate-in fade-in slide-in-from-top-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={displayImage} 
              alt="Product Preview" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
              <p className="text-white font-black drop-shadow-md">
                {selectedMaterial ? selectedMaterial.name : 'Category Image'} Preview
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Specific Listing Details */}
        {formData.material_id && (
          <div className="pt-8 mt-8 border-t-2 border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-top-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
              Listing Parameters
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 min-h-[48px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[16px] font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-slate-100/5 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Unit (Read-only)</label>
                <input
                  type="text"
                  value={selectedMaterial?.unit || ''}
                  disabled
                  className="w-full px-4 py-4 min-h-[48px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[16px] font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Available Stock</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 100"
                  value={formData.available_stock}
                  onChange={(e) => setFormData({ ...formData, available_stock: e.target.value })}
                  className="w-full px-4 py-4 min-h-[48px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[16px] font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-slate-100/5 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col justify-center pt-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_availability: !formData.delivery_availability })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.delivery_availability ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${formData.delivery_availability ? 'left-6.5 translate-x-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Delivery Available</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Service Pincodes</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Select the areas you want to serve for this specific product. These are pulled from your master vendor profile.</p>
              
              {vendorPincodes.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {vendorPincodes.map(vp => {
                    const isSelected = formData.service_pincodes.includes(vp.pincode)
                    return (
                      <button
                        type="button"
                        key={vp.id}
                        onClick={() => togglePincode(vp.pincode)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                          isSelected 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        {vp.area_name} ({vp.pincode})
                        {isSelected && <span className="ml-2 text-emerald-400 dark:text-emerald-600">✓</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-400 text-sm font-medium">
                  You haven't added any serviceable pincodes to your vendor profile yet. 
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Additional Notes (Optional)</label>
              <textarea
                placeholder="E.g., Minimum order of 50 bags required for free delivery."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[16px] font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-slate-100/5 outline-none transition-all min-h-[100px]"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-center pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all w-fit">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:checked:bg-slate-100"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Currently available and in stock</span>
              </label>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={submitting || !formData.material_id}
            className="flex-1 py-4 min-h-[48px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-[16px] rounded-2xl hover:bg-slate-800 dark:hover:bg-white disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 dark:shadow-none"
          >
            {submitting ? 'Saving Listing...' : 'Save Product Listing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 min-h-[48px] bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[16px] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
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
    <Suspense fallback={<div className="p-12 text-center font-bold text-slate-500">Loading form...</div>}>
      <EditListingContent />
    </Suspense>
  )
}
