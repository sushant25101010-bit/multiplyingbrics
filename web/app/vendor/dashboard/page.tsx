"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  stats: {
    total_listings: number
    active_listings: number
    out_of_stock: number
    open_enquiries: number
    total_enquiries: number
    pincodes_served: number
  }
  vendor_status: 'pending' | 'approved' | 'rejected'
}

export default function VendorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/vendor/dashboard')
        if (res.status === 404) {
          window.location.href = '/vendor/register'
          return
        }
        const json = await res.json()
        if (res.ok) setData(json)
      } catch (err) {
        console.error('Failed to fetch dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900 dark:text-white">Vendor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your construction material listings</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border ${
          data?.vendor_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
          data?.vendor_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          Status: {data?.vendor_status}
        </div>
      </header>

      {data?.vendor_status === 'pending' && (
        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Account under review</h2>
          <p className="text-slate-600 dark:text-slate-400">Your vendor account is currently under review. Our team is verifying your GST and business information. You will be notified once your account has been approved.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(16px,3vw,24px)] mb-12">
        <StatCard title="Total Listings" value={data?.stats.total_listings || 0} link="/vendor/listings" color="slate" />
        <StatCard title="Active Listings" value={data?.stats.active_listings || 0} link="/vendor/listings" color="emerald" />
        <StatCard title="Out of Stock" value={data?.stats.out_of_stock || 0} link="/vendor/listings" color="red" />
        <StatCard title="Open Enquiries" value={data?.stats.open_enquiries || 0} link="/vendor/enquiries" color="amber" />
        <StatCard title="Total Enquiries" value={data?.stats.total_enquiries || 0} link="/vendor/enquiries" color="blue" />
        <StatCard title="Pincodes Served" value={data?.stats.pincodes_served || 0} link="/account" color="purple" />
      </div>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            title="Add New Listing" 
            desc="Add price for a material" 
            link="/vendor/listings/edit" 
            icon="➕" 
            disabled={data?.vendor_status !== 'approved'}
          />
          <ActionCard 
            title="Manage Listings" 
            desc="View and update prices" 
            link="/vendor/listings" 
            icon="📋" 
          />
          <ActionCard 
            title="View Enquiries" 
            desc="Respond to buyers" 
            link="/vendor/enquiries" 
            icon="✉️" 
          />
          <ActionCard 
            title="Profile Settings" 
            desc="Update business details" 
            link="/account" 
            icon="👤" 
          />
        </div>
      </section>
    </main>
  )
}

function StatCard({ title, value, link, color = 'slate' }: { title: string; value: number; link: string; color?: 'slate' | 'emerald' | 'red' | 'amber' | 'blue' | 'purple' }) {
  const colorMap = {
    slate: 'text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200',
    emerald: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300',
    red: 'text-red-600 dark:text-red-400 group-hover:text-red-500 dark:group-hover:text-red-300',
    amber: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-500 dark:group-hover:text-amber-300',
    blue: 'text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300',
    purple: 'text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300'
  }
  
  return (
    <Link href={link} className="p-8 bg-transparent border border-slate-200 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
      <h3 className="text-slate-400 dark:text-slate-500 font-black mb-2 uppercase text-xs tracking-widest">{title}</h3>
      <p className={`text-[clamp(32px,4vw,48px)] font-black leading-none ${colorMap[color]}`}>{value}</p>
    </Link>
  )
}

function ActionCard({ title, desc, link, icon, disabled }: { title: string; desc: string; link: string; icon: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl opacity-60 cursor-not-allowed">
        <span className="text-2xl mb-4 block">{icon}</span>
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    )
  }
  return (
    <Link href={link} className="p-6 bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-900 dark:hover:border-slate-700 transition-colors">
      <span className="text-2xl mb-4 block">{icon}</span>
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </Link>
  )
}
