'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Doctor {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  profile: {
    name: string
    email: string
    phone: string
  } | null
}

// Raw response type from Supabase
interface RawDoctor {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  profile: {
    name: string
    email: string
    phone: string
  }[] | null
}

export default function FindDoctors() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('')
  const [specialities, setSpecialities] = useState<string[]>([])

  // Function to filter doctors
  const filterDoctors = useCallback(() => {
    let filtered = [...doctors]
    
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedSpeciality) {
      filtered = filtered.filter(doctor => doctor.speciality === selectedSpeciality)
    }
    
    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, selectedSpeciality])

  // Function to fetch doctors
  const fetchDoctors = async () => {
    try {
      const { data } = await supabase
        .from('doctors')
        .select(`
          id,
          speciality,
          degree,
          experience,
          consultation_fee,
          rating,
          profile:profiles(name, email, phone)
        `)
        .eq('is_approved', true)
        .eq('is_available', true)

      // Transform raw data to Doctor type
      const transformedDoctors: Doctor[] = (data as RawDoctor[] || []).map((item) => {
        // Handle profile (could be array or null)
        let profileData = null
        if (item.profile && Array.isArray(item.profile) && item.profile.length > 0) {
          profileData = item.profile[0]
        }
        
        return {
          id: item.id,
          speciality: item.speciality || 'General',
          degree: item.degree || 'MBBS',
          experience: item.experience || 0,
          consultation_fee: item.consultation_fee || 0,
          rating: item.rating || 5.0,
          profile: profileData
        }
      })

      setDoctors(transformedDoctors)
      setFilteredDoctors(transformedDoctors)
      
      const uniqueSpecs = [...new Set(transformedDoctors.map(d => d.speciality).filter(Boolean))] as string[]
      setSpecialities(uniqueSpecs)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  // Load doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      await fetchDoctors()
    }
    loadDoctors()
  }, [])

  // Apply filters when dependencies change
  useEffect(() => {
    const applyFilters = () => {
      filterDoctors()
    }
    applyFilters()
  }, [filterDoctors])

  const bookAppointment = (doctorId: string) => {
    if (!profile) {
      toast.error('Please login to book appointment')
      router.push('/')
      return
    }
    router.push(`/patient/book-appointment?doctorId=${doctorId}`)
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
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark mb-2">Find Doctors</h1>
      <p className="text-text-grey mb-6">Search and book appointment with top doctors</p>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-grey">🔍</span>
          <input
            type="text"
            placeholder="Search by doctor name or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Speciality Filter */}
        {specialities.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSpeciality('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedSpeciality === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-grey hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {specialities.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpeciality(spec)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedSpeciality === spec
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-grey hover:bg-gray-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Doctors Count */}
      <div className="mb-4">
        <p className="text-text-grey">
          <span className="font-semibold text-primary">{filteredDoctors.length}</span> Doctors Found
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition cursor-pointer" onClick={() => bookAppointment(doctor.id)}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-teal-dark">{doctor.profile?.name || 'Doctor'}</h3>
                <p className="text-text-grey text-sm">{doctor.degree || 'MBBS'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary font-semibold">{doctor.speciality || 'General'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{doctor.rating || 5.0}</span>
                <span className="text-text-grey text-sm">({doctor.experience}+ yrs exp)</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">৳{doctor.consultation_fee}</p>
                <p className="text-xs text-text-grey">per consultation</p>
              </div>
            </div>
            
            <button className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition font-medium">
              View Profile & Book
            </button>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-grey">No doctors found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}