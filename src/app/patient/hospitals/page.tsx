'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Hospital {
  id: string
  name: string
  email: string
  phone: string
  address: string
  district: string
  upazila: string
  is_approved: boolean
  total_beds: number
  available_beds: number
  has_icu: boolean
  has_ccu: boolean
  has_oxygen: boolean
  has_ambulance: boolean
  emergency_available: boolean
  icu_beds?: number
  ccu_beds?: number
}

interface RawHospital {
  id: string
  address: string
  is_approved: boolean
  total_beds: number
  available_beds: number
  has_icu: boolean
  has_ccu: boolean
  has_oxygen: boolean
  has_ambulance: boolean
  emergency_available: boolean
  icu_beds?: number
  ccu_beds?: number
  profile: {
    name: string
    email: string
    phone: string
    district: string
    upazila: string
  } | null
}

type BedType = 'general' | 'icu' | 'ccu'

export default function PatientHospitalsPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [districts, setDistricts] = useState<string[]>([])
  const [bedType, setBedType] = useState<BedType>('general')
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingBedType, setBookingBedType] = useState<BedType>('general')
  const [bookingPatientName, setBookingPatientName] = useState('')
  const [bookingPatientPhone, setBookingPatientPhone] = useState('')
  const [bookingReason, setBookingReason] = useState('')

  const [filters, setFilters] = useState({
    has_icu: false,
    has_ccu: false,
    has_oxygen: false,
    has_ambulance: false,
    emergency_available: false,
  })

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select(`
            id,
            address,
            is_approved,
            total_beds,
            available_beds,
            has_icu,
            has_ccu,
            has_oxygen,
            has_ambulance,
            emergency_available,
            icu_beds,
            ccu_beds,
            profile:profiles(name, email, phone, district, upazila)
          `)
          .eq('is_approved', true)

        if (error) throw error

        const rawData = data as unknown as RawHospital[]
        const formatted: Hospital[] = rawData.map((h) => ({
          id: h.id,
          name: h.profile?.name || 'Unknown',
          email: h.profile?.email || '',
          phone: h.profile?.phone || '',
          district: h.profile?.district || '',
          upazila: h.profile?.upazila || '',
          address: h.address || '',
          is_approved: h.is_approved,
          total_beds: h.total_beds || 0,
          available_beds: h.available_beds || 0,
          has_icu: h.has_icu || false,
          has_ccu: h.has_ccu || false,
          has_oxygen: h.has_oxygen || false,
          has_ambulance: h.has_ambulance || false,
          emergency_available: h.emergency_available || false,
          icu_beds: h.icu_beds || 0,
          ccu_beds: h.ccu_beds || 0,
        }))

        setHospitals(formatted)
        const uniqueDistricts = [...new Set(formatted.map(h => h.district).filter(Boolean))]
        setDistricts(uniqueDistricts)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load hospitals')
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...hospitals]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(term) ||
        h.district.toLowerCase().includes(term)
      )
    }

    if (selectedDistrict) {
      filtered = filtered.filter(h => h.district === selectedDistrict)
    }

    if (filters.has_icu) filtered = filtered.filter(h => h.has_icu)
    if (filters.has_ccu) filtered = filtered.filter(h => h.has_ccu)
    if (filters.has_oxygen) filtered = filtered.filter(h => h.has_oxygen)
    if (filters.has_ambulance) filtered = filtered.filter(h => h.has_ambulance)
    if (filters.emergency_available) filtered = filtered.filter(h => h.emergency_available)

    setFilteredHospitals(filtered)
  }, [hospitals, searchTerm, selectedDistrict, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  async function handleBookBed() {
    if (!profile?.id) {
      toast.error('Please login first')
      router.push('/login')
      return
    }

    if (!bookingHospital) return

    let availableCount = 0
    if (bookingBedType === 'general') {
      availableCount = bookingHospital.available_beds
    } else if (bookingBedType === 'icu') {
      availableCount = bookingHospital.icu_beds || 0
    } else {
      availableCount = bookingHospital.ccu_beds || 0
    }

    if (availableCount < 1) {
      toast.error(`No ${bookingBedType.toUpperCase()} beds available right now`)
      return
    }

    try {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          hospital_id: bookingHospital.id,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: new Date().toLocaleTimeString(),
          symptoms: `${bookingBedType.toUpperCase()} bed booking - ${bookingReason}`,
          status: 'pending',
          fee: 0,
          type: 'bed_booking',
          bed_type: bookingBedType,
          patient_name: bookingPatientName || profile.name,
          patient_phone: bookingPatientPhone || profile.phone,
        })

      if (appointmentError) throw appointmentError

      const updateData: {
        available_beds?: number
        icu_beds?: number
        ccu_beds?: number
      } = {}

      if (bookingBedType === 'general') {
        updateData.available_beds = bookingHospital.available_beds - 1
      } else if (bookingBedType === 'icu') {
        updateData.icu_beds = (bookingHospital.icu_beds || 0) - 1
      } else {
        updateData.ccu_beds = (bookingHospital.ccu_beds || 0) - 1
      }

      await supabase
        .from('hospitals')
        .update(updateData)
        .eq('id', bookingHospital.id)

      toast.success(`${bookingBedType.toUpperCase()} bed booked successfully!`)
      setShowBookingModal(false)
      setBookingHospital(null)
      
      // Refresh hospitals list
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error('Failed to book bed')
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark mb-2">Find Hospitals</h1>
      <p className="text-text-grey mb-6">Search and book beds in hospitals near you</p>

      <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by hospital name or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_icu}
              onChange={(e) => setFilters({ ...filters, has_icu: e.target.checked })}
              className="rounded"
            />
            ICU Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_ccu}
              onChange={(e) => setFilters({ ...filters, has_ccu: e.target.checked })}
              className="rounded"
            />
            CCU Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_oxygen}
              onChange={(e) => setFilters({ ...filters, has_oxygen: e.target.checked })}
              className="rounded"
            />
            Oxygen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_ambulance}
              onChange={(e) => setFilters({ ...filters, has_ambulance: e.target.checked })}
              className="rounded"
            />
            Ambulance
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.emergency_available}
              onChange={(e) => setFilters({ ...filters, emergency_available: e.target.checked })}
              className="rounded"
            />
            24/7 Emergency
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg text-teal-dark">{hospital.name}</h3>
            <p className="text-text-grey text-sm mt-1">{hospital.district}, {hospital.upazila}</p>
            <p className="text-text-grey text-xs mt-1">{hospital.address}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">✅ General Beds: {hospital.available_beds}</div>
              <div className="flex items-center gap-1">{hospital.has_icu && '🩺 ICU'}</div>
              <div className="flex items-center gap-1">{hospital.has_ccu && '❤️ CCU'}</div>
              <div className="flex items-center gap-1">{hospital.has_oxygen && '💨 Oxygen'}</div>
              <div className="flex items-center gap-1">{hospital.has_ambulance && '🚑 Ambulance'}</div>
              <div className="flex items-center gap-1">{hospital.emergency_available && '🚨 Emergency'}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <select
                onChange={(e) => setBedType(e.target.value as BedType)}
                className="px-2 py-1 border border-border rounded-lg text-sm"
              >
                <option value="general">General Bed</option>
                <option value="icu">ICU Bed</option>
                <option value="ccu">CCU Bed</option>
              </select>
              <button
                onClick={() => {
                  setBookingHospital(hospital)
                  setBookingBedType(bedType)
                  setShowBookingModal(true)
                }}
                className="flex-1 bg-primary text-white py-2 rounded-xl hover:bg-primary-dark transition text-sm"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12 text-text-grey">No hospitals found. Try adjusting your search.</div>
      )}

      {showBookingModal && bookingHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-teal-dark mb-2">Book {bookingBedType.toUpperCase()} Bed</h2>
            <p className="text-text-grey mb-4">at {bookingHospital.name}</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Patient Full Name"
                value={bookingPatientName}
                onChange={(e) => setBookingPatientName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Patient Phone Number"
                value={bookingPatientPhone}
                onChange={(e) => setBookingPatientPhone(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
              <textarea
                placeholder="Reason for admission (optional)"
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBookBed} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark">Confirm Booking</button>
              <button onClick={() => setShowBookingModal(false)} className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}