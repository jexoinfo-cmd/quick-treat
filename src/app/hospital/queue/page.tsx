'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface QueueItem {
  id: string
  patient_name: string
  patient_phone: string
  token: number
  status: string
  doctor_name: string
  created_at: string
}

export default function HospitalQueue() {
  const { profile } = useAuthStore()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Fetch queue - without useCallback
  useEffect(() => {
    const fetchQueue = async () => {
      if (!profile?.id) return

      try {
        // Get all doctors under this hospital
        const { data: doctors } = await supabase
          .from('doctors')
          .select('id, user_id, profile:profiles(name)')
          .eq('hospital_id', profile.id)

        if (!doctors || doctors.length === 0) {
          setQueue([])
          setLoading(false)
          return
        }

        const doctorIds = doctors.map((d: { id: string }) => d.id)

        // Get queues for all doctors
        let query = supabase
          .from('queues')
          .select(`
            id,
            patient_name,
            patient_phone,
            token,
            status,
            created_at,
            doctor:doctors!inner(
              id,
              profile:profiles!inner(name)
            )
          `)
          .in('doctor_id', doctorIds)
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (error) throw error

        // Transform data safely
        const transformedQueue: QueueItem[] = (data || []).map((item) => {
          let doctorName = 'Unknown'
          if (item.doctor) {
            const doctorData = Array.isArray(item.doctor) ? item.doctor[0] : item.doctor
            if (doctorData && doctorData.profile) {
              const profileData = Array.isArray(doctorData.profile) 
                ? doctorData.profile[0] 
                : doctorData.profile
              doctorName = profileData?.name || 'Unknown'
            }
          }
          
          return {
            id: item.id,
            patient_name: item.patient_name,
            patient_phone: item.patient_phone,
            token: item.token,
            status: item.status,
            doctor_name: doctorName,
            created_at: item.created_at
          }
        })

        setQueue(transformedQueue)
      } catch (error) {
        console.error('Error fetching queue:', error)
        toast.error('Failed to load queue')
      } finally {
        setLoading(false)
      }
    }

    fetchQueue()
  }, [profile?.id, filter])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'waiting': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'skipped': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-dark">Queue Overview</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['all', 'waiting', 'in-progress', 'completed', 'skipped'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-grey hover:bg-gray-50'
            }`}
          >
            {status === 'in-progress' ? 'In Progress' : status}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-border">
          <h2 className="font-semibold">Patient Queue</h2>
        </div>
        <div className="divide-y divide-border">
          {queue.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{item.patient_name}</span>
                    <span className="text-xs text-text-grey">Token #{item.token}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-grey">Dr. {item.doctor_name}</p>
                  <p className="text-xs text-text-grey mt-1">{item.patient_phone}</p>
                </div>
                <div className="text-right text-xs text-text-grey">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="p-8 text-center text-text-grey">
              No patients in queue
            </div>
          )}
        </div>
      </div>
    </div>
  )
}