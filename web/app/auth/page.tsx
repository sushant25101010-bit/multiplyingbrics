"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, User, Phone, Building, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const [role, setRole] = useState<'buyer' | 'vendor' | 'admin'>('buyer')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  
  // Input fields state
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [adminName, setAdminName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    setInfoMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}&role=${role}`
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfoMessage(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          businessName: role === 'vendor' ? businessName : undefined,
          adminName: role === 'admin' ? adminName : undefined,
          phone,
          email,
          password,
          confirmPassword
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      if (data.requiresVerification) {
        setInfoMessage(data.message || 'Please check your email to verify your account.')
      } else {
        // Success
        if (redirectPath === '/') {
          if (role === 'admin') {
            router.push('/admin/vendors')
          } else if (role === 'vendor') {
            router.push('/vendor/dashboard')
          } else {
            router.push('/account')
          }
        } else {
          router.push(redirectPath)
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      // Redirect dynamically based on role returned from login route
      if (redirectPath === '/') {
        if (data.role === 'admin') {
          router.push('/admin/vendors')
        } else if (data.role === 'vendor') {
          router.push('/vendor/dashboard')
        } else {
          router.push('/account')
        }
      } else {
        router.push(redirectPath)
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 dark:bg-[#030712] transition-colors duration-300 relative overflow-hidden radial-glow">
      <div className="absolute top-[-100px] left-[30%] w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[32px] shadow-2xl dark:shadow-slate-950/80 border border-slate-200/60 dark:border-slate-800/80 relative z-10"
      >
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Multiplying <span className="text-amber-500">Brics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {mode === 'login' 
              ? `Welcome back! Log in as ${role === 'buyer' ? 'User' : role === 'vendor' ? 'Vendor' : 'Admin'}` 
              : `Create your ${role === 'buyer' ? 'User' : role === 'vendor' ? 'Vendor' : 'Admin'} account`}
          </p>
        </header>

        {/* Role Selection Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl mb-4 border border-slate-200/40 dark:border-slate-800/30">
          {(['buyer', 'vendor', 'admin'] as const).map((r) => {
            const isActive = role === r
            const label = r === 'buyer' ? 'User' : r === 'vendor' ? 'Vendor' : 'Admin'
            return (
              <button 
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(null); setInfoMessage(null); }}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900 text-slate-955 dark:text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Tab Switch (Log In / Sign Up) */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-200/40 dark:border-slate-800/30">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all duration-300 ${
              mode === 'login' 
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Log In
          </button>
          <button 
            type="button"
            onClick={() => { setMode('signup'); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all duration-300 ${
              mode === 'signup' 
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Messages */}
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

          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-650 dark:text-emerald-400 text-xs font-semibold rounded-xl"
            >
              {infoMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form 
                key="login-form"
                onSubmit={handleLogin} 
                className="space-y-5"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Email Address
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Mail size={16} className="absolute left-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="pass" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Password
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Lock size={16} className="absolute left-4 text-slate-400" />
                    <input
                      id="pass"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white dark:text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Log In</span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form 
                key="signup-form"
                onSubmit={handleSignUp} 
                className="space-y-4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Business Name Field (Vendor only) */}
                {role === 'vendor' && (
                  <div className="space-y-1.5">
                    <label htmlFor="businessName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Business Name
                    </label>
                    <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                      <Building size={14} className="absolute left-4 text-slate-400" />
                      <input
                        id="businessName"
                        type="text"
                        placeholder="Brickworks Pvt Ltd"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Admin Name Field (Admin only) */}
                {role === 'admin' && (
                  <div className="space-y-1.5">
                    <label htmlFor="adminName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Admin Name
                    </label>
                    <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                      <ShieldCheck size={14} className="absolute left-4 text-slate-400" />
                      <input
                        id="adminName"
                        type="text"
                        placeholder="Admin User"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="signupEmail" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Email Address
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Mail size={14} className="absolute left-4 text-slate-400" />
                    <input
                      id="signupEmail"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Phone Number
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Phone size={14} className="absolute left-4 text-slate-400" />
                    <span className="absolute left-10 font-bold text-sm text-slate-400 dark:text-slate-550">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-[4.5rem] pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="signupPass" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Password (Min 6 chars)
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Lock size={14} className="absolute left-4 text-slate-400" />
                    <input
                      id="signupPass"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPass" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500/50 transition-all duration-200">
                    <Lock size={14} className="absolute left-4 text-slate-400" />
                    <input
                      id="confirmPass"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm placeholder:text-slate-350 dark:placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white dark:text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Google OAuth Button */}
        <>
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <span className="relative px-4 text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900">
              or continue with
            </span>
          </div>

          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </motion.button>
        </>

        <footer className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
            By continuing, you agree to Multiplying Brics' <br />
            <span className="underline hover:text-slate-650 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-slate-650 cursor-pointer">Privacy Policy</span>.
          </p>
        </footer>
      </motion.div>
    </main>
  )
}
