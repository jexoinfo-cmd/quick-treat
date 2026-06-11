'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function PatientDashboard() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0
  })

  useEffect(() => {
    if (!profile) {
      router.push('/')
      return
    }

    const fetchStats = async () => {
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', profile.id)

      setStats({
        appointments: count || 0,
        prescriptions: 0
      })
    }

    fetchStats()
  }, [profile, router])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">
        Welcome, {profile?.name || 'Patient'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-text-grey text-sm">Total Appointments</p>
              <p className="text-2xl font-bold">{stats.appointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <div>
              <p className="text-text-grey text-sm">Prescriptions</p>
              <p className="text-2xl font-bold">{stats.prescriptions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/patient/doctors')}
          className="bg-primary text-white p-4 rounded-xl text-center hover:bg-primary-dark transition"
        >
          🔍 Find Doctors
        </button>
        <button
          onClick={() => router.push('/patient/appointments')}
          className="border border-primary text-primary p-4 rounded-xl text-center hover:bg-primary-light transition"
        >
          📋 My Appointments
        </button>
      </div>
    </div>
  )
}