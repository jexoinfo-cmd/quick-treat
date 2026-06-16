'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface HospitalStats {
  totalDoctors: number
  totalPatients: number
  totalBeds: number
  availableBeds: number
  icuBeds: number
  ccuBeds: number
  availableIcuBeds: number
  availableCcuBeds: number
  todayAppointments: number
}

interface RecentDoctor {
  id: string
  speciality: string
  is_available: boolean
  profile: {
    name: string
  }
}

// Raw response type from Supabase
interface RawDoctor {
  id: string
  speciality: string
  is_available: boolean
  profile: { name: string }[]
}

export default function HospitalDashboard() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<HospitalStats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalBeds: 0,
    availableBeds: 0,
    icuBeds: 0,
    ccuBeds: 0,
    availableIcuBeds: 0,
    availableCcuBeds: 0,
    todayAppointments: 0
  })
  const [recentDoctors, setRecentDoctors] = useState<RecentDoctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

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

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id || !isApproved) return

      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Fetch doctors count
        const { count: doctorCount } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true })
          .eq('hospital_id', profile.id)

        // Fetch hospital bed info
        const { data: hospital, error: bedError } = await supabase
          .from('hospitals')
          .select('total_beds, available_beds, icu_beds, ccu_beds')
          .eq('id', profile.id)
          .single()

        if (bedError) throw bedError

        // Fetch total patients from appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('hospital_id', profile.id)

        const uniquePatients = new Set(appointments?.map(a => a.patient_id))
        
        // Fetch today's appointments
        const { count: todayCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today)

        // Calculate available ICU and CCU beds (assuming 40% available for demo)
        const totalIcuBeds = hospital?.icu_beds || 0
        const totalCcuBeds = hospital?.ccu_beds || 0
        const availableIcuBeds = Math.floor(totalIcuBeds * 0.4)
        const availableCcuBeds = Math.floor(totalCcuBeds * 0.3)

        // Fetch recent doctors and transform data
        const { data: rawDoctors } = await supabase
          .from('doctors')
          .select(`
            id,
            speciality,
            is_available,
            profile:profiles(name)
          `)
          .eq('hospital_id', profile.id)
          .limit(5)

        // Transform raw data to match RecentDoctor type
        const transformedDoctors: RecentDoctor[] = (rawDoctors as RawDoctor[] || []).map((doc) => ({
          id: doc.id,
          speciality: doc.speciality || 'General',
          is_available: doc.is_available || false,
          profile: {
            name: doc.profile?.[0]?.name || 'Unknown'
          }
        }))

        setRecentDoctors(transformedDoctors)

        setStats({
          totalDoctors: doctorCount || 0,
          totalPatients: uniquePatients.size || 0,
          totalBeds: hospital?.total_beds || 0,
          availableBeds: hospital?.available_beds || 0,
          icuBeds: totalIcuBeds,
          ccuBeds: totalCcuBeds,
          availableIcuBeds: availableIcuBeds,
          availableCcuBeds: availableCcuBeds,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark">
          Welcome to {profile?.name || 'Hospital'} Dashboard
        </h1>
        <p className="text-text-grey mt-2">
          Manage your hospital operations from here
        </p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Doctors</p>
          <p className="text-3xl font-bold mt-2">{stats.totalDoctors}</p>
        </div>
        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Patients</p>
          <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
        </div>
        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-text-grey text-sm">Today&apos;s Appointments</p>
          <p className="text-3xl font-bold mt-2">{stats.todayAppointments}</p>
        </div>
        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Beds</p>
          <p className="text-3xl font-bold mt-2">{stats.totalBeds}</p>
        </div>
      </div>

      {/* Stats Cards - Row 2 (Beds Detail) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-grey text-sm">Available Beds</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.availableBeds}</p>
              <p className="text-xs text-text-grey mt-1">out of {stats.totalBeds}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛏️</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2 transition-all"
              style={{ width: `${stats.totalBeds > 0 ? (stats.availableBeds / stats.totalBeds) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-grey text-sm">ICU Beds</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.availableIcuBeds}</p>
              <p className="text-xs text-text-grey mt-1">out of {stats.icuBeds}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all"
              style={{ width: `${stats.icuBeds > 0 ? (stats.availableIcuBeds / stats.icuBeds) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-grey text-sm">CCU Beds</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.availableCcuBeds}</p>
              <p className="text-xs text-text-grey mt-1">out of {stats.ccuBeds}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 rounded-full h-2 transition-all"
              style={{ width: `${stats.ccuBeds > 0 ? (stats.availableCcuBeds / stats.ccuBeds) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-grey text-sm">Bed Occupancy</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {stats.totalBeds > 0 ? Math.round((stats.totalBeds - stats.availableBeds) / stats.totalBeds * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => router.push('/hospital/doctors')}
          className="bg-primary text-white p-4 rounded-xl text-center hover:bg-primary-dark transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">👨‍⚕️</span>
          <span>Manage Doctors</span>
        </button>
        <button 
          onClick={() => router.push('/hospital/beds')}
          className="bg-teal-600 text-white p-4 rounded-xl text-center hover:bg-teal-700 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🛏️</span>
          <span>Manage Beds</span>
        </button>
        <button 
          onClick={() => router.push('/hospital/facility')}
          className="bg-emerald-600 text-white p-4 rounded-xl text-center hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">🏥</span>
          <span>Facilities</span>
        </button>
        <button 
          onClick={() => router.push('/hospital/reports')}
          className="bg-amber-600 text-white p-4 rounded-xl text-center hover:bg-amber-700 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl">📊</span>
          <span>Reports</span>
        </button>
      </div>

      {/* Recent Doctors */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-gray-50">
          <h2 className="text-xl font-semibold">Recently Added Doctors</h2>
        </div>
        <div className="divide-y divide-border">
          {recentDoctors.map((doctor) => (
            <div key={doctor.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div>
                <p className="font-medium">{doctor.profile?.name || 'Unknown'}</p>
                <p className="text-sm text-text-grey">{doctor.speciality || 'General'}</p>
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