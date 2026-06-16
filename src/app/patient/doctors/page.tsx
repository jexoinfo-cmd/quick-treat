'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Doctor {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  rating: number
  profile_image: string
  profile: {
    name: string
    email: string
    phone: string
  }
}

// প্রোফাইলের টাইপ আলাদা করে তৈরি করা হলো
interface ProfileData {
  name: string | null
  email: string | null
  phone: string | null
  profile_image: string | null
}

// ডাক্তারের ডেটার জন্য টাইপ তৈরি করা হলো
interface DoctorData {
  id: string
  speciality: string | null
  degree: string | null
  experience: number | null
  consultation_fee: number | null
  rating: number | null
  profile: ProfileData | ProfileData[] | null
}

export default function FindDoctors() {
  const router = useRouter()
  // useAuthStore থেকে শুধু প্রয়োজনীয় ফাংশন নেওয়া হচ্ছে, profile বাদ দিয়ে
  // const { profile } = useAuthStore() - এই লাইনটি সরিয়ে দেওয়া হয়েছে কারণ ব্যবহার করা হচ্ছে না
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('')
  const [specialities, setSpecialities] = useState<string[]>([])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          speciality,
          degree,
          experience,
          consultation_fee,
          rating,
          profile:profiles(name, email, phone, profile_image)
        `)
        .eq('is_approved', true)
        .eq('is_available', true)

      if (error) throw error
      
      const transformedDoctors: Doctor[] = (data || []).map((item: DoctorData) => {
        // প্রোফাইল ডেটা নিরাপদে হ্যান্ডেল করা
        let profileData = item.profile
        
        // যদি প্রোফাইল অ্যারে হয়, তাহলে প্রথম এলিমেন্ট নেওয়া
        if (Array.isArray(profileData)) {
          profileData = profileData[0] || null
        }
        
        // যদি প্রোফাইল null বা undefined হয়, তাহলে ডিফল্ট অবজেক্ট ব্যবহার করা
        const safeProfile: ProfileData = profileData || {
          name: null,
          email: null,
          phone: null,
          profile_image: null
        }
        
        return {
          id: item.id,
          speciality: item.speciality || 'General',
          degree: item.degree || 'MBBS',
          experience: item.experience || 0,
          consultation_fee: item.consultation_fee || 0,
          rating: item.rating || 5.0,
          profile_image: safeProfile.profile_image || '',
          profile: {
            name: safeProfile.name || 'Doctor',
            email: safeProfile.email || '',
            phone: safeProfile.phone || ''
          }
        }
      })
      
      setDoctors(transformedDoctors)
      setFilteredDoctors(transformedDoctors)
      
      const uniqueSpecs = [...new Set(transformedDoctors.map(d => d.speciality).filter(Boolean))] as string[]
      setSpecialities(uniqueSpecs)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('ডাক্তার লোড করতে সমস্যা হচ্ছে')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadDoctors = async () => {
      await fetchDoctors()
    }
    loadDoctors()
  }, [])

  // useCallback ব্যবহার করে ফাংশনটি মেমোইজ করা হলো
  const filterDoctors = useCallback(() => {
    let filtered = [...doctors]
    
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedSpeciality) {
      filtered = filtered.filter(doctor => doctor.speciality === selectedSpeciality)
    }
    
    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, selectedSpeciality])

  // এখন dependency তে filterDoctors যোগ করা হয়েছে
  useEffect(() => {
    filterDoctors()
  }, [filterDoctors])

  const viewDoctorProfile = (doctorId: string) => {
    router.push(`/patient/doctor-profile/${doctorId}`)
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
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark mb-2">ডাক্তার খুঁজুন</h1>
      <p className="text-text-grey mb-6">শীর্ষ ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন</p>

      {/* সার্চ বার */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-grey">🔍</span>
          <input
            type="text"
            placeholder="ডাক্তারের নাম বা বিশেষত্ব দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* বিশেষত্ব ফিল্টার */}
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
              সব
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

      {/* ডাক্তারদের সংখ্যা */}
      <div className="mb-4">
        <p className="text-text-grey">
          <span className="font-semibold text-primary">{filteredDoctors.length}</span> জন ডাক্তার পাওয়া গেছে
        </p>
      </div>

      {/* ডাক্তারদের গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            onClick={() => viewDoctorProfile(doctor.id)}
            className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              {/* প্রোফাইল ইমেজ - shrink-0 ব্যবহার করা হলো */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-light flex items-center justify-center shrink-0">
                {doctor.profile_image ? (
                  <Image
                    src={doctor.profile_image}
                    alt={doctor.profile.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👨‍⚕️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-teal-dark truncate">{doctor.profile.name}</h3>
                <p className="text-text-grey text-sm truncate">{doctor.degree || 'MBBS'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary font-semibold text-sm truncate">{doctor.speciality || 'General'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{doctor.rating || 5.0}</span>
                <span className="text-text-grey text-sm">({doctor.experience}+ বছর অভিজ্ঞতা)</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">৳{doctor.consultation_fee}</p>
                <p className="text-xs text-text-grey">প্রতি পরামর্শ</p>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                viewDoctorProfile(doctor.id)
              }}
              className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition font-medium"
            >
              প্রোফাইল দেখুন ও বুক করুন
            </button>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-grey">কোন ডাক্তার পাওয়া যায়নি। আপনার সার্চ পরিবর্তন করে দেখুন।</p>
        </div>
      )}
    </div>
  )
}