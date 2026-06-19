'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

// Supabase response types
interface RawDoctor {
  id: string
  user_id: string
  speciality: string | null
  degree: string | null
  experience: number | null
  consultation_fee: number | null
  is_available: boolean | null
  profile: RawProfile[] | RawProfile | null
}

interface RawProfile {
  name: string
  email: string
  phone: string
}

// Display doctor type
interface DisplayDoctor {
  id: string
  user_id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  is_available: boolean
  name: string
  email: string
  phone: string
}

interface FormData {
  name: string
  email: string
  phone: string
  speciality: string
  degree: string
  experience: string
  consultation_fee: string
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
  'Anesthesiologist (এনেস্থেসিওলজিস্ট)'
]

// Degrees list
const degrees = [
  'MBBS',
  'MD (Medicine)',
  'MD (Pediatrics)',
  'MD (Dermatology)',
  'MD (Psychiatry)',
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
  'M Phil'
]

export default function HospitalDoctors() {
  const { profile } = useAuthStore()
  const [doctors, setDoctors] = useState<DisplayDoctor[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    speciality: '',
    degree: '',
    experience: '',
    consultation_fee: ''
  })

  // Load doctors when component mounts or profile changes
  useEffect(() => {
    const loadDoctors = async () => {
      if (!profile?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            user_id,
            speciality,
            degree,
            experience,
            consultation_fee,
            is_available,
            profile:profiles(name, email, phone)
          `)
          .eq('hospital_id', profile.id)

        if (error) throw error
        
        // Helper function to extract profile data safely
        const extractProfileData = (profileData: RawProfile[] | RawProfile | null): RawProfile => {
          if (!profileData) {
            return { name: 'Unknown', email: '', phone: '' }
          }
          if (Array.isArray(profileData)) {
            return profileData[0] || { name: 'Unknown', email: '', phone: '' }
          }
          return profileData
        }

        // Transform data
        const rawData = (data || []) as RawDoctor[]
        const transformedDoctors: DisplayDoctor[] = rawData.map((doc) => {
          const profileData = extractProfileData(doc.profile)
          
          return {
            id: doc.id,
            user_id: doc.user_id,
            speciality: doc.speciality || 'General',
            degree: doc.degree || 'N/A',
            experience: doc.experience || 0,
            consultation_fee: doc.consultation_fee || 0,
            is_available: doc.is_available || false,
            name: profileData.name || 'Unknown',
            email: profileData.email || '',
            phone: profileData.phone || ''
          }
        })
        
        setDoctors(transformedDoctors)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        toast.error('Failed to load doctors')
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctors()
  }, [profile?.id])

  const handleAddDoctor = async () => {
    if (!formData.name || !formData.email || !formData.speciality) {
      toast.error('Please fill all required fields')
      return
    }

    setIsLoading(true)
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp123456',
        options: {
          data: {
            name: formData.name,
            role: 'doctor'
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            role: 'doctor'
          })

        if (profileError) throw profileError

        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            user_id: authData.user.id,
            speciality: formData.speciality,
            degree: formData.degree,
            experience: parseInt(formData.experience) || 0,
            consultation_fee: parseFloat(formData.consultation_fee) || 0,
            hospital_id: profile?.id
          })

        if (doctorError) throw doctorError

        toast.success('Doctor added successfully')
        setShowModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          speciality: '',
          degree: '',
          experience: '',
          consultation_fee: ''
        })
        
        window.location.reload()
      }
    } catch (err) {
      console.error('Error adding doctor:', err)
      toast.error('Failed to add doctor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDoctor = async (doctorId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return
    
    setIsLoading(true)
    
    try {
      const { error: doctorError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId)

      if (doctorError) throw doctorError

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      toast.success('Doctor removed successfully')
      window.location.reload()
    } catch (err) {
      console.error('Error removing doctor:', err)
      toast.error('Failed to remove doctor')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-text-dark">Doctor Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          + Add New Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                doctor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {doctor.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <p className="text-primary text-sm">{doctor.speciality}</p>
            <p className="text-text-grey text-sm mt-2">{doctor.degree}</p>
            <p className="text-text-grey text-xs mt-1">{doctor.email}</p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-grey">Experience</span>
                <span className="font-medium">{doctor.experience} years</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-text-grey">Fee</span>
                <span className="font-medium">৳{doctor.consultation_fee}</span>
              </div>
            </div>
            <button
              onClick={() => handleRemoveDoctor(doctor.id, doctor.user_id)}
              className="mt-4 w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm"
            >
              Remove Doctor
            </button>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !isLoading && (
        <div className="text-center py-12 text-text-grey">
          No doctors found. Click &quot;Add New Doctor&quot; to get started.
        </div>
      )}

      {/* Add Doctor Modal with Dropdowns */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Doctor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Dr. Md. Rahman"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="01712-345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Speciality *</label>
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
                <label className="block text-sm font-medium mb-1">Degree *</label>
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
                  placeholder="5"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Consultation Fee (৳)</label>
                <input
                  type="number"
                  placeholder="800"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddDoctor}
                disabled={isLoading}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Doctor'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}