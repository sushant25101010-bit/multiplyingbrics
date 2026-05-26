"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@/lib/types'
import { useTheme } from '@/components/ui/theme-provider'
import { Sun, Moon, Menu, X, ArrowRight, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  user: {
    role?: UserRole
    full_name?: string | null
  } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const role = user?.role || 'buyer'

  const navLinks = [
    { name: 'Marketplace', href: '/' },
    { name: 'Search', href: '/search' },
  ]

  const accountLinks = {
    buyer: { name: 'My Account', href: '/account' },
    vendor: { name: 'Dashboard', href: '/vendor/dashboard' },
    admin: { name: 'Admin Portal', href: '/admin/vendors' },
  }

  const currentAccountLink = accountLinks[role as keyof typeof accountLinks]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/40 bg-white/75 dark:bg-[#030712]/75 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-8 sm:gap-12">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
              Multiplying<span className="text-amber-500 group-hover:text-amber-600 transition-colors">Brics</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative px-1 py-2 text-sm font-semibold transition-colors duration-200 text-slate-650 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white"
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ y: 20, rotate: 90, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  exit={{ y: -20, rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun size={18} className="text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ y: 20, rotate: -90, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  exit={{ y: -20, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon size={18} className="text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Account Button (Desktop) */}
          <div className="hidden sm:block">
            {user ? (
              <Link 
                href={currentAccountLink.href}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-white/5"
              >
                <UserIcon size={16} />
                <span>{currentAccountLink.name}</span>
                <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/auth"
                className="px-6 py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-[#030712] overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-base font-bold transition-colors ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                        : 'text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              
              <hr className="border-slate-100 dark:border-slate-800 my-2" />

              {/* Login/Account for Mobile */}
              {user ? (
                <Link 
                  href={currentAccountLink.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-base font-bold"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon size={18} />
                    <span>{currentAccountLink.name}</span>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-base font-bold"
                >
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
