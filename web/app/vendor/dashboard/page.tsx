"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  stats: {
    listings: number
    pincodes: number
    enquiries: number
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
          <h1 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900">Vendor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your construction material listings</p>
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
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account under review</h2>
          <p className="text-slate-600">Your vendor account is currently under review. Our team is verifying your GST and business information. You will be notified once your account has been approved.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,3vw,24px)] mb-12">
        <StatCard title="Total Listings" value={data?.stats.listings || 0} link="/vendor/listings" />
        <StatCard title="Active Pincodes" value={data?.stats.pincodes || 0} link="/vendor/listings" />
        <StatCard title="Open Enquiries" value={data?.stats.enquiries || 0} link="/vendor/enquiries" />
      </div>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
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

function StatCard({ title, value, link }: { title: string; value: number; link: string }) {
  return (
    <Link href={link} className="p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-all group">
      <h3 className="text-slate-500 font-medium mb-1 uppercase text-xs tracking-widest">{title}</h3>
      <p className="text-4xl font-black text-slate-900 group-hover:text-slate-700">{value}</p>
    </Link>
  )
}

function ActionCard({ title, desc, link, icon, disabled }: { title: string; desc: string; link: string; icon: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed">
        <span className="text-2xl mb-4 block">{icon}</span>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    )
  }
  return (
    <Link href={link} className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-colors">
      <span className="text-2xl mb-4 block">{icon}</span>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </Link>
  )
}
