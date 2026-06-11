'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Bed {
  id: string
  bed_number: string
  type: 'general' | 'icu' | 'ccu' | 'private'
  status: 'available' | 'occupied' | 'maintenance'
  patient_name?: string
  assigned_at?: string
}

interface NewBed {
  bed_number: string
  type: 'general' | 'icu' | 'ccu' | 'private'
}

export default function HospitalBeds() {
  const { profile } = useAuthStore()
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBed, setNewBed] = useState<NewBed>({ bed_number: '', type: 'general' })

  // Load beds
  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const { data, error } = await supabase
          .from('beds')
          .select('*')
          .eq('hospital_id', profile?.id)
          .order('bed_number')

        if (error) throw error
        setBeds(data || [])
      } catch (error) {
        console.error('Error fetching beds:', error)
        toast.error('Failed to load beds')
      } finally {
        setLoading(false)
      }
    }

    fetchBeds()
  }, [profile?.id])

  const addBed = async () => {
    if (!newBed.bed_number) {
      toast.error('Please enter bed number')
      return
    }

    try {
      const { error } = await supabase
        .from('beds')
        .insert({
          hospital_id: profile?.id,
          bed_number: newBed.bed_number,
          type: newBed.type,
          status: 'available'
        })

      if (error) throw error
      toast.success('Bed added successfully')
      setShowAddModal(false)
      setNewBed({ bed_number: '', type: 'general' })
      
      // Refresh beds
      const { data } = await supabase
        .from('beds')
        .select('*')
        .eq('hospital_id', profile?.id)
        .order('bed_number')
      setBeds(data || [])
    } catch (error) {
      console.error('Error adding bed:', error)
      toast.error('Failed to add bed')
    }
  }

  const updateBedStatus = async (id: string, status: Bed['status']) => {
    try {
      const { error } = await supabase
        .from('beds')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Bed ${status}`)
      
      // Refresh beds
      const { data } = await supabase
        .from('beds')
        .select('*')
        .eq('hospital_id', profile?.id)
        .order('bed_number')
      setBeds(data || [])
    } catch (error) {
      console.error('Error updating bed:', error)
      toast.error('Failed to update bed status')
    }
  }

  const deleteBed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bed?')) return

    try {
      const { error } = await supabase
        .from('beds')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Bed deleted')
      
      // Refresh beds
      const { data } = await supabase
        .from('beds')
        .select('*')
        .eq('hospital_id', profile?.id)
        .order('bed_number')
      setBeds(data || [])
    } catch (error) {
      console.error('Error deleting bed:', error)
      toast.error('Failed to delete bed')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'occupied': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'general': return '🛏️'
      case 'icu': return '🏥'
      case 'ccu': return '❤️'
      case 'private': return '⭐'
      default: return '🛏️'
    }
  }

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
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
        <h1 className="text-3xl font-bold text-text-dark">Bed Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + Add New Bed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Beds</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Available</p>
          <p className="text-3xl font-bold mt-2">{stats.available}</p>
        </div>
        <div className="bg-linear-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Occupied</p>
          <p className="text-3xl font-bold mt-2">{stats.occupied}</p>
        </div>
        <div className="bg-linear-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Maintenance</p>
          <p className="text-3xl font-bold mt-2">{stats.maintenance}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-border">
          <h2 className="font-semibold">All Beds</h2>
        </div>
        <div className="divide-y divide-border">
          {beds.map((bed) => (
            <div key={bed.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getTypeIcon(bed.type)}</span>
                <div>
                  <p className="font-medium">Bed #{bed.bed_number}</p>
                  <p className="text-sm text-text-grey capitalize">{bed.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(bed.status)}`}>
                  {bed.status}
                </span>
                <div className="flex gap-2">
                  {bed.status !== 'available' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'available')}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                    >
                      Free
                    </button>
                  )}
                  {bed.status !== 'occupied' && bed.status !== 'maintenance' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'occupied')}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    >
                      Occupy
                    </button>
                  )}
                  <button
                    onClick={() => deleteBed(bed.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {beds.length === 0 && (
            <div className="p-8 text-center text-text-grey">
              No beds found. Click &quot;Add New Bed&quot; to get started.
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Bed</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bed Number (e.g., 101, 102)"
                value={newBed.bed_number}
                onChange={(e) => setNewBed({...newBed, bed_number: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newBed.type}
                onChange={(e) => setNewBed({...newBed, type: e.target.value as 'general' | 'icu' | 'ccu' | 'private'})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="general">General Ward</option>
                <option value="icu">ICU</option>
                <option value="ccu">CCU</option>
                <option value="private">Private Cabin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addBed} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark">Add Bed</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}