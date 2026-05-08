"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Category, Material } from '@/lib/types'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<{ category: Category, materials: Material[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pincode, setPincode] = useState('')

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/category/${params.slug}`)
        const json = await res.json()
        if (res.ok) setData(json)
      } catch (err) {
        console.error('Fetch failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [params.slug])

  const handleSearch = (materialId: string, materialName: string) => {
    if (pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode first.')
      return
    }
    router.push(`/search?material_id=${materialId}&pincode=${pincode}&material_name=${encodeURIComponent(materialName)}`)
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading category...</div>
  if (!data) return null

  const { category, materials } = data

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-[clamp(32px,6vw,64px)]">
        <Link href="/" className="text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors mb-6 inline-block">
          ← All Categories
        </Link>
        <h1 className="text-[clamp(32px,5vw,56px)] font-black text-slate-900 tracking-tight leading-tight mb-4">
          {category.name}
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] text-slate-500 max-w-2xl leading-relaxed">
          {category.description}
        </p>
      </header>

      {/* Quick Pincode Entry */}
      <section className="mb-12 p-8 bg-slate-900 rounded-[32px] text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Check local prices</h2>
            <p className="text-slate-400 text-sm">Enter your pincode once to see rates for all {category.name} items below.</p>
          </div>
          <div className="w-full md:w-auto">
            <input 
              type="tel"
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full md:w-48 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black text-center text-lg focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div 
            key={material.id} 
            className="p-8 bg-white border border-slate-200 rounded-[32px] flex flex-col justify-between hover:border-slate-900 transition-all group"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Material Type</span>
              <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{material.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-8">{material.description || `High-quality ${material.name} for your construction needs.`}</p>
            </div>
            
            <button 
              onClick={() => handleSearch(material.id, material.name)}
              className="w-full py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-900 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              Check Prices 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        ))}

        {materials.length === 0 && (
          <div className="col-span-full p-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold">No specific materials found in this category yet.</p>
          </div>
        )}
      </div>
    </main>
  )
}
