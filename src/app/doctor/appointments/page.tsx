'use client'

import { useState, useEffect } from 'react'
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
  patient_name?: string
  patient_phone?: string
}

export default function DoctorAppointments() {
  const { profile } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) {
        setIsLoading(false)
        return
      }

      try {
        // First get doctor id
        const { data: doctor } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', profile.id)
          .single()

        if (!doctor) {
          setIsLoading(false)
          return
        }

        // Build query
        let query = supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            fee,
            symptoms,
            patient_id
          `)
          .eq('doctor_id', doctor.id)
          .order('appointment_date', { ascending: true })

        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { data: appointmentsData, error: appointmentsError } = await query

        if (appointmentsError) throw appointmentsError

        // Fetch patient details separately
        if (appointmentsData && appointmentsData.length > 0) {
          const patientIds = appointmentsData.map(apt => apt.patient_id).filter(Boolean)
          
          if (patientIds.length > 0) {
            const { data: patientsData, error: patientsError } = await supabase
              .from('profiles')
              .select('id, name, phone')
              .in('id', patientIds)

            if (patientsError) throw patientsError

            // Merge appointment and patient data
            const mergedData = appointmentsData.map(apt => ({
              ...apt,
              patient_name: patientsData?.find(p => p.id === apt.patient_id)?.name || 'Unknown',
              patient_phone: patientsData?.find(p => p.id === apt.patient_id)?.phone || 'N/A'
            }))

            setAppointments(mergedData)
          } else {
            setAppointments(appointmentsData.map(apt => ({ ...apt, patient_name: 'Unknown', patient_phone: 'N/A' })))
          }
        } else {
          setAppointments([])
        }
      } catch (err) {
        console.error('Failed to load appointments:', err)
        toast.error('Failed to load appointments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [profile?.id, filter])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      toast.success(`Appointment ${newStatus}`)
      
      // Refresh appointments
      window.location.reload()
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'pending_payment': return 'bg-orange-100 text-orange-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">Appointments</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['all', 'pending', 'pending_payment', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-grey hover:bg-gray-50'
            }`}
          >
            {status === 'pending_payment' ? 'Pending Payment' : status}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg">{apt.patient_name || 'Unknown Patient'}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status === 'pending_payment' ? 'Pending Payment' : apt.status}
                  </span>
                </div>
                <p className="text-text-grey text-sm">{apt.patient_phone || 'No phone'}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-grey">
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
              <div className="flex gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {apt.status === 'pending_payment' && (
                  <button
                    onClick={() => updateStatus(apt.id, 'cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                )}
                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(apt.id, 'completed')}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="text-center py-12 text-text-grey">
            No appointments found
          </div>
        )}
      </div>
    </div>
  )
}