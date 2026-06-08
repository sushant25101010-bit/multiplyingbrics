"use client"

import { useState } from 'react'
import { MapPin, Mail, Copy, Check, ExternalLink, Send } from 'lucide-react'

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const address = "DS-MAX Senate, Begur, Bengaluru, Karnataka 560114"
  const mapUrl = "https://www.google.com/maps/place/DS-MAX+Senate/@12.8687516,77.6319736,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae6b001ccb358d:0x9f480b8aece20d41!8m2!3d12.8687464!4d77.6345485!16s%2Fg%2F11mdsxr97k"

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] relative flex flex-col items-center py-16 px-4">
      {/* Background glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full z-10 flex flex-col items-center">
        
        {/* Top Centered Header Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-6">
            Let's build <br className="hidden md:block" />
            <span className="text-amber-500">something great.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-8">
            Have questions about our platform or need help finding the right vendor? We are here to help. Reach out to us or drop by our office.
          </p>

          <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-900/50 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800">
            <Mail size={20} className="text-amber-500" />
            <span>support@multiplyingbrics.com</span>
          </div>
        </div>

        {/* Bottom 2-Column Grid */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start w-full">
          
          {/* Left Column: Contact Form */}
          <div className="group flex flex-col bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-amber-500/5 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 h-full w-full">
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white mb-3 tracking-tight">Drop us a message</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
              Fill out the quick form below and our team will get back to you within 24 hours.
            </p>
            
            <form 
              className="flex flex-col gap-8" 
              action="https://formsubmit.co/sushant2510@yahoo.com" 
              method="POST"
            >
              <input type="hidden" name="_subject" value="New Contact Form Submission from MultiplyingBrics" />
              <input type="hidden" name="_captcha" value="false" />
              
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold text-xs md:text-sm uppercase tracking-wider">Your Email</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  placeholder="hello@company.com"
                  className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <label htmlFor="message" className="text-slate-700 dark:text-slate-300 font-bold text-xs md:text-sm uppercase tracking-wider">Project Details / Message</label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  placeholder="Tell us about your project requirements or what you are building..."
                  rows={4}
                  className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="mt-2 w-full py-4 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Right Column: Office Card */}
          <div className="group bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-amber-500/5 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-2 transition-all duration-500 w-full relative overflow-hidden mt-0 md:mt-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110">
              <MapPin className="text-amber-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-2">Our Office</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed max-w-[280px]">
              {address}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                <span>View on Google Maps</span>
              </a>
              
              <button 
                onClick={handleCopy}
                className="px-6 py-4 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
