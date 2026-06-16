'use client'

import { useState, useEffect } from 'react'
// useRouter ইমপোর্ট সরিয়ে দেওয়া হলো কারণ ব্যবহার করা হচ্ছে না
// import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  speciality: string
  degree: string
  experience: string
  consultation_fee: string
  about: string
  profile_image: string
}

const specialities = [
  'Cardiologist (হৃদরোগ বিশেষজ্ঞ)',
  'Neurologist (স্নায়ুরোগ বিশেষজ্ঞ)',
  'Orthopedic (হাড় ও জয়েন্ট)',
  'Pediatrician (শিশু বিশেষজ্ঞ)',
  'Gynecologist (স্ত্রীরোগ বিশেষজ্ঞ)',
  'Dermatologist (চর্ম বিশেষজ্ঞ)',
  'Psychiatrist (মানসিক রোগ বিশেষজ্ঞ)',
  'ENT Specialist (কান-নাক-গলা)',
  'Ophthalmologist (চক্ষু বিশেষজ্ঞ)',
  'Dentist (দন্ত বিশেষজ্ঞ)',
  'Urologist (মূত্ররোগ বিশেষজ্ঞ)',
  'Gastroenterologist (গ্যাস্ট্রো বিশেষজ্ঞ)',
  'Endocrinologist (এন্ডোক্রাইনোলজিস্ট)',
  'Nephrologist (কিডনি বিশেষজ্ঞ)',
  'Oncologist (ক্যান্সার বিশেষজ্ঞ)',
  'Rheumatologist (বাত ও জয়েন্ট বিশেষজ্ঞ)',
  'Pulmonologist (ফুসফুস বিশেষজ্ঞ)',
  'Hematologist (রক্ত বিশেষজ্ঞ)',
  'Radiologist (রেডিওলজিস্ট)',
  'Anesthesiologist (এনেস্থেসিওলজিস্ট)',
  'General Physician (সাধারণ চিকিৎসক)'
]

const degrees = [
  'MBBS', 'MD (Medicine)', 'MD (Pediatrics)', 'MD (Dermatology)',
  'MD (Psychiatry)', 'MD (Cardiology)', 'MD (Neurology)',
  'MS (General Surgery)', 'MS (Orthopedics)', 'MS (ENT)',
  'MS (Ophthalmology)', 'MS (Obstetrics & Gynecology)',
  'FCPS (Medicine)', 'FCPS (Surgery)', 'FCPS (Pediatrics)',
  'FCPS (Gynecology)', 'BDS', 'MDS', 'PhD', 'FRCS', 'MRCP'
]

export default function DoctorProfile() {
  const { profile } = useAuthStore()
  // router ভেরিয়েবলটি সরিয়ে দেওয়া হলো
  // const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    speciality: '',
    degree: '',
    experience: '',
    consultation_fee: '',
    about: '',
    profile_image: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single()

        // Get doctor info
        const { data: doctor } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', profile.id)
          .single()

        setFormData({
          name: profileData?.name || '',
          email: profileData?.email || '',
          phone: profileData?.phone || '',
          whatsapp: profileData?.whatsapp || '',
          speciality: doctor?.speciality || '',
          degree: doctor?.degree || '',
          experience: doctor?.experience?.toString() || '',
          consultation_fee: doctor?.consultation_fee?.toString() || '',
          about: doctor?.about_en || '',
          profile_image: profileData?.profile_image || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('প্রোফাইল লোড করতে সমস্যা হচ্ছে')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profile?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('দয়া করে একটি ইমেজ ফাইল আপলোড করুন')
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('ইমেজের সাইজ ২MB এর কম হতে হবে')
      return
    }

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}.${fileExt}`
      const filePath = `${profile?.id}/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('doctor-profiles')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-profiles')
        .getPublicUrl(filePath)

      // Update profile with image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', profile?.id)

      if (updateError) throw updateError

      setFormData({ ...formData, profile_image: publicUrl })
      toast.success('প্রোফাইল পিকচার আপডেট হয়েছে!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('ইমেজ আপলোড করতে সমস্যা হচ্ছে')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          profile_image: formData.profile_image
        })
        .eq('id', profile?.id)

      if (profileError) throw profileError

      // Update doctor
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          speciality: formData.speciality,
          degree: formData.degree,
          experience: parseInt(formData.experience) || 0,
          consultation_fee: parseFloat(formData.consultation_fee) || 0,
          about_en: formData.about
        })
        .eq('user_id', profile?.id)

      if (doctorError) throw doctorError

      toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে!')
      window.location.reload()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('প্রোফাইল আপডেট করতে সমস্যা হচ্ছে')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">আমার প্রোফাইল</h1>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-border">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-teal-light flex items-center justify-center">
                {formData.profile_image ? (
                  <Image
                    src={formData.profile_image}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👨‍⚕️</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-teal-dark">{formData.name}</h2>
              <p className="text-text-grey">{formData.email}</p>
              <p className="text-sm text-primary mt-1">প্রোফাইল পিকচার আপডেট করতে ক্যামেরা আইকনে ক্লিক করুন</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">পুরো নাম</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ইমেইল</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ফোন নম্বর</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">হোয়াটসঅ্যাপ নম্বর</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">বিশেষত্ব</label>
              <select
                value={formData.speciality}
                onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">বিশেষত্ব নির্বাচন করুন</option>
                {specialities.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ডিগ্রী</label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">ডিগ্রী নির্বাচন করুন</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">অভিজ্ঞতা (বছর)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">পরামর্শ ফি (৳)</label>
              <input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">পরিচয় (ইংরেজি)</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="আপনার অভিজ্ঞতা, বিশেষত্ব ইত্যাদি সম্পর্কে লিখুন"
            />
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}