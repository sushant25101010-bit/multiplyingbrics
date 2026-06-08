"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Listing } from '@/lib/types'

interface PaginatedResponse {
  listings: Listing[]
  total: number
  page: number
  limit: number
}

const categoryImages: Record<string, string> = {
  'cement-concrete': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  'bricks-blocks': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
  'steel-metal': 'https://images.unsplash.com/photo-1532509774739-ce311542f5bf?w=800&q=80',
  'sand': 'https://images.unsplash.com/photo-1621274403997-36e78848dcf3?w=800&q=80',
  'tiles': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
  'electrical': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  'plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
}

export default function ManageListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [vendorStatus, setVendorStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  const fetchListings = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      
      const statusRes = await fetch('/api/vendor/dashboard')
      if (statusRes.status === 404) {
        window.location.href = '/vendor/register'
        return
      }
      const statusData = await statusRes.json()
      if (statusRes.ok) setVendorStatus(statusData.vendor_status)

      const res = await fetch(`/api/vendor/listings?page=${pageNum}&limit=${limit}`)
      if (res.status === 404) {
        window.location.href = '/vendor/register'
        return
      }
      const data: PaginatedResponse = await res.json()
      if (res.ok) {
        if (append) {
          setListings(prev => [...prev, ...(data.listings || [])])
        } else {
          setListings(data.listings || [])
        }
        setTotal(data.total || 0)
        setHasMore((data.listings?.length || 0) === limit)
      }
    } catch (err) {
      console.error('Failed to fetch listings', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings(1)
  }, [fetchListings])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchListings(nextPage, true)
  }

  const handleDelete = async (id: string) => {
    if (vendorStatus !== 'approved') return
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id))
        setTotal(t => t - 1)
      }
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleStock = async (id: string, currentStock: boolean) => {
    if (vendorStatus !== 'approved') return
    // Optimistic update
    setListings(prev => prev.map(l => l.id === id ? { ...l, in_stock: !currentStock } : l))
    try {
      await fetch(`/api/vendor/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ in_stock: !currentStock })
      })
    } catch (err) {
      console.error('Update failed', err)
      // Revert on fail
      setListings(prev => prev.map(l => l.id === id ? { ...l, in_stock: currentStock } : l))
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (vendorStatus !== 'approved') return
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
    try {
      await fetch(`/api/vendor/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      console.error('Status update failed', err)
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: currentStatus } : l))
    }
  }

  if (loading && page === 1) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Loading listings...</div>

  return (
    <main className="max-w-[clamp(320px,95vw,1200px)] mx-auto p-[clamp(16px,4vw,48px)]">
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-[clamp(24px,4vw,36px)] font-black text-slate-900 tracking-tight">Manage Listings</h1>
          <p className="text-slate-500 mt-1 font-medium">Control your pricing, availability, and active regions.</p>
        </div>
        {vendorStatus === 'approved' ? (
          <Link 
            href="/vendor/listings/edit" 
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black min-h-[48px] flex items-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            + Add New Listing
          </Link>
        ) : (
          <div className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold min-h-[48px] flex items-center cursor-not-allowed">
            Approval Required
          </div>
        )}
      </header>

      {vendorStatus !== 'approved' && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
          Selling functionality is disabled because your account is currently under review.
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-slate-700">Total Products: {total}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item: any) => {
          const fallbackImage = categoryImages[item.material?.slug || ''] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'
          const displayImage = item.material?.image_url || fallbackImage
          
          return (
            <div key={item.id} className={`bg-white border-2 rounded-3xl overflow-hidden transition-all duration-300 ${item.status === 'paused' ? 'border-slate-200 opacity-75' : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1'}`}>
              {/* Product Image */}
              <div className="h-40 w-full relative bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayImage} alt={item.material?.name} className={`w-full h-full object-cover ${item.status === 'paused' ? 'grayscale' : ''}`} />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-md ${item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                    {item.status || 'active'}
                  </span>
                  {!item.in_stock && (
                    <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white bg-red-500 shadow-md">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.material?.category_id || 'Material'}</p>
                  <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-2">{item.material?.name}</h3>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-0.5">Price</p>
                    <p className="font-black text-2xl text-slate-900">₹{item.price_per_unit} <span className="text-sm text-slate-500 font-medium">/ {item.material?.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 mb-0.5">Stock</p>
                    <p className="font-bold text-slate-900">{item.available_stock || 0}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 mb-1">Serving {item.service_pincodes?.length || 0} Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {(item.service_pincodes || []).slice(0, 3).map((pin: string) => (
                      <span key={pin} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{pin}</span>
                    ))}
                    {(item.service_pincodes?.length || 0) > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">+{item.service_pincodes.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-4 border-t-2 border-slate-50">
                  <Link 
                    href={`/vendor/listings/edit?id=${item.id}`}
                    className={`col-span-1 flex justify-center items-center py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors ${vendorStatus !== 'approved' && 'opacity-50 pointer-events-none'}`}
                    title="Edit"
                  >
                    ✏️
                  </Link>
                  <button 
                    onClick={() => toggleStock(item.id, item.in_stock)}
                    disabled={vendorStatus !== 'approved'}
                    className={`col-span-1 flex justify-center items-center py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50`}
                    title="Toggle Stock"
                  >
                    {item.in_stock ? '📦' : '🚫'}
                  </button>
                  <button 
                    onClick={() => toggleStatus(item.id, item.status || 'active')}
                    disabled={vendorStatus !== 'approved'}
                    className={`col-span-1 flex justify-center items-center py-2 rounded-xl transition-colors disabled:opacity-50 ${item.status === 'active' ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                    title={item.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                  >
                    {item.status === 'active' ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id || vendorStatus !== 'approved'}
                    className="col-span-1 flex justify-center items-center py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === item.id ? '⌛' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {listings.length === 0 && !loading && (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-xl font-bold text-slate-600 mb-2">No listings yet</p>
          <p className="text-slate-500 mb-6">Start by adding your first material price.</p>
          <Link 
            href="/vendor/listings/edit" 
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black inline-block"
          >
            Add New Listing
          </Link>
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadMore}
            className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            Load More Products
          </button>
        </div>
      )}
    </main>
  )
}
