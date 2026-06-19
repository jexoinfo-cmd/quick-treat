'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

// Define types
interface RecentDoctor {
  id: string
  speciality: string
  is_available: boolean
  profile: {
    name: string
  } | { name: string }[] | null
}

interface Stats {
  totalDoctors: number
  totalPatients: number
  availableBeds: number
  totalBeds: number
  todayAppointments: number
}

export default function HospitalDashboard() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    totalPatients: 0,
    availableBeds: 0,
    totalBeds: 0,
    todayAppointments: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [recentDoctors, setRecentDoctors] = useState<RecentDoctor[]>([])

  // Helper function to get doctor name
  const getDoctorName = (profile: RecentDoctor['profile']): string => {
    if (!profile) return 'Unknown'
    if (Array.isArray(profile)) {
      return profile[0]?.name || 'Unknown'
    }
    return profile.name || 'Unknown'
  }

  // Check approval status first
  useEffect(() => {
    const checkApproval = async () => {
      if (!profile?.id) return
      
      const { data: hospital, error } = await supabase
        .from('hospitals')
        .select('is_approved')
        .eq('id', profile.id)
        .single()
      
      if (error) {
        console.error('Error checking approval:', error)
        router.push('/hospital/pending-approval')
        return
      }
      
      if (hospital?.is_approved === false) {
        router.push('/hospital/pending-approval')
        return
      }
      
      setIsApproved(true)
    }
    
    checkApproval()
  }, [profile?.id, router])

  // Fetch stats - without useCallback
  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id || !isApproved) return

      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Fetch total doctors
        const { count: doctorCount, error: doctorError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true })
          .eq('hospital_id', profile.id)

        if (doctorError) throw doctorError

        // Fetch total patients (from appointments)
        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('doctor_id', profile.id)

        if (appointmentError) throw appointmentError

        const uniquePatients = new Set(appointments?.map(a => a.patient_id))
        
        // Fetch today's appointments
        const { count: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today)

        if (todayError) throw todayError

        // Fetch hospital bed info
        const { data: hospital, error: bedError } = await supabase
          .from('hospitals')
          .select('total_beds, available_beds')
          .eq('id', profile.id)
          .single()

        if (bedError) throw bedError

        // Fetch recent doctors
        const { data: recentDocs, error: recentError } = await supabase
          .from('doctors')
          .select(`
            id,
            speciality,
            is_available,
            profile:profiles(name)
          `)
          .eq('hospital_id', profile.id)
          .limit(5)

        if (recentError) throw recentError
        setRecentDoctors(recentDocs as RecentDoctor[] || [])

        setStats({
          totalDoctors: doctorCount || 0,
          totalPatients: uniquePatients.size || 0,
          availableBeds: hospital?.available_beds || 0,
          totalBeds: hospital?.total_beds || 0,
          todayAppointments: todayCount || 0
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        toast.error('Failed to load dashboard stats')
      } finally {
        setIsLoading(false)
      }
    }

    if (isApproved) {
      fetchStats()
    }
  }, [profile?.id, isApproved])

  if (!isApproved) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark">
          Welcome to {profile?.name || 'Hospital'} Dashboard
        </h1>
        <p className="text-text-grey mt-2">
          Manage your hospital operations from here
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Doctors</p>
          <p className="text-3xl font-bold mt-2">{stats.totalDoctors}</p>
        </div>

        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Patients</p>
          <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Available Beds</p>
          <p className="text-3xl font-bold mt-2">{stats.availableBeds} / {stats.totalBeds}</p>
        </div>

        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Today&apos;s Appointments</p>
          <p className="text-3xl font-bold mt-2">{stats.todayAppointments}</p>
        </div>

        <div className="bg-linear-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Bed Occupancy</p>
          <p className="text-3xl font-bold mt-2">
            {stats.totalBeds > 0 ? Math.round((stats.totalBeds - stats.availableBeds) / stats.totalBeds * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          onClick={() => router.push('/hospital/doctors')}
          className="bg-white border border-border rounded-xl p-6 text-center hover:shadow-lg transition group"
        >
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
          <h3 className="font-semibold mb-1">Manage Doctors</h3>
          <p className="text-text-grey text-sm">Add or remove doctors</p>
        </button>

        <button className="bg-white border border-border rounded-xl p-6 text-center hover:shadow-lg transition group">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
            <span className="text-2xl">🛏️</span>
          </div>
          <h3 className="font-semibold mb-1">Manage Beds</h3>
          <p className="text-text-grey text-sm">Update bed availability</p>
        </button>

        <button className="bg-white border border-border rounded-xl p-6 text-center hover:shadow-lg transition group">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold mb-1">View Reports</h3>
          <p className="text-text-grey text-sm">Generate analytics</p>
        </button>
      </div>

      {/* Recent Doctors */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Recently Added Doctors</h2>
        </div>
        <div className="divide-y divide-border">
          {recentDoctors.map((doctor) => (
            <div key={doctor.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{getDoctorName(doctor.profile)}</p>
                <p className="text-sm text-text-grey">{doctor.speciality}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                doctor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {doctor.is_available ? 'Available' : 'Off Duty'}
              </span>
            </div>
          ))}
          {recentDoctors.length === 0 && (
            <div className="p-8 text-center text-text-grey">
              No doctors added yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}