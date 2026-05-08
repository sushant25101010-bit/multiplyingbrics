"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Enquiry, Vendor } from '@/lib/types'

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

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading account...</div>
  if (!data) return null

  return (
    <main className="max-w-[clamp(320px,95vw,1000px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-12">
        <h1 className="text-[clamp(28px,5vw,48px)] font-black text-slate-900 tracking-tight leading-tight mb-2">
          Hello, {data.user.full_name || 'Buyer'}
        </h1>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Phone: {data.user.phone}</p>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 mb-8 gap-8">
        <button 
          onClick={() => setActiveTab('enquiries')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'enquiries' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-300'
          }`}
        >
          My Enquiries ({data.enquiries.length})
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'saved' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-300'
          }`}
        >
          Saved Vendors ({data.saved_vendors.length})
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'enquiries' ? (
          <div className="space-y-4">
            {data.enquiries.map((enquiry) => (
              <div key={enquiry.id} className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{enquiry.vendor.business_name}</h3>
                    <p className="text-sm text-slate-500">
                      Product: <span className="font-bold">{enquiry.listing?.material.name || 'General Inquiry'}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    enquiry.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    enquiry.status === 'responded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {enquiry.status}
                  </span>
                </div>
                <p className="text-slate-600 italic text-sm border-l-2 border-slate-100 pl-4 mb-4">"{enquiry.message}"</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sent on {new Date(enquiry.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {data.enquiries.length === 0 && (
              <EmptyState icon="✉️" text="You haven't sent any enquiries yet." />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.saved_vendors.map(({ vendor }) => (
              <Link 
                key={vendor.id} 
                href={`/vendor/${vendor.id}`}
                className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight mb-2">{vendor.business_name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{vendor.address}</p>
                </div>
                <div className="mt-6 flex items-center text-slate-900 font-bold text-sm">
                  View Profile →
                </div>
              </Link>
            ))}
            {data.saved_vendors.length === 0 && (
              <div className="col-span-full">
                <EmptyState icon="⭐" text="Save vendors to quickly find them later." />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyState({ icon, text }: { icon: string, text: string }) {
  return (
    <div className="p-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
      <span className="text-4xl mb-4 block">{icon}</span>
      <p className="text-slate-500 font-bold">{text}</p>
    </div>
  )
}
