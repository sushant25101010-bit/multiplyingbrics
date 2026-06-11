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
              <a href="https://wa.me/918337909958?text=Hi%20Multiplying%20Brics%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
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
              {/* <li><span className="text-slate-400 dark:text-slate-600 font-medium text-sm cursor-not-allowed">Blog <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full ml-1">Coming Soon</span></span></li> */}
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
