"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Material } from '@/lib/types'
import { Package, MapPin, Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  materials: Material[]
}

export default function SearchBar({ materials }: SearchBarProps) {
  const router = useRouter()
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [pincode, setPincode] = useState('')
  const [focusInput, setFocusInput] = useState<'material' | 'pincode' | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterial || pincode.length !== 6) return

    const material = materials.find(m => m.id === selectedMaterial)
    const materialName = material ? encodeURIComponent(material.name) : ''

    router.push(`/search?material_id=${selectedMaterial}&pincode=${pincode}&material_name=${materialName}`)
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row gap-4 p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] sm:rounded-[32px] shadow-xl dark:shadow-2xl dark:shadow-slate-950/80 backdrop-blur-xl transition-all duration-300"
    >
      {/* Material Selector */}
      <div 
        className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
          focusInput === 'material' 
            ? 'bg-slate-50/80 dark:bg-slate-850/50 shadow-inner' 
            : 'hover:bg-slate-50/40 dark:hover:bg-slate-850/20'
        }`}
      >
        <Package size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Material</label>
          <div className="relative w-full">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              onFocus={() => setFocusInput('material')}
              onBlur={() => setFocusInput(null)}
              className="w-full bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none h-9 appearance-none cursor-pointer text-sm"
              required
            >
              <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">Select material...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block self-center"></div>

      {/* Pincode Input */}
      <div 
        className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
          focusInput === 'pincode' 
            ? 'bg-slate-50/80 dark:bg-slate-850/50 shadow-inner' 
            : 'hover:bg-slate-50/40 dark:hover:bg-slate-850/20'
        }`}
      >
        <MapPin size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Pincode</label>
          <input
            type="tel"
            placeholder="6-digit pincode"
            value={pincode}
            onFocus={() => setFocusInput('pincode')}
            onBlur={() => setFocusInput(null)}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none h-9 placeholder:text-slate-350 dark:placeholder:text-slate-600 text-sm"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        className="px-8 min-h-[52px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl sm:rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10 dark:shadow-white/5 shrink-0"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Search prices"
      >
        <span>Search</span>
        <Search size={16} />
      </motion.button>
    </form>
  )
}
