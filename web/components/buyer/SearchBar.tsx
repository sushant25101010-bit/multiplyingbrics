"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Material } from '@/lib/types'
import { Package, MapPin, Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  materials: Material[]
}

export default function SearchBar({ materials }: SearchBarProps) {
  const router = useRouter()
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [pincode, setPincode] = useState('')
  const [focusInput, setFocusInput] = useState<'material' | 'pincode' | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationText, setLocationText] = useState('')
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    const cachedPincode = localStorage.getItem('mb_cached_pincode')
    const cachedLocation = localStorage.getItem('mb_cached_location')
    if (cachedPincode && cachedLocation) {
      setPincode(cachedPincode)
      setLocationText(cachedLocation)
    }
  }, [])

  const handleUseLocation = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    setLocationError('')
    setLocationText('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          
          if (data && data.address && data.address.postcode) {
            const code = data.address.postcode
            // Validate 6 digit Indian pincode
            if (/^\d{6}$/.test(code)) {
              setPincode(code)
              const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || ''
              const city = data.address.city || data.address.state_district || ''
              const text = area && city ? `📍 ${area}, ${city} - ${code}` : `📍 ${code}`
              setLocationText(text)
              setLocationError('')
              
              localStorage.setItem('mb_cached_pincode', code)
              localStorage.setItem('mb_cached_location', text)
            } else {
              setLocationError('Could not detect a valid 6-digit Indian pincode')
            }
          } else {
            setLocationError('Could not detect pincode for this location')
          }
        } catch (error) {
          setLocationError('Failed to fetch location data')
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access denied. Please enter manually.')
        } else {
          setLocationError('Unable to retrieve your location.')
        }
      },
      { timeout: 10000 }
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterial || pincode.length !== 6) return

    const material = materials.find(m => m.id === selectedMaterial)
    const materialName = material ? encodeURIComponent(material.name) : ''

    router.push(`/search?material_id=${selectedMaterial}&pincode=${pincode}&material_name=${materialName}`)
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <form 
        onSubmit={handleSearch}
        className="w-full flex flex-col md:flex-row gap-4 p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] sm:rounded-[32px] shadow-xl dark:shadow-2xl dark:shadow-slate-950/80 backdrop-blur-xl transition-all duration-300"
      >
      {/* Material Selector */}
      <div 
        className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 border ${
          focusInput === 'material' 
            ? 'bg-slate-100/90 border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/60 shadow-sm dark:shadow-inner' 
            : 'bg-transparent border-transparent hover:bg-slate-100/50 hover:border-slate-200/30 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/20'
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
        className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 border ${
          focusInput === 'pincode' 
            ? 'bg-slate-100/90 border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/60 shadow-sm dark:shadow-inner' 
            : 'bg-transparent border-transparent hover:bg-slate-100/50 hover:border-slate-200/30 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/20'
        }`}
      >
        <MapPin size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <div className="flex w-full justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Pincode</label>
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="text-[10px] font-bold text-amber-500 hover:text-amber-600 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              {isLocating ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  Detecting...
                </>
              ) : (
                '📍 Use My Location'
              )}
            </button>
          </div>
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
        className="px-8 min-h-[52px] bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl sm:rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/25 shrink-0"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Search prices"
      >
        <span>Search</span>
        <Search size={16} strokeWidth={2.5} />
      </motion.button>
    </form>
    
    {(locationText || locationError) && (
      <div className="text-sm font-medium">
        {locationText && <span className="text-emerald-600 dark:text-emerald-400">{locationText}</span>}
        {locationError && <span className="text-red-500 dark:text-red-400">{locationError}</span>}
      </div>
    )}
    </div>
  )
}
