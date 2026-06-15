'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

// Define proper types
interface DoctorProfile {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  about_en: string
  profile: {
    name: string
  }
}

// Raw response type from Supabase
interface RawDoctor {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  about_en: string
  profile: { name: string }[]
}

function DoctorProfileContent() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuthStore()
  const doctorId = params?.id as string

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            speciality,
            degree,
            experience,
            consultation_fee,
            rating,
            about_en,
            profile:profiles(name)
          `)
          .eq('id', doctorId)
          .single()

        if (error) throw error
        
        // Transform the data to match DoctorProfile type
        const rawData = data as RawDoctor
        const transformedDoctor: DoctorProfile = {
          id: rawData.id,
          speciality: rawData.speciality || 'General',
          degree: rawData.degree || 'MBBS',
          experience: rawData.experience || 0,
          consultation_fee: rawData.consultation_fee || 0,
          rating: rawData.rating || 5,
          about_en: rawData.about_en || '',
          profile: {
            name: rawData.profile?.[0]?.name || 'Doctor'
          }
        }
        
        setDoctor(transformedDoctor)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load doctor')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  const bookAppointment = () => {
    if (!profile) {
      toast.error('Please login')
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
        <button onClick={() => router.push('/patient/doctors')} className="mt-4 text-primary hover:underline">
          Back to Doctors
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-teal-light rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-teal-dark">{doctor.profile.name}</h1>
            <p className="text-primary">{doctor.speciality}</p>
            <p className="text-text-grey text-sm">{doctor.degree}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">৳{doctor.consultation_fee}</p>
            <p className="text-xs text-text-grey">Consultation Fee</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{doctor.experience}+</p>
            <p className="text-xs text-text-grey">Years Exp.</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-text-grey">{doctor.about_en || 'Experienced doctor'}</p>
        </div>

        <button
          onClick={bookAppointment}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark"
        >
          Book Appointment
        </button>
      </div>
    </div>
  )
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <DoctorProfileContent />
    </Suspense>
  )
}