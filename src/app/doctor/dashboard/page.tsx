'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'
import ResponsiveStatCard from '@/components/common/ResponsiveStatCard'

export default function DoctorDashboard() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    patientsToday: 0,
    currentToken: 0,
    queueLength: 0,
    totalAppointments: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

  useEffect(() => {
    const checkApproval = async () => {
      if (!profile?.id) return
      
      const { data: doctor } = await supabase
        .from('doctors')
        .select('is_approved, is_available')
        .eq('user_id', profile.id)
        .single()
      
      if (doctor?.is_approved === false) {
        router.push('/doctor/pending-approval')
        return
      }
      
      setIsApproved(true)
      setIsAvailable(doctor?.is_available ?? true)
    }
    
    checkApproval()
  }, [profile?.id, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id || !isApproved) return

      try {
        const today = new Date().toISOString().split('T')[0]
        
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('doctor_id', profile.id)
          .eq('status', 'confirmed')
          .eq('appointment_date', today)

        const { count: queueCount } = await supabase
          .from('queues')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', profile.id)
          .eq('status', 'waiting')

        const { count: totalCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', profile.id)

        setStats({
          patientsToday: appointments?.length || 0,
          currentToken: 0,
          queueLength: queueCount || 0,
          totalAppointments: totalCount || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('Failed to load dashboard stats')
      } finally {
        setIsLoading(false)
      }
    }

    if (isApproved) {
      fetchStats()
    }
  }, [profile?.id, isApproved])

  const handleAvailability = async (status: boolean) => {
    setIsAvailable(status)
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_available: status })
        .eq('user_id', profile?.id)

      if (error) throw error
      toast.success(status ? 'You are now available' : 'You are now unavailable')
    } catch (error) {
      console.error('Availability update failed:', error)
      toast.error('Failed to update status')
      setIsAvailable(!status)
    }
  }

  if (!isApproved || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-dark">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, Dr. {profile?.name?.split(' ')[0] || 'Rahman'}
        </h1>
        <div className="flex flex-wrap gap-3 mt-3 sm:mt-4">
          <button 
            onClick={() => handleAvailability(true)}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition ${
              isAvailable 
                ? 'bg-success text-white' 
                : 'border border-border hover:bg-gray-50'
            }`}
          >
            Available
          </button>
          <button 
            onClick={() => handleAvailability(false)}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition ${
              !isAvailable 
                ? 'bg-error text-white' 
                : 'border border-border hover:bg-gray-50'
            }`}
          >
            Unavailable
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <ResponsiveStatCard 
          title="Patients Today" 
          value={stats.patientsToday} 
          icon="👥" 
          color="blue"
        />
        <ResponsiveStatCard 
          title="Queue Length" 
          value={stats.queueLength} 
          icon="⏳" 
          color="orange"
        />
        <ResponsiveStatCard 
          title="Total Appointments" 
          value={stats.totalAppointments} 
          icon="📅" 
          color="purple"
        />
        <ResponsiveStatCard 
          title="Current Token" 
          value={stats.currentToken} 
          icon="🔢" 
          color="green"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button className="btn-primary px-4 sm:px-6 py-2 text-sm sm:text-base">
          + Add Patient
        </button>
        <button 
          onClick={() => router.push('/doctor/queue')}
          className="btn-outline px-4 sm:px-6 py-2 text-sm sm:text-base"
        >
          View Queue →
        </button>
      </div>

      {/* Recent Patients */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Patients</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition group">
              <div>
                <p className="font-medium text-text-dark text-sm sm:text-base">Patient Name {i}</p>
                <p className="text-xs sm:text-sm text-text-grey mt-1">+880 1XXX XXXXXX</p>
              </div>
              <button className="text-primary text-sm sm:text-base opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}