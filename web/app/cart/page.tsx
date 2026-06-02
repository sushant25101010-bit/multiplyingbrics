"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/lib/types'

interface CartItem {
  listingId: string
  listing: Listing
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Auth states
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    // 1. Load cart from local storage
    const loadCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('mb-cart') || '[]')
        setCart(saved)
      } catch (e) {
        console.error('Failed to load cart', e)
      } finally {
        setLoading(false)
      }
    }
    loadCart()

    // 2. Fetch current user auth state
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          setRole(profile?.role || 'buyer')
        }
      } catch (e) {
        console.error('Failed to load user info', e)
      }
    }
    fetchUser()
  }, [])

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('mb-cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('mb-cart-changed'))
  }

  const updateQuantity = (listingId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.listingId === listingId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    saveCart(updated)
  }

  const removeItem = (listingId: string) => {
    const updated = cart.filter(item => item.listingId !== listingId)
    saveCart(updated)
  }

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.listing.price_per_unit * item.quantity), 0)
  }

  const handleCheckout = async () => {
    setCheckoutError(null)
    
    // 1. Not logged in -> redirect to auth
    if (!user) {
      router.push(`/auth?redirect=/cart`)
      return
    }

    // 2. Check role permission
    if (role !== 'buyer') {
      setCheckoutError(`Only Buyers can checkout. Your current account role is: ${role?.toUpperCase()}`)
      return
    }

    setCheckingOut(true)
    
    try {
      // 3. Send enquiries for each cart item
      const checkoutPromises = cart.map(async (item) => {
        const msg = `Checkout Purchase Inquiry:\nI would like to purchase ${item.quantity} ${item.listing.material?.unit}(s) of ${item.listing.material?.name} at the listed price of ₹${item.listing.price_per_unit} per unit.\nTotal estimated value: ₹${item.quantity * item.listing.price_per_unit}.`
        
        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor_id: item.listing.vendor_id,
            listing_id: item.listing.id,
            message: msg
          })
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to dispatch enquiries during checkout')
        }
      })

      await Promise.all(checkoutPromises)

      // 4. Clear cart on success
      localStorage.removeItem('mb-cart')
      window.dispatchEvent(new Event('mb-cart-changed'))
      
      router.push('/cart/success')
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.')
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-white dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your cart...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-16 text-center bg-white dark:bg-[#030712] min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
          <ShoppingBag className="text-amber-500" size={30} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Your cart is empty</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm sm:text-base leading-relaxed">
          Looks like you haven't added any materials to your cart yet. Explore the marketplace to find verified local rates.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>Browse Materials</span>
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 bg-white dark:bg-[#030712]">
      <header className="mb-10">
        <Link 
          href="/search" 
          className="group inline-flex items-center gap-1 text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold text-xs uppercase tracking-wider mb-4 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Search</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-955 dark:text-white tracking-tight">
          Procurement Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </h1>
      </header>

      {checkoutError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.listingId}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800/40 rounded-[24px] gap-6"
              >
                {/* Details */}
                <div className="flex-1">
                  <div className="inline-block px-2.5 py-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-md text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2">
                    {item.listing.material?.unit}-based price
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    {item.listing.material?.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Vendor: <span className="text-slate-700 dark:text-slate-300">{item.listing.vendor?.business_name}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                    Pincode: <span className="text-slate-700 dark:text-slate-300">{item.listing.pincode}</span>
                  </p>
                </div>

                {/* Adjust Quantity / Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
                    <button 
                      onClick={() => updateQuantity(item.listingId, -1)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-950 dark:text-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.listingId, 1)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Subtotal</p>
                      <p className="text-base font-extrabold text-slate-950 dark:text-white">
                        ₹{(item.listing.price_per_unit * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.listingId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-[28px] sticky top-24 shadow-sm">
            <h2 className="text-xl font-black text-slate-950 dark:text-white mb-6 tracking-tight">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-850">
              <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span>Gross Subtotal</span>
                <span>₹{getSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span>Shipping & Transport</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">Direct Quote</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                <span>Middleman Commission</span>
                <span className="text-emerald-500 uppercase font-bold tracking-wide">₹0 (Zero Comm)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-sm font-black text-slate-950 dark:text-white">Estimated Total</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-955 dark:text-white">
                ₹{getSubtotal().toLocaleString()}
              </span>
            </div>

            {/* Warning if role is vendor/admin */}
            {user && role !== 'buyer' && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl leading-relaxed">
                Only Buyers are authorized to checkout. Please log in with a Buyer account.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut || (user && role !== 'buyer')}
              className="w-full py-4 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white dark:text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {checkingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>{user ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4 leading-relaxed font-semibold">
              Checkout submits direct purchase inquiries to the respective verified material vendors. Payments & logistics will be completed directly.
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
