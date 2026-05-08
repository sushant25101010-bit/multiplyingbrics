"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Material } from '@/lib/types'

interface SearchBarProps {
  materials: Material[]
}

export default function SearchBar({ materials }: SearchBarProps) {
  const router = useRouter()
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [pincode, setPincode] = useState('')

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
      className="flex flex-col md:flex-row gap-4 bg-white p-[clamp(12px,2vw,16px)] rounded-[clamp(16px,2vw,32px)] shadow-2xl shadow-slate-200 border border-slate-100"
    >
      <div className="flex-1 flex flex-col items-start gap-1 px-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material</label>
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="w-full bg-transparent font-bold text-slate-900 outline-none h-10 appearance-none cursor-pointer"
          required
        >
          <option value="" disabled>Select material...</option>
          {materials.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-10 bg-slate-100 hidden md:block self-center"></div>

      <div className="flex-1 flex flex-col items-start gap-1 px-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pincode</label>
        <input
          type="tel"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full bg-transparent font-bold text-slate-900 outline-none h-10 placeholder:text-slate-300 placeholder:font-medium"
          required
        />
      </div>

      <button
        type="submit"
        className="px-[clamp(24px,4vw,40px)] min-h-[56px] bg-slate-900 text-white rounded-[clamp(12px,1.5vw,20px)] font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        aria-label="Search prices"
      >
        <span>Search</span>
        <span className="text-xl">🔍</span>
      </button>
    </form>
  )
}
