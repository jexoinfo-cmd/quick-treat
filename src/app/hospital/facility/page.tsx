'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface FacilityData {
  total_beds: number
  available_beds: number
  has_oxygen: boolean
  has_ot: boolean
  has_icu: boolean
  has_ambulance: boolean
  emergency_available: boolean
}

export default function HospitalFacility() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [facility, setFacility] = useState<FacilityData>({
    total_beds: 0,
    available_beds: 0,
    has_oxygen: false,
    has_ot: false,
    has_icu: false,
    has_ambulance: false,
    emergency_available: false
  })

  // Load facility data
  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', profile?.id)
          .single()

        if (error) throw error

        setFacility({
          total_beds: data?.total_beds || 0,
          available_beds: data?.available_beds || 0,
          has_oxygen: data?.has_oxygen || false,
          has_ot: data?.has_ot || false,
          has_icu: data?.has_icu || false,
          has_ambulance: data?.has_ambulance || false,
          emergency_available: data?.emergency_available || false
        })
      } catch (error) {
        console.error('Error fetching facility:', error)
        toast.error('Failed to load facility data')
      } finally {
        setLoading(false)
      }
    }

    fetchFacility()
  }, [profile?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          total_beds: facility.total_beds,
          available_beds: facility.available_beds,
          has_oxygen: facility.has_oxygen,
          has_ot: facility.has_ot,
          has_icu: facility.has_icu,
          has_ambulance: facility.has_ambulance,
          emergency_available: facility.emergency_available
        })
        .eq('id', profile?.id)

      if (error) throw error
      toast.success('Facility updated successfully')
    } catch (error) {
      console.error('Error saving facility:', error)
      toast.error('Failed to update facility')
    } finally {
      setSaving(false)
    }
  }

  const updateBeds = (type: 'total' | 'available', value: number) => {
    if (type === 'total') {
      const newTotal = value
      const newAvailable = Math.min(facility.available_beds, newTotal)
      setFacility({ ...facility, total_beds: newTotal, available_beds: newAvailable })
    } else {
      const newAvailable = Math.min(value, facility.total_beds)
      setFacility({ ...facility, available_beds: newAvailable })
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">Facility Management</h1>

      <div className="space-y-6">
        {/* Bed Management */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🛏️</span> Bed Management
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Total Beds</label>
                <input
                  type="number"
                  value={facility.total_beds}
                  onChange={(e) => updateBeds('total', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Available Beds</label>
                <input
                  type="number"
                  value={facility.available_beds}
                  onChange={(e) => updateBeds('available', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-grey">Bed Occupancy</span>
                <span className="font-semibold">
                  {facility.total_beds > 0 
                    ? Math.round((facility.total_beds - facility.available_beds) / facility.total_beds * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ 
                    width: `${facility.total_beds > 0 
                      ? (facility.total_beds - facility.available_beds) / facility.total_beds * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Facilities */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🏥</span> Medical Facilities
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💨</span>
                  <div>
                    <p className="font-medium">Oxygen Supply</p>
                    <p className="text-sm text-text-grey">24/7 oxygen availability</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={facility.has_oxygen}
                  onChange={(e) => setFacility({...facility, has_oxygen: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔪</span>
                  <div>
                    <p className="font-medium">Operation Theater</p>
                    <p className="text-sm text-text-grey">OT available</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={facility.has_ot}
                  onChange={(e) => setFacility({...facility, has_ot: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <p className="font-medium">ICU Facility</p>
                    <p className="text-sm text-text-grey">Intensive Care Unit</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={facility.has_icu}
                  onChange={(e) => setFacility({...facility, has_icu: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚑</span>
                  <div>
                    <p className="font-medium">Ambulance Service</p>
                    <p className="text-sm text-text-grey">24/7 ambulance available</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={facility.has_ambulance}
                  onChange={(e) => setFacility({...facility, has_ambulance: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <p className="font-medium">Emergency Service</p>
                    <p className="text-sm text-text-grey">24/7 emergency available</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={facility.emergency_available}
                  onChange={(e) => setFacility({...facility, emergency_available: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}