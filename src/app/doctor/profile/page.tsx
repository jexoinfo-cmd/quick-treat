'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

// Define types
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
}

// Specialities list
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
  'General Physician (সাধারণ চিকিৎসক)',
  'Hepatologist (লিভার বিশেষজ্ঞ)',
  'Infectious Disease Specialist (সংক্রামক রোগ বিশেষজ্ঞ)',
  'Neonatologist (নবজাতক বিশেষজ্ঞ)',
  'Neurosurgeon (নিউরোসার্জন)',
  'Plastic Surgeon (প্লাস্টিক সার্জন)',
  'Cardiothoracic Surgeon (হার্ট ও বুকের সার্জন)'
]

// Degrees list
const degrees = [
  'MBBS',
  'MD (Medicine)',
  'MD (Pediatrics)',
  'MD (Dermatology)',
  'MD (Psychiatry)',
  'MD (Cardiology)',
  'MD (Neurology)',
  'MS (General Surgery)',
  'MS (Orthopedics)',
  'MS (ENT)',
  'MS (Ophthalmology)',
  'MS (Obstetrics & Gynecology)',
  'FCPS (Medicine)',
  'FCPS (Surgery)',
  'FCPS (Pediatrics)',
  'FCPS (Gynecology)',
  'BDS',
  'MDS',
  'PhD',
  'FRCS',
  'MRCP',
  'Diploma in Child Health',
  'Diploma in Dermatology',
  'CCD (Cardiology)',
  'MCPS',
  'M Phil',
  'BAMS (Ayurveda)',
  'BHMS (Homoeopathy)',
  'DNB (Diplomate of National Board)',
  'MCh (Master of Chirurgiae)',
  'DM (Doctor of Medicine)',
  'MPH (Master of Public Health)'
]

export default function DoctorProfile() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    speciality: '',
    degree: '',
    experience: '',
    consultation_fee: '',
    about: ''
  })

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch profile data directly from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, email, phone, whatsapp')
          .eq('id', profile.id)
          .single()

        if (profileError) throw profileError

        // Get doctor info
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', profile.id)
          .single()

        if (doctorError) throw doctorError

        setFormData({
          name: profileData?.name || '',
          email: profileData?.email || '',
          phone: profileData?.phone || '',
          whatsapp: profileData?.whatsapp || '',
          speciality: doctor?.speciality || '',
          degree: doctor?.degree || '',
          experience: doctor?.experience?.toString() || '',
          consultation_fee: doctor?.consultation_fee?.toString() || '',
          about: doctor?.about_en || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profile?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp
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

      toast.success('Profile updated successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
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
      <h1 className="text-3xl font-bold text-text-dark mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speciality</label>
              <select
                value={formData.speciality}
                onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Speciality</option>
                {specialities.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Degree</label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Degree</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Consultation Fee (৳)</label>
              <input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">About (English)</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write about your experience, speciality, etc."
            />
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}