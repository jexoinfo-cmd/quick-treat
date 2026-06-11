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
  speciality: string
  degree: string
  experience: string
  consultation_fee: string
  about: string
}

export default function DoctorProfile() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    speciality: '',
    degree: '',
    experience: '',
    consultation_fee: '',
    about: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        // Get doctor info
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', profile.id)
          .single()

        if (doctorError) throw doctorError

        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
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

    fetchProfile()
  }, [profile?.id, profile?.name, profile?.email, profile?.phone])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone
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
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Speciality</label>
              <input
                type="text"
                value={formData.speciality}
                onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Degree</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
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