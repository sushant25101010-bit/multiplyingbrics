"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@/lib/types'

interface HeaderProps {
  user: {
    role?: UserRole
    full_name?: string | null
  } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const role = user?.role || 'buyer'

  const navLinks = [
    { name: 'Marketplace', href: '/' },
    { name: 'Search', href: '/search' },
  ]

  // Role-based links
  const accountLinks = {
    buyer: { name: 'My Account', href: '/account' },
    vendor: { name: 'Dashboard', href: '/vendor/dashboard' },
    admin: { name: 'Admin', href: '/admin/vendors' },
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-[clamp(16px,5vw,48px)]">
      <div className="max-w-[clamp(320px,95vw,1200px)] mx-auto h-[clamp(64px,8vw,80px)] flex items-center justify-between">
        <div className="flex items-center gap-[clamp(24px,4vw,48px)]">
          <Link href="/" className="text-[clamp(18px,2vw,22px)] font-black text-slate-900 tracking-tighter">
            Multiplying<span className="text-slate-400">Brics</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  pathname === link.href ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href={accountLinks[role as keyof typeof accountLinks].href}
              className="px-6 py-2.5 min-h-[48px] bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <span>{accountLinks[role as keyof typeof accountLinks].name}</span>
              <span className="opacity-50 hidden sm:inline">→</span>
            </Link>
          ) : (
            <Link 
              href="/auth"
              className="px-6 py-2.5 min-h-[48px] bg-slate-100 text-slate-900 rounded-xl text-sm font-black hover:bg-slate-200 transition-all flex items-center"
            >
              Login
            </Link>
          )}
          
          {/* Mobile Menu Icon (Placeholder for functionality) */}
          <button className="md:hidden p-2 text-slate-900" aria-label="Open Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 8h16M4 16h16"/></svg>
          </button>
        </div>
      </div>
    </header>
  )
}
