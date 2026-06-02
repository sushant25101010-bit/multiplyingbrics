"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SearchResult, Listing } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Mail, ArrowLeft, ArrowRight, Loader2, Sparkles, Building, Layers, ShoppingCart } from 'lucide-react'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const materialId = searchParams.get('material_id')
  const pincode = searchParams.get('pincode')
  const materialName = searchParams.get('material_name') || 'Material'

  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedVendorIds, setSavedVendorIds] = useState<string[]>([])
  const [enquiryListing, setEnquiryListing] = useState<Listing | null>(null)
  const [enquiryMsg, setEnquiryMsg] = useState('')
  
  const [cartIds, setCartIds] = useState<string[]>([])

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('mb-cart') || '[]')
        setCartIds(savedCart.map((item: any) => item.listingId))
      } catch (e) {
        console.error(e)
      }
    }
    loadCart()
    window.addEventListener('mb-cart-changed', loadCart)
    return () => window.removeEventListener('mb-cart-changed', loadCart)
  }, [])

  const handleCartAction = (listing: Listing) => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('mb-cart') || '[]')
      const index = savedCart.findIndex((item: any) => item.listingId === listing.id)
      
      if (index > -1) {
        savedCart.splice(index, 1)
        alert('Removed from cart!')
      } else {
        savedCart.push({
          listingId: listing.id,
          listing,
          quantity: 1
        })
        alert('Added to cart!')
      }
      
      localStorage.setItem('mb-cart', JSON.stringify(savedCart))
      window.dispatchEvent(new Event('mb-cart-changed'))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    async function fetchResults() {
      if (!materialId || !pincode) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/search?material_id=${materialId}&pincode=${pincode}`)
        const result = await res.json()
        
        if (!res.ok) throw new Error(result.error || 'Failed to fetch results')
        
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [materialId, pincode])

  const handleSave = async (vendorId: string) => {
    setSavingId(vendorId)
    try {
      const res = await fetch('/api/saved-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId })
      })
      if (res.status === 401) {
        router.push(`/auth?redirect=${window.location.pathname}${window.location.search}`)
        return
      }
      if (res.ok) {
        setSavedVendorIds(prev => [...prev, vendorId])
        alert('Vendor saved!')
      }
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSavingId(null)
    }
  }

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryListing) return
    setLoading(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: enquiryListing.vendor_id,
          listing_id: enquiryListing.id,
          message: enquiryMsg
        })
      })
      if (res.status === 401) {
        router.push(`/auth?redirect=${window.location.pathname}${window.location.search}`)
        return
      }
      if (res.ok) {
        alert('Enquiry sent successfully!')
        setEnquiryListing(null)
        setEnquiryMsg('')
      }
    } catch (err) {
      console.error('Enquiry failed', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !enquiryListing) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-white dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Finding the best rates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-12 bg-white dark:bg-[#030712]">
        <div className="p-6 bg-red-500/10 dark:bg-red-500/5 text-red-650 dark:text-red-400 rounded-2xl border border-red-500/20 flex flex-col gap-2">
          <span className="font-bold text-lg">Search Error</span>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (!materialId || !pincode) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-16 text-center bg-white dark:bg-[#030712] min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
          <Layers className="text-amber-500" size={30} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Start your search</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm sm:text-base leading-relaxed">
          Please select a construction material and pincode on the home page to fetch live rates.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 bg-white dark:bg-[#030712]">
      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnquiryListing(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[28px] p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 relative"
            >
              <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-1.5 flex items-center gap-2">
                <Mail className="text-amber-500" size={22} />
                <span>Send Enquiry</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Contact <span className="font-bold text-slate-700 dark:text-slate-200">{enquiryListing.vendor?.business_name}</span> about {enquiryListing.material?.name}
              </p>
              
              <form onSubmit={handleSendEnquiry} className="space-y-5">
                <textarea 
                  required
                  value={enquiryMsg}
                  onChange={(e) => setEnquiryMsg(e.target.value)}
                  placeholder="Hi, I am interested in this material. Please share your availability, lead times, and shipping terms."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[160px] outline-none focus:ring-4 focus:ring-amber-550/10 dark:focus:ring-amber-400/5 text-slate-805 dark:text-slate-200 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-grow py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-xl text-sm transition-all"
                  >
                    Send Now
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEnquiryListing(null)} 
                    className="flex-grow py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="mb-10 sm:mb-14">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-1 text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold text-xs uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Change search parameters</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
          {materialName} prices in {pincode}
        </h1>

        {data?.fallback_pincode && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl flex items-center gap-3">
            <Sparkles className="text-amber-500 shrink-0" size={18} />
            <p className="text-sm font-semibold leading-relaxed">
              No exact matches in {pincode}. Showing results from nearby areas in <span className="font-extrabold">{data.fallback_area}</span>.
            </p>
          </div>
        )}
        <p className="mt-3 text-slate-400 dark:text-slate-500 text-sm font-bold tracking-wide uppercase">
          {data?.listings.length || 0} vendors verified nearby
        </p>
      </header>

      {/* Grid container */}
      <div className="grid gap-6">
        {data?.listings.map((listing, idx) => {
          const isSaved = savedVendorIds.includes(listing.vendor_id)
          return (
            <motion.div 
              key={listing.id} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="flex flex-col p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-[28px] hover:shadow-xl dark:hover:shadow-slate-950/50 transition-all duration-300 gap-6 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Vendor details */}
                <div className="flex-1 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                    <Building size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3.5">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white leading-tight">
                        {listing.vendor?.business_name}
                      </h2>
                      
                      <motion.button 
                        onClick={() => handleSave(listing.vendor_id)}
                        disabled={savingId === listing.vendor_id || isSaved}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved 
                            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
                            : 'text-slate-400 hover:text-amber-500 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-amber-500/5 border-transparent'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Save Vendor"
                      >
                        {savingId === listing.vendor_id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : (
                          <Star size={16} fill={isSaved ? "currentColor" : "none"} />
                        )}
                      </motion.button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-405 dark:text-slate-500" /> 
                        <span>Pincode: {listing.pincode}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>Unit pricing: {listing.material?.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Price Tag */}
                <div className="flex flex-col md:items-end bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-2xl px-5 py-3 md:py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    Price per {listing.material?.unit}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white leading-none">
                    ₹{listing.price_per_unit}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/50 dark:border-slate-800/40 pt-5">
                <motion.button 
                  onClick={() => handleCartAction(listing)}
                  className={`min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                    cartIds.includes(listing.id)
                      ? 'bg-red-500 hover:bg-red-650 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 dark:bg-amber-500 dark:hover:bg-amber-400'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ShoppingCart size={16} />
                  <span>{cartIds.includes(listing.id) ? 'Remove' : 'Add to Cart'}</span>
                </motion.button>

                <motion.button 
                  onClick={() => setEnquiryListing(listing)}
                  className="min-h-[46px] px-4 py-2.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Mail size={16} />
                  <span>Send Enquiry</span>
                </motion.button>
                
                <Link 
                  href={`/vendor/${listing.vendor_id}`}
                  className="min-h-[46px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Vendor Profile</span>
                  <ArrowRight size={14} className="opacity-70" />
                </Link>
              </div>
            </motion.div>
          )
        })}

        {data?.listings.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base">
              No verified vendors found for this material in {pincode} yet.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-white dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading parameters...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
