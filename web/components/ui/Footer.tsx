import Link from 'next/link'
import { Linkedin, Instagram, MessageCircle, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-[#060b17] border-t border-slate-200 dark:border-slate-800/50 pt-16 pb-8 mt-auto">
      <div className="w-full px-6 sm:px-12 lg:px-24 xl:px-32">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Trust Statement */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter text-slate-950 dark:text-white">
                Multiplying<span className="text-amber-500">Brics</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Connecting buyers and vendors across India's construction materials marketplace.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#0077B5] hover:text-white dark:hover:bg-[#0077B5] dark:hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20">
                <Linkedin size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#E1306C] hover:text-white dark:hover:bg-[#E1306C] dark:hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-slate-950 dark:text-white uppercase tracking-wider text-sm">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Contact Us</Link></li>
              <li><Link href="/products" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Our Products</Link></li>
              <li><span className="text-slate-400 dark:text-slate-600 font-medium text-sm cursor-not-allowed">Careers <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full ml-1">Coming Soon</span></span></li>
              <li><span className="text-slate-400 dark:text-slate-600 font-medium text-sm cursor-not-allowed">Blog <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full ml-1">Coming Soon</span></span></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-slate-950 dark:text-white uppercase tracking-wider text-sm">Marketplace</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/vendors" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Find Vendors</Link></li>
              <li><Link href="/products" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Browse Materials</Link></li>
              <li><Link href="/vendor/register" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Become a Vendor</Link></li>
              <li><Link href="/vendor/register" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Vendor Registration</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-slate-950 dark:text-white uppercase tracking-wider text-sm">Support</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/help" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Help Center</Link></li>
              <li><Link href="/faqs" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">FAQs</Link></li>
              <li><Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors font-medium text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Contact Info & Bottom Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 pt-8 border-t border-slate-200 dark:border-slate-800/50">
          
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full lg:w-auto">
            <div className="flex items-start gap-3">
              <MapPin className="text-amber-500 shrink-0 mt-1" size={18} />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                DS-MAX Senate,<br />Begur, Bengaluru,<br />Karnataka 560114
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="text-amber-500 shrink-0 mt-1" size={18} />
              <div className="flex flex-col gap-1">
                <a href="mailto:support@multiplyingbrics.com" className="text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-amber-500 dark:hover:text-amber-500 transition-colors">
                  support@multiplyingbrics.com
                </a>
              </div>
            </div>
          </div>

          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium w-full lg:w-auto text-center lg:text-right">
            &copy; 2026 Multiplying Brics. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
