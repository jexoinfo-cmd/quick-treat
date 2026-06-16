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

// জেলার টাইপ
interface District {
  id: number
  name: string
  division: string
  created_at?: string
}

// Supabase থেকে আসা ডেটার জন্য টাইপ
interface ProfileData {
  name: string
  email: string
  phone: string
  district: string
  upazila: string
}

interface SupabaseHospitalData {
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
  profile: ProfileData[] | null
}

type BedType = 'general' | 'icu' | 'ccu'

export default function PatientHospitalsPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [districts, setDistricts] = useState<string[]>([])
  const [allDistricts, setAllDistricts] = useState<string[]>([])
  const [bedType, setBedType] = useState<BedType>('general')
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingBedType, setBookingBedType] = useState<BedType>('general')
  const [bookingPatientName, setBookingPatientName] = useState('')
  const [bookingPatientPhone, setBookingPatientPhone] = useState('')
  const [bookingReason, setBookingReason] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const [filters, setFilters] = useState({
    has_icu: false,
    has_ccu: false,
    has_oxygen: false,
    has_ambulance: false,
    emergency_available: false,
  })

  // Fetch districts from Supabase
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { data, error } = await supabase
          .from('districts')
          .select('name')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching districts:', error)
          return
        }

        if (data && data.length > 0) {
          // এখন any এর পরিবর্তে District টাইপ ব্যবহার করা হয়েছে
          const districtNames = (data as District[]).map((item: District) => item.name)
          setAllDistricts(districtNames)
          console.log('Districts loaded from database:', districtNames)
        }
      } catch (err) {
        console.error('Error fetching districts:', err)
      }
    }

    fetchDistricts()
  }, [])

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching hospitals...')
        
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
            profile:profiles!inner(name, email, phone, district, upazila)
          `)
          .eq('is_approved', true)

        if (error) {
          console.error('Supabase error:', error)
          setError(`ডেটা লোড করতে সমস্যা হচ্ছে: ${error.message}`)
          toast.error('হাসপাতাল লোড করতে সমস্যা হচ্ছে')
          setLoading(false)
          return
        }

        console.log('Raw data:', data)

        if (!data || data.length === 0) {
          console.log('No hospitals found')
          setHospitals([])
          setFilteredHospitals([])
          setDistricts([])
          setLoading(false)
          return
        }

        const formatted: Hospital[] = (data as SupabaseHospitalData[]).map((item: SupabaseHospitalData) => {
          let profileData: ProfileData = {
            name: '',
            email: '',
            phone: '',
            district: '',
            upazila: ''
          }
          
          if (item.profile && Array.isArray(item.profile) && item.profile.length > 0) {
            profileData = {
              name: item.profile[0].name || '',
              email: item.profile[0].email || '',
              phone: item.profile[0].phone || '',
              district: item.profile[0].district || '',
              upazila: item.profile[0].upazila || ''
            }
          }
          
          return {
            id: item.id,
            name: profileData.name || 'Unknown Hospital',
            email: profileData.email || '',
            phone: profileData.phone || '',
            district: profileData.district || '',
            upazila: profileData.upazila || '',
            address: item.address || '',
            is_approved: item.is_approved || false,
            total_beds: item.total_beds || 0,
            available_beds: item.available_beds || 0,
            has_icu: item.has_icu || false,
            has_ccu: item.has_ccu || false,
            has_oxygen: item.has_oxygen || false,
            has_ambulance: item.has_ambulance || false,
            emergency_available: item.emergency_available || false,
            icu_beds: item.icu_beds || 0,
            ccu_beds: item.ccu_beds || 0,
          }
        })

        console.log('Formatted hospitals:', formatted)

        setHospitals(formatted)
        setFilteredHospitals(formatted)
        
        const uniqueDistricts = [...new Set(formatted.map(h => h.district).filter(Boolean))]
        console.log('Unique districts from hospitals:', uniqueDistricts)
        setDistricts(uniqueDistricts)
        
        if (allDistricts.length === 0 && uniqueDistricts.length > 0) {
          setAllDistricts(uniqueDistricts)
        }
        
      } catch (err) {
        console.error('Error fetching hospitals:', err)
        setError('হাসপাতাল লোড করতে সমস্যা হচ্ছে। দয়া করে আবার চেষ্টা করুন।')
        toast.error('হাসপাতাল লোড করতে সমস্যা হচ্ছে')
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [allDistricts])

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
      toast.error('দয়া করে প্রথমে লগইন করুন')
      router.push('/login')
      return
    }

    if (!bookingHospital) {
      toast.error('হাসপাতাল নির্বাচন করুন')
      return
    }

    if (!bookingPatientName.trim()) {
      toast.error('দয়া করে রোগীর নাম লিখুন')
      return
    }

    if (!bookingPatientPhone.trim()) {
      toast.error('দয়া করে রোগীর ফোন নম্বর লিখুন')
      return
    }

    let availableCount = 0
    if (bookingBedType === 'general') {
      availableCount = bookingHospital.available_beds
    } else if (bookingBedType === 'icu') {
      availableCount = bookingHospital.icu_beds || 0
    } else {
      availableCount = bookingHospital.ccu_beds || 0
    }

    if (availableCount < 1) {
      toast.error(`বর্তমানে ${bookingBedType.toUpperCase()} বেড উপলব্ধ নেই`)
      return
    }

    setIsBooking(true)

    try {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          hospital_id: bookingHospital.id,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: new Date().toLocaleTimeString(),
          symptoms: `${bookingBedType.toUpperCase()} bed booking - ${bookingReason || 'No reason provided'}`,
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

      const { error: updateError } = await supabase
        .from('hospitals')
        .update(updateData)
        .eq('id', bookingHospital.id)

      if (updateError) throw updateError

      toast.success(`${bookingBedType.toUpperCase()} বেড সফলভাবে বুক করা হয়েছে!`)
      setShowBookingModal(false)
      setBookingHospital(null)
      setBookingPatientName('')
      setBookingPatientPhone('')
      setBookingReason('')
      
      window.location.reload()
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('বেড বুক করতে সমস্যা হচ্ছে')
    } finally {
      setIsBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark mb-2">হাসপাতাল খুঁজুন</h1>
      <p className="text-text-grey mb-6">আপনার নিকটবর্তী হাসপাতালে বেড বুক করুন</p>

      <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="হাসপাতালের নাম বা জেলা দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">সব জেলা</option>
            {(allDistricts.length > 0 ? allDistricts : districts).map((d) => (
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
            আইসিইউ উপলব্ধ
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_ccu}
              onChange={(e) => setFilters({ ...filters, has_ccu: e.target.checked })}
              className="rounded"
            />
            সিসিইউ উপলব্ধ
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_oxygen}
              onChange={(e) => setFilters({ ...filters, has_oxygen: e.target.checked })}
              className="rounded"
            />
            অক্সিজেন
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.has_ambulance}
              onChange={(e) => setFilters({ ...filters, has_ambulance: e.target.checked })}
              className="rounded"
            />
            অ্যাম্বুলেন্স
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.emergency_available}
              onChange={(e) => setFilters({ ...filters, emergency_available: e.target.checked })}
              className="rounded"
            />
            ২৪/৭ জরুরি সেবা
          </label>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-text-grey">
          <span className="font-semibold text-primary">{filteredHospitals.length}</span> টি হাসপাতাল পাওয়া গেছে
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg text-teal-dark">{hospital.name}</h3>
            <p className="text-text-grey text-sm mt-1">
              {hospital.district && `${hospital.district}, `}{hospital.upazila}
            </p>
            <p className="text-text-grey text-xs mt-1">{hospital.address}</p>

            <div className="mt-3 grid grid-cols-2 gap-1 text-sm">
              <div className="flex items-center gap-1 text-green-600">🛏️ সাধারণ বেড: {hospital.available_beds}</div>
              {hospital.has_icu && <div className="flex items-center gap-1">🩺 আইসিইউ: {hospital.icu_beds || 0}</div>}
              {hospital.has_ccu && <div className="flex items-center gap-1">❤️ সিসিইউ: {hospital.ccu_beds || 0}</div>}
              {hospital.has_oxygen && <div className="flex items-center gap-1">💨 অক্সিজেন</div>}
              {hospital.has_ambulance && <div className="flex items-center gap-1">🚑 অ্যাম্বুলেন্স</div>}
              {hospital.emergency_available && <div className="flex items-center gap-1">🚨 জরুরি সেবা</div>}
            </div>

            <div className="mt-4 flex gap-2">
              <select
                onChange={(e) => setBedType(e.target.value as BedType)}
                className="px-2 py-1 border border-border rounded-lg text-sm"
              >
                <option value="general">সাধারণ বেড</option>
                <option value="icu">আইসিইউ বেড</option>
                <option value="ccu">সিসিইউ বেড</option>
              </select>
              <button
                onClick={() => {
                  setBookingHospital(hospital)
                  setBookingBedType(bedType)
                  setShowBookingModal(true)
                }}
                className="flex-1 bg-primary text-white py-2 rounded-xl hover:bg-primary-dark transition text-sm"
              >
                বুক করুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-grey">কোন হাসপাতাল পাওয়া যায়নি। আপনার সার্চ পরিবর্তন করে দেখুন।</p>
        </div>
      )}

      {showBookingModal && bookingHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-teal-dark mb-2">{bookingBedType.toUpperCase()} বেড বুক করুন</h2>
            <p className="text-text-grey mb-4">{bookingHospital.name} এ</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="রোগীর পুরো নাম *"
                value={bookingPatientName}
                onChange={(e) => setBookingPatientName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="রোগীর ফোন নম্বর *"
                value={bookingPatientPhone}
                onChange={(e) => setBookingPatientPhone(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="ভর্তির কারণ (ঐচ্ছিক)"
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleBookBed} 
                disabled={isBooking}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {isBooking ? 'বুক করা হচ্ছে...' : 'বুকিং নিশ্চিত করুন'}
              </button>
              <button 
                onClick={() => {
                  setShowBookingModal(false)
                  setBookingHospital(null)
                }} 
                className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}