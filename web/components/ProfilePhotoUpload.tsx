"use client"

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, User as UserIcon } from 'lucide-react'
import Image from 'next/image'

interface ProfilePhotoUploadProps {
  userId: string
  initialAvatarUrl?: string | null
  googleAvatarUrl?: string | null
  onUploadSuccess?: (newUrl: string | null) => void
}

export function ProfilePhotoUpload({ userId, initialAvatarUrl, googleAvatarUrl, onUploadSuccess }: ProfilePhotoUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const currentImage = avatarUrl || googleAvatarUrl

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}-${Math.random()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update users table via API
      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      setAvatarUrl(publicUrl)
      if (onUploadSuccess) onUploadSuccess(publicUrl)
      
    } catch (error: any) {
      alert(error.message || 'Error uploading avatar!')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    try {
      setUploading(true)
      
      // Update users table via API to null
      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null }),
      })

      if (!res.ok) {
        throw new Error('Failed to remove profile photo')
      }

      setAvatarUrl(null)
      if (onUploadSuccess) onUploadSuccess(null)
      
    } catch (error: any) {
      alert(error.message || 'Error removing avatar!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon size={40} className="text-slate-400 dark:text-slate-500" />
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center sm:items-start gap-2">
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="single"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            ref={fileInputRef}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            <Camera size={16} />
            <span>{currentImage ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
          
          {avatarUrl && (
            <button 
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl transition-all"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          JPG, GIF or PNG. Max size of 2MB.
        </p>
      </div>
    </div>
  )
}
