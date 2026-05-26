"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Phone, ShieldCheck, ArrowLeft, Key } from 'lucide-react'

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
    <main className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50/50 dark:bg-[#030712] transition-colors duration-300 relative overflow-hidden radial-glow">
      <div className="absolute top-[-100px] left-[30%] w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[28px] shadow-2xl dark:shadow-slate-950/80 border border-slate-200/50 dark:border-slate-800/60 relative z-10"
      >
        <header className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-550/10 mb-4">
            {step === 'phone' ? (
              <Phone className="text-amber-500" size={20} />
            ) : (
              <Key className="text-amber-500" size={20} />
            )}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Multiplying Brics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {step === 'phone' ? 'Login or create your account' : 'Enter the code sent to your phone'}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form 
                key="phone-step"
                onSubmit={handleSendOtp} 
                className="space-y-6"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 font-bold text-sm">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-400/5 outline-none transition-all text-sm"
                      required
                      aria-label="Phone Number"
                    />
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Get OTP</span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-step"
                onSubmit={handleVerifyOtp} 
                className="space-y-6"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-center text-xl font-bold tracking-[0.4em] text-slate-900 dark:text-white focus:ring-4 focus:ring-amber-550/10 dark:focus:ring-amber-400/5 outline-none transition-all"
                    required
                    aria-label="Enter OTP"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading || token.length !== 6}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </motion.button>
                
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>Change Phone Number</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-10 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
            By continuing, you agree to Multiplying Brics' <br />
            <span className="underline hover:text-slate-650 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-slate-650 cursor-pointer">Privacy Policy</span>.
          </p>
        </footer>
      </motion.div>
    </main>
  )
}
