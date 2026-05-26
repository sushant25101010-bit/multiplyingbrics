"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Category, Material } from '@/lib/types'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Sparkles, Package, ArrowRight, Loader2 } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-white dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading category...</p>
      </div>
    )
  }
  
  if (!data) return null

  const { category, materials } = data

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 bg-white dark:bg-[#030712]">
      {/* Header */}
      <header className="mb-12">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-1.5 text-slate-450 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>All Categories</span>
        </Link>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-4"
        >
          {category.name}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed"
        >
          {category.description}
        </motion.p>
      </header>

      {/* Quick Pincode Entry */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12 p-6 sm:p-8 bg-slate-900 dark:bg-slate-950/60 border border-slate-800 rounded-[28px] text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1.5 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400 animate-pulse" />
              <span>Check local rates</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Enter your pincode once to unlock rates for all {category.name} materials listed below.
            </p>
          </div>
          <div className="w-full md:w-auto relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="tel"
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full md:w-56 pl-11 pr-5 py-3.5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white font-extrabold text-center text-base focus:ring-4 focus:ring-amber-500/20 outline-none transition-all placeholder:text-white/30"
            />
          </div>
        </div>
      </motion.section>

      {/* Materials Grid */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {materials.map((material) => (
          <motion.div 
            key={material.id} 
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800/40 rounded-[28px] flex flex-col justify-between hover:border-amber-500 dark:hover:border-amber-500/80 transition-colors group shadow-sm hover:shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                <Package size={18} className="text-slate-550 dark:text-slate-450" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Material Grade
              </span>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white leading-tight mb-2.5">
                {material.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                {material.description || `High-quality ${material.name} directly supplied from certified nearby vendors.`}
              </p>
            </div>
            
            <motion.button 
              onClick={() => handleSearch(material.id, material.name)}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-950 dark:bg-slate-850 dark:hover:bg-white text-slate-900 hover:text-white dark:text-slate-200 dark:hover:text-slate-950 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
              whileTap={{ scale: 0.98 }}
            >
              <span>Check Prices</span> 
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>
        ))}

        {materials.length === 0 && (
          <div className="col-span-full p-16 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base">
              No specific materials found in this category yet.
            </p>
          </div>
        )}
      </motion.div>
    </main>
  )
}
