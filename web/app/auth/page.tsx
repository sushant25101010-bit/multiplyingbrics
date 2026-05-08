"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Basic Indian phone validation
      const cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.length !== 10) throw new Error('Enter a valid 10-digit phone number')

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${cleanPhone}` })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')

      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${cleanPhone}`, token })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Invalid OTP')

      router.push(redirectPath)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-[clamp(16px,5vw,48px)] bg-slate-50">
      <div className="w-full max-w-[clamp(320px,90vw,420px)] bg-white p-[clamp(24px,6vw,40px)] rounded-3xl shadow-xl shadow-slate-200/50">
        <header className="text-center mb-8">
          <h1 className="text-[clamp(24px,4vw,32px)] font-black text-slate-900 tracking-tight">
            Multiplying Brics
          </h1>
          <p className="text-slate-500 mt-2 text-[clamp(14px,1.5vw,16px)]">
            {step === 'phone' ? 'Login or create your account' : 'Enter the code sent to your phone'}
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-[clamp(16px,1.5vw,18px)] focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                  required
                  aria-label="Phone Number"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 min-h-[48px] bg-slate-900 text-white font-black text-[clamp(15px,1.5vw,16px)] rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-slate-900/20"
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-xs font-bold uppercase tracking-widest text-slate-400">Verification Code</label>
              <input
                id="otp"
                type="text"
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-4 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-black tracking-[0.5em] focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                required
                aria-label="Enter OTP"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 min-h-[48px] bg-slate-900 text-white font-black text-[clamp(15px,1.5vw,16px)] rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-slate-900/20"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <footer className="mt-12 text-center">
          <p className="text-[clamp(11px,1.2vw,12px)] text-slate-400 leading-relaxed">
            By continuing, you agree to Multiplying Brics' <br />
            <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </footer>
      </div>
    </main>
  )
}
