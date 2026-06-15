'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Doctor {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  about_en: string
  profiles: {
    name: string
    email: string
    phone: string
  }
}

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuthStore()
  const doctorId = params?.id as string
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  // Load doctor data - function inside useEffect
  useEffect(() => {
    const loadDoctor = async () => {
      if (!doctorId) return
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*, profiles(name, email, phone)')
          .eq('id', doctorId)
          .single()
        
        if (error) throw error
        setDoctor(data as Doctor)
      } catch (err) {
        console.error(err)
        toast.error('Doctor not found')
      } finally {
        setLoading(false)
      }
    }

    loadDoctor()
  }, [doctorId])

  function bookAppointment() {
    if (!profile) {
      toast.error('Please login first')
      router.push('/login')
      return
    }
    router.push(`/patient/book-appointment?doctorId=${doctorId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">Doctor not found</p>
        <button 
          onClick={() => router.push('/patient/doctors')} 
          className="mt-4 text-primary hover:underline"
        >
          ← Back to Doctors
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">{doctor.profiles?.name || 'Doctor'}</h1>
            <p className="text-primary font-medium">{doctor.speciality || 'General'}</p>
            <p className="text-text-grey text-sm">{doctor.degree || 'MBBS'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">৳{doctor.consultation_fee || 500}</p>
            <p className="text-xs text-text-grey">Consultation Fee</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{doctor.experience || 5}+</p>
            <p className="text-xs text-text-grey">Years Exp.</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-text-dark mb-2">About</h3>
          <p className="text-text-grey">{doctor.about_en || 'Experienced doctor specializing in patient care.'}</p>
        </div>

        <button 
          onClick={bookAppointment}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition"
        >
          Book Appointment
        </button>
      </div>
    </div>
  )
}