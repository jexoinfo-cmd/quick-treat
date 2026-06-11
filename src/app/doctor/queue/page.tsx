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
  status: 'waiting' | 'in-progress' | 'completed' | 'skipped'
  created_at: string
}

export default function DoctorQueue() {
  const { profile } = useAuthStore()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPatient, setCurrentPatient] = useState<QueueItem | null>(null)

  // Load queue data
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const { data: doctor } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', profile?.id)
          .single()

        if (!doctor) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('queues')
          .select('*')
          .eq('doctor_id', doctor.id)
          .order('token', { ascending: true })

        if (error) throw error
        setQueue(data || [])
        
        const current = data?.find(p => p.status === 'in-progress')
        setCurrentPatient(current || null)
      } catch (error) {
        console.error('Error fetching queue:', error)
        toast.error('Failed to load queue')
      } finally {
        setLoading(false)
      }
    }

    fetchQueue()
    
    // Real-time subscription
    const subscription = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
        },
        () => {
          fetchQueue()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.id])

  const updateStatus = async (id: string, status: QueueItem['status']) => {
    try {
      const { error } = await supabase
        .from('queues')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Patient ${status}`)
      
      // Refresh queue
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', profile?.id)
        .single()

      if (doctor) {
        const { data } = await supabase
          .from('queues')
          .select('*')
          .eq('doctor_id', doctor.id)
          .order('token', { ascending: true })
        
        setQueue(data || [])
        const current = data?.find(p => p.status === 'in-progress')
        setCurrentPatient(current || null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const addToQueue = async () => {
    const patientName = prompt('Enter patient name:')
    if (!patientName) return
    
    const patientPhone = prompt('Enter patient phone:')
    
    try {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', profile?.id)
        .single()

      if (!doctor) {
        toast.error('Doctor not found')
        return
      }

      const nextToken = queue.length + 1

      const { error } = await supabase
        .from('queues')
        .insert({
          doctor_id: doctor.id,
          patient_name: patientName,
          patient_phone: patientPhone || '',
          token: nextToken,
          status: 'waiting'
        })

      if (error) throw error
      toast.success('Patient added to queue')
      
      // Refresh queue
      const { data } = await supabase
        .from('queues')
        .select('*')
        .eq('doctor_id', doctor.id)
        .order('token', { ascending: true })
      
      setQueue(data || [])
      const current = data?.find(p => p.status === 'in-progress')
      setCurrentPatient(current || null)
    } catch (error) {
      console.error('Error adding patient:', error)
      toast.error('Failed to add patient')
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
        <h1 className="text-3xl font-bold text-text-dark">Queue Management</h1>
        <button
          onClick={addToQueue}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + Add Patient
        </button>
      </div>

      {/* Current Patient */}
      {currentPatient && (
        <div className="mb-8 bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Currently Serving</p>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-2xl font-bold">{currentPatient.patient_name}</p>
              <p className="text-sm opacity-90">Token #{currentPatient.token}</p>
            </div>
            <button
              onClick={() => updateStatus(currentPatient.id, 'completed')}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100"
            >
              Complete
            </button>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-border">
          <h2 className="font-semibold">Waiting List</h2>
        </div>
        <div className="divide-y divide-border">
          {queue.filter(q => q.status === 'waiting').map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div>
                <span className="inline-block bg-primary-light text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Token #{item.token}
                </span>
                <p className="font-medium mt-2">{item.patient_name}</p>
                <p className="text-sm text-text-grey">{item.patient_phone}</p>
              </div>
              <button
                onClick={() => updateStatus(item.id, 'in-progress')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Start
              </button>
            </div>
          ))}
          {queue.filter(q => q.status === 'waiting').length === 0 && (
            <div className="p-8 text-center text-text-grey">
              No patients in queue
            </div>
          )}
        </div>
      </div>

      {/* Completed Section */}
      {queue.filter(q => q.status === 'completed').length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-border">
            <h2 className="font-semibold">Completed Today</h2>
          </div>
          <div className="divide-y divide-border">
            {queue.filter(q => q.status === 'completed').slice(0, 5).map((item) => (
              <div key={item.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-text-grey">Token #{item.token}</span>
                  <p className="font-medium">{item.patient_name}</p>
                </div>
                <span className="text-green-600 text-sm">✓ Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}