'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<string>
  currentImage?: string
  label?: string
}

export default function ImageUpload({ onImageUpload, currentImage, label = 'Profile Picture' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || '')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('দয়া করে একটি ইমেজ ফাইল আপলোড করুন')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('ইমেজের সাইজ ২MB এর কম হতে হবে')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await onImageUpload(file)
      setPreview(url)
      toast.success('ইমেজ সফলভাবে আপলোড হয়েছে')
    } catch {
      // error প্যারামিটার ব্যবহার না করায় শুধু catch ব্লক রাখা হলো
      toast.error('ইমেজ আপলোড করতে সমস্যা হচ্ছে')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            <Image
              src={preview}
              alt="প্রিভিউ"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">👨‍⚕️</span>
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-dark transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </label>
      </div>
      <p className="text-xs text-text-grey">{label}</p>
    </div>
  )
}