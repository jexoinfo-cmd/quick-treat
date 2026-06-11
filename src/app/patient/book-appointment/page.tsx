'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  is_available: boolean
  profile: {
    name: string
    email: string
    phone: string
  }
}

interface AuthError {
  message: string
}

export default function BookAppointment() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const doctorId = searchParams.get('doctorId')
  const { profile } = useAuthStore()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDoctor, setLoadingDoctor] = useState(true)

  const fetchDoctor = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(name, email, phone)
        `)
        .eq('id', doctorId)
        .single()

      if (error) throw error
      setDoctor(data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
      toast.error('Failed to load doctor info')
    } finally {
      setLoadingDoctor(false)
    }
  }, [doctorId])

  useEffect(() => {
    if (doctorId) {
      const loadDoctor = async () => {
        await fetchDoctor()
      }
      loadDoctor()
    }
  }, [doctorId, fetchDoctor])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time')
      return
    }

    if (!profile?.id) {
      toast.error('Please login to book appointment')
      router.push('/')
      return
    }

    setLoading(true)
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('is_available, consultation_fee')
        .eq('id', doctorId)
        .single()

      if (doctorError) throw doctorError

      if (!doctorData?.is_available) {
        toast.error('Doctor is not available at this time')
        setLoading(false)
        return
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          doctor_id: doctorId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          symptoms: symptoms || null,
          fee: doctorData.consultation_fee,
          status: 'pending_payment'
        })
        .select()
        .single()

      if (appointmentError) throw appointmentError

      toast.success('Please complete payment to confirm appointment')
      router.push(`/patient/payment?appointment_id=${appointment.id}`)
      
    } catch (error: unknown) {
      console.error('Error booking appointment:', error)
      const authError = error as AuthError
      toast.error(authError.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  if (loadingDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-text-grey">Doctor not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-dark mb-8">Book Appointment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Info */}
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-6 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-4xl">👨‍⚕️</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{doctor.profile?.name || 'Doctor'}</h2>
                <p className="text-primary">{doctor.speciality || 'General'}</p>
                <p className="text-text-grey text-sm">{doctor.degree || 'MBBS'}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-text-grey">Experience</span>
                <span>{doctor.experience || 0} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-grey">Rating</span>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{doctor.rating || 5.0}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-text-grey">Consultation Fee</span>
                <span className="font-bold text-primary text-xl">৳{doctor.consultation_fee}</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-lg mb-6">Select Date & Time</h3>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Select Date</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedDate === date.toISOString().split('T')[0]
                        ? 'bg-primary text-white border-primary shadow-md scale-105'
                        : 'border-border hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold mt-1">{date.getDate()}</div>
                    <div className="text-xs opacity-75">
                      {date.toLocaleDateString('en', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Select Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTime === time
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <span className="font-medium">{time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Symptoms (Optional)</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms, e.g., fever, cough, headache..."
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-grey">Consultation Fee</span>
                  <span>৳{doctor.consultation_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-grey">Platform Fee</span>
                  <span>৳{(doctor.consultation_fee * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Payable</span>
                    <span className="text-primary">৳{doctor.consultation_fee}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedDate || !selectedTime}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Proceed to Payment - ৳${doctor.consultation_fee}`
              )}
            </button>

            <p className="text-center text-xs text-text-grey mt-4">
              Secure payment powered by Zinipay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}