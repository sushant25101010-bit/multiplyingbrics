"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Enquiry, Vendor } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Building, Clock, Star, Mail, Phone, ArrowRight, Loader2, MessageSquare } from 'lucide-react'

interface AccountData {
  user: User
  saved_vendors: { vendor: Vendor }[]
  enquiries: (Enquiry & { vendor: { business_name: string }, listing: { material: { name: string } } | null })[]
}

export default function BuyerAccountPage() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'enquiries' | 'saved'>('enquiries')

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch('/api/account')
        const json = await res.json()
        if (res.ok) setData(json)
      } catch (err) {
        console.error('Failed to fetch account', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAccount()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-white dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8 lg:p-12 bg-white dark:bg-[#030712]">
      <header className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            Hello, {data.user.full_name || 'Buyer'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-semibold flex items-center gap-1.5">
            <Phone size={14} className="text-slate-400 dark:text-slate-600" />
            <span>+91 {data.user.phone}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider self-start sm:self-auto">
          <span>{data.user.role === 'buyer' ? 'User Account' : data.user.role === 'vendor' ? 'Vendor Account' : 'Admin Account'}</span>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-250 dark:border-slate-800 mb-8 gap-8 relative">
        {(['enquiries', 'saved'] as const).map((tab) => {
          const isActive = activeTab === tab
          const label = tab === 'enquiries' 
            ? `My Enquiries (${data.enquiries.length})` 
            : `Saved Vendors (${data.saved_vendors.length})`
            
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors duration-200 relative ${
                isActive ? 'text-slate-950 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-500 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          {activeTab === 'enquiries' ? (
            <motion.div 
              key="enquiries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {data.enquiries.map((enquiry) => {
                const isOpen = enquiry.status === 'open'
                const isResponded = enquiry.status === 'responded'
                
                return (
                  <div 
                    key={enquiry.id} 
                    className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                          <Building size={16} className="text-slate-550 dark:text-slate-450" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-950 dark:text-white text-base">
                            {enquiry.vendor.business_name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Product: <span className="font-bold text-slate-700 dark:text-slate-300">{enquiry.listing?.material.name || 'General Inquiry'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                        isOpen ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : 
                        isResponded ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 
                        'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        <Clock size={10} />
                        <span>{enquiry.status}</span>
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-xl mb-4 flex gap-2">
                      <MessageSquare size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-slate-650 dark:text-slate-350 italic text-sm leading-relaxed">
                        "{enquiry.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <Calendar size={12} />
                      <span>Sent on {new Date(enquiry.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
              
              {data.enquiries.length === 0 && (
                <EmptyState icon={<Mail size={28} className="text-slate-400" />} text="You haven't sent any enquiries yet." />
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="saved-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {data.saved_vendors.map(({ vendor }) => (
                <Link 
                  key={vendor.id} 
                  href={`/vendor/${vendor.id}`}
                  className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl hover:border-amber-500 dark:hover:border-amber-550 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-950 dark:text-white text-base leading-tight">
                        {vendor.business_name}
                      </h3>
                      <Star size={16} className="text-amber-500" fill="currentColor" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {vendor.address}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center text-slate-950 dark:text-white font-bold text-xs uppercase tracking-wider gap-1 group-hover:text-amber-500 transition-colors">
                    <span>View Profile</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
              
              {data.saved_vendors.length === 0 && (
                <div className="col-span-full">
                  <EmptyState icon={<Star size={28} className="text-slate-400" />} text="Save vendors to quickly find them later." />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 dark:bg-slate-900/10 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-slate-500 dark:text-slate-450 font-bold text-sm">{text}</p>
    </div>
  )
}
