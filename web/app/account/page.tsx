"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Enquiry, Vendor } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Building, Clock, Star, Mail, Phone, ArrowRight, Loader2, MessageSquare, Settings, LogOut, Package, MapPin, Heart, FileText, CheckCircle, AlertCircle, Users, BarChart3, ShieldCheck } from 'lucide-react'
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AccountData {
  user: User & { google_avatar?: string | null }
  saved_vendors: { vendor: Vendor }[]
  enquiries: (Enquiry & { vendor: { business_name: string }, listing: { material: { name: string } } | null })[]
  vendor?: Vendor
  stats?: {
    total_listings?: number
    total_vendors?: number
    pending_vendors?: number
    total_users?: number
  }
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'enquiries' | 'saved'>('enquiries')
  const router = useRouter()
  const supabase = createClient()

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const maskGST = (gst: string | null) => {
    if (!gst || gst.length < 15) return gst;
    return gst.substring(0, 7) + '****' + gst.substring(11);
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-slate-50/50 dark:bg-[#030712]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    )
  }

  if (!data) return null

  const renderBuyerContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <ActionCard title="My Orders" desc="View recent orders" icon={<Package size={24} />} />
        <ActionCard title="Saved Addresses" desc="Manage delivery locations" icon={<MapPin size={24} />} />
        <ActionCard title="Wishlist" desc="Saved products" icon={<Heart size={24} />} />
        <ActionCard title="Account Settings" desc="Update password & preferences" icon={<Settings size={24} />} />
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-8 relative">
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
                    className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                          <Building size={16} className="text-slate-500 dark:text-slate-400" />
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

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl mb-4 flex gap-2">
                      <MessageSquare size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-slate-600 dark:text-slate-350 italic text-sm leading-relaxed">
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
                  className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
    </>
  )

  const renderVendorContent = () => (
    <>
      {data.vendor?.status === 'pending' && (
        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-4">
          <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-1">Account under review</h2>
            <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
              Your vendor account is currently under review. Our team is verifying your GST and business information. You will be notified once your account has been approved.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Products Listed" value={data.stats?.total_listings || 0} />
        <ActionCard title="Vendor Dashboard" desc="Overview of your store" icon={<BarChart3 size={24} />} link="/vendor/dashboard" />
        <ActionCard title="Manage Listings" desc="Update products & prices" icon={<Package size={24} />} link="/vendor/listings" />
        <ActionCard title="Orders Received" desc="Track incoming orders" icon={<FileText size={24} />} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Building className="text-slate-400" />
          Business Information
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Business Name</p>
            <p className="font-semibold text-slate-900 dark:text-white">{data.vendor?.business_name}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">GST Number</p>
            <p className="font-semibold font-mono text-slate-900 dark:text-white">{maskGST(data.vendor?.gst_number || '')}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">GST Verification Status</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold mt-1">
              {data.vendor?.status === 'approved' ? (
                <><CheckCircle size={14} className="text-emerald-500" /><span className="text-emerald-700 dark:text-emerald-400">Verified</span></>
              ) : data.vendor?.status === 'pending' ? (
                <><Clock size={14} className="text-amber-500" /><span className="text-amber-700 dark:text-amber-400">Pending Review</span></>
              ) : (
                <><AlertCircle size={14} className="text-red-500" /><span className="text-red-700 dark:text-red-400">Rejected</span></>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vendor Since</p>
            <p className="font-semibold text-slate-900 dark:text-white">{new Date(data.vendor?.created_at || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </>
  )

  const renderAdminContent = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Vendors" value={data.stats?.total_vendors || 0} />
        <StatCard title="Pending Approvals" value={data.stats?.pending_vendors || 0} highlight={true} />
        <StatCard title="Total Products" value={data.stats?.total_listings || 0} />
        <StatCard title="Total Users" value={data.stats?.total_users || 0} />
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Admin Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard title="Admin Dashboard" desc="System overview" icon={<ShieldCheck size={24} />} link="/admin/vendors" />
        <ActionCard title="Vendor Management" desc="Manage all vendors" icon={<Building size={24} />} link="/admin/vendors" />
        <ActionCard title="Approval Requests" desc="Review pending GSTs" icon={<CheckCircle size={24} />} link="/admin/vendors?status=pending" />
        <ActionCard title="Product Management" desc="Global catalog" icon={<Package size={24} />} />
        <ActionCard title="Platform Settings" desc="Configure platform" icon={<Settings size={24} />} />
      </div>
    </>
  )

  return (
    <main className="max-w-[1200px] mx-auto p-4 sm:p-8 lg:p-12">
      <header className="mb-10 sm:mb-12 bg-white dark:bg-[#030712] rounded-3xl p-6 sm:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <ProfilePhotoUpload 
            userId={data.user.id} 
            initialAvatarUrl={data.user.avatar_url} 
            googleAvatarUrl={data.user.google_avatar}
            onUploadSuccess={(url) => setData({ ...data, user: { ...data.user, avatar_url: url }})}
          />
          
          <div className="text-center sm:text-left pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase tracking-widest">
              <span>{data.user.role === 'buyer' ? 'User Account' : data.user.role === 'vendor' ? 'Vendor Account' : 'Administrator'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight mb-2">
              {data.user.full_name || 'User'}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {data.user.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <span>{data.user.email}</span>
                </div>
              )}
              {data.user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span>+91 {data.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span>Joined {new Date(data.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="self-center lg:self-start flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-800"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      {/* Role-Specific Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {data.user.role === 'buyer' && renderBuyerContent()}
        {data.user.role === 'vendor' && renderVendorContent()}
        {data.user.role === 'admin' && renderAdminContent()}
      </div>
      
    </main>
  )
}

function ActionCard({ title, desc, icon, link }: { title: string, desc: string, icon: React.ReactNode, link?: string }) {
  const content = (
    <>
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </>
  )
  
  const className = "block p-6 bg-white dark:bg-[#030712] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 hover:shadow-lg dark:hover:shadow-amber-500/5 transition-all group cursor-pointer"
  
  if (link) {
    return <Link href={link} className={className}>{content}</Link>
  }
  return <div className={className}>{content}</div>
}

function StatCard({ title, value, highlight = false }: { title: string, value: number, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 'bg-white border-slate-200 dark:bg-[#030712] dark:border-slate-800'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${highlight ? 'text-amber-800 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {title}
      </p>
      <p className={`text-3xl font-black ${highlight ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
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
