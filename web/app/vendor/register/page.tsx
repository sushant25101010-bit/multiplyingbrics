"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    business_name: '',
    gst_number: '',
    address: ''
  })
  
  const [documents, setDocuments] = useState({
    pan: null as File | null,
    trade_licence: null as File | null,
    gst: null as File | null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pan' | 'trade_licence' | 'gst') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB")
        return
      }
      setDocuments(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mandatory GST validation
    if (!formData.gst_number && !documents.gst) {
      setError('You must provide either a GST Number or upload a GST Certificate to proceed.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Create vendor record
      const vendorRes = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const vendorData = await vendorRes.json()
      
      if (!vendorRes.ok) throw new Error(vendorData.error || 'Failed to register vendor')

      // 2. Upload documents iteratively
      const types: ('pan' | 'trade_licence' | 'gst')[] = ['pan', 'trade_licence', 'gst']
      
      for (const docType of types) {
        const file = documents[docType]
        if (file) {
          const docForm = new FormData()
          docForm.append('file', file)
          docForm.append('doc_type', docType)

          const docRes = await fetch('/api/vendor/documents', {
            method: 'POST',
            body: docForm
          })
          const docData = await docRes.json()
          if (!docRes.ok) throw new Error(docData.error || `Failed to upload ${docType}`)
        }
      }

      router.push('/vendor/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-[clamp(16px,4vw,48px)] max-w-[clamp(320px,90vw,800px)] mx-auto font-sans">
      <h1 className="text-[clamp(24px,4vw,40px)] font-bold mb-[clamp(8px,2vw,16px)] text-slate-900">
        Become a Vendor
      </h1>
      <p className="text-[clamp(14px,2vw,18px)] text-slate-600 mb-[clamp(24px,4vw,40px)]">
        Register your business to start listing construction materials on Multiplying Brics.
      </p>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6 text-[clamp(14px,1.5vw,16px)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(16px,3vw,24px)]">
        <div className="flex flex-col gap-2">
          <label htmlFor="business_name" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">
            Business Name *
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            value={formData.business_name}
            onChange={handleInputChange}
            className="p-[clamp(12px,2vw,16px)] min-h-[48px] rounded-lg border border-slate-300 text-[clamp(14px,1.5vw,16px)] focus:ring-2 focus:ring-slate-900 outline-none"
            aria-label="Business Name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="gst_number" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">
            GST Number
          </label>
          <input
            id="gst_number"
            name="gst_number"
            type="text"
            value={formData.gst_number}
            onChange={handleInputChange}
            className="p-[clamp(12px,2vw,16px)] min-h-[48px] rounded-lg border border-slate-300 text-[clamp(14px,1.5vw,16px)] focus:ring-2 focus:ring-slate-900 outline-none"
            aria-label="GST Number"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="address" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">
            Business Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
            className="p-[clamp(12px,2vw,16px)] rounded-lg border border-slate-300 text-[clamp(14px,1.5vw,16px)] focus:ring-2 focus:ring-slate-900 outline-none"
            aria-label="Business Address"
          />
        </div>

        <div className="border-t border-slate-200 my-[clamp(16px,3vw,32px)] pt-[clamp(16px,3vw,32px)]">
          <h2 className="text-[clamp(18px,3vw,24px)] font-semibold text-slate-900 mb-[clamp(8px,2vw,16px)]">
            Verification Documents
          </h2>
          <p className="text-[clamp(12px,1.5vw,14px)] text-slate-500 mb-[clamp(16px,3vw,24px)]">
            Accepted formats: PDF, JPG, PNG. Max size: 5MB per file.
          </p>

          <div className="flex flex-col gap-[clamp(16px,3vw,24px)]">
            <div className="flex flex-col gap-2">
              <label htmlFor="doc_pan" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">PAN Card</label>
              <input
                id="doc_pan"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'pan')}
                className="min-h-[48px] pt-2 text-[clamp(14px,1.5vw,16px)]"
                aria-label="Upload PAN Card"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="doc_trade" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">Trade Licence</label>
              <input
                id="doc_trade"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'trade_licence')}
                className="min-h-[48px] pt-2 text-[clamp(14px,1.5vw,16px)]"
                aria-label="Upload Trade Licence"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="doc_gst" className="text-[clamp(14px,1.5vw,16px)] font-semibold text-slate-800">GST Certificate</label>
              <input
                id="doc_gst"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'gst')}
                className="min-h-[48px] pt-2 text-[clamp(14px,1.5vw,16px)]"
                aria-label="Upload GST Certificate"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] bg-slate-900 text-white font-semibold text-[clamp(14px,1.5vw,16px)] rounded-lg mt-[clamp(16px,3vw,24px)] hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Submit Application"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </main>
  )
}
