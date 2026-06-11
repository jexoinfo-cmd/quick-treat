'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  fee: number
  symptoms?: string
  doctor_name: string
  doctor_speciality: string
}

interface RawAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  fee: number
  symptoms: string | null
  doctor_id: string
}

interface RawDoctor {
  id: string
  speciality: string
  profile: RawProfile[] | RawProfile
}

interface RawProfile {
  name: string
}

interface DoctorInfo {
  name: string
  speciality: string
}

export default function MyAppointments() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) return

      try {
        // First fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            fee,
            symptoms,
            doctor_id
          `)
          .eq('patient_id', profile.id)
          .order('appointment_date', { ascending: true })

        if (appointmentsError) throw appointmentsError

        if (!appointmentsData || appointmentsData.length === 0) {
          setAppointments([])
          setLoading(false)
          return
        }

        // Get unique doctor ids
        const doctorIds = [...new Set((appointmentsData as RawAppointment[]).map(apt => apt.doctor_id))]

        // Fetch doctors with their profiles
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select(`
            id,
            speciality,
            profile:profiles(name)
          `)
          .in('id', doctorIds)

        if (doctorsError) throw doctorsError

        // Create a map for quick lookup
        const doctorMap = new Map<string, DoctorInfo>()
        ;(doctorsData as RawDoctor[]).forEach((doctor) => {
          const profileData = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
          doctorMap.set(doctor.id, {
            name: profileData?.name || 'Unknown Doctor',
            speciality: doctor.speciality || 'General'
          })
        })

        // Merge data
        const mergedAppointments: Appointment[] = (appointmentsData as RawAppointment[]).map((apt) => {
          const doctor = doctorMap.get(apt.doctor_id) || { name: 'Unknown Doctor', speciality: 'General' }
          return {
            id: apt.id,
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time,
            status: apt.status,
            fee: apt.fee,
            symptoms: apt.symptoms || undefined,
            doctor_name: doctor.name,
            doctor_speciality: doctor.speciality
          }
        })

        setAppointments(mergedAppointments)
      } catch (error) {
        console.error('Failed to load appointments:', error)
        toast.error('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [profile?.id])

  const cancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error
      toast.success('Appointment cancelled')
      // Refresh appointments
      window.location.reload()
    } catch (error) {
      console.error('Failed to cancel:', error)
      toast.error('Failed to cancel appointment')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'pending_payment': return 'bg-orange-100 text-orange-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending_payment': return 'Pending Payment'
      default: return status
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-6">My Appointments</h1>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{apt.doctor_name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusText(apt.status)}
                  </span>
                </div>
                <p className="text-primary text-sm mb-2">{apt.doctor_speciality}</p>
                <div className="flex flex-wrap gap-4 text-sm text-text-grey">
                  <span>📅 {new Date(apt.appointment_date).toLocaleDateString()}</span>
                  <span>⏰ {apt.appointment_time}</span>
                  <span>💰 ৳{apt.fee}</span>
                </div>
                {apt.symptoms && (
                  <p className="mt-3 text-sm text-text-grey">
                    <span className="font-medium">Symptoms:</span> {apt.symptoms}
                  </p>
                )}
              </div>
              {(apt.status === 'pending' || apt.status === 'pending_payment') && (
                <button
                  onClick={() => cancelAppointment(apt.id)}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition h-fit"
                >
                  Cancel
                </button>
              )}
              {apt.status === 'pending_payment' && (
                <button
                  onClick={() => router.push(`/patient/payment?appointment_id=${apt.id}`)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition h-fit"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <p className="text-text-grey">No appointments found</p>
            <button
              onClick={() => router.push('/patient/doctors')}
              className="mt-4 text-primary hover:underline"
            >
              Book an Appointment →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}