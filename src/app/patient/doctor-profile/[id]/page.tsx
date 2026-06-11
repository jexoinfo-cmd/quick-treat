'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface DoctorProfile {
  id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  followup_fee: number
  rating: number
  about_en: string
  about_bn: string
  profile: {
    name: string
    email: string
    phone: string
  }
}

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  // Function with useCallback
  const fetchDoctor = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(name, email, phone)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setDoctor(data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
      toast.error('Failed to load doctor profile')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // useEffect with proper dependency
  useEffect(() => {
    const loadDoctor = async () => {
      await fetchDoctor()
    }
    loadDoctor()
  }, [fetchDoctor])

  const bookAppointment = () => {
    if (!profile) {
      toast.error('Please login to book appointment')
      router.push('/')
      return
    }
    router.push(`/patient/book-appointment?doctorId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">Doctor not found</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Doctor Header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-teal-light rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍⚕️</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-teal-dark">{doctor.profile.name}</h1>
            <p className="text-text-grey">{doctor.degree}</p>
            <p className="text-primary font-medium mt-1">{doctor.speciality}</p>
            <p className="text-text-grey text-sm mt-2">BMDC No.: Registered</p>
            <p className="text-text-grey text-sm">Doctor Code: DR{doctor.id.slice(0, 6)}</p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">{doctor.experience}+</p>
                <p className="text-xs text-text-grey">Years Exp.</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">4+</p>
                <p className="text-xs text-text-grey">Patients</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">{doctor.rating}</p>
                <p className="text-xs text-text-grey">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">3+</p>
                <p className="text-xs text-text-grey">Reviews</p>
              </div>
            </div>
            <button
              onClick={bookAppointment}
              className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition"
            >
              Get Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'info'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'experience'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          Experience
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'reviews'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">Schedule Time & Date</h2>
            <div className="space-y-2">
              <p className="text-text-grey">Saturday (08:00 PM - 11:30 PM)</p>
              <p className="text-text-grey">Sunday (12:30 PM - 11:00 PM)</p>
              <p className="text-text-grey">Monday Off</p>
              <p className="text-text-grey">Tuesday (05:30 PM - 11:00 PM)</p>
              <p className="text-text-grey">Wednesday (02:30 PM - 11:55 PM)</p>
              <p className="text-text-grey">Thursday (03:00 PM - 11:45 PM)</p>
              <p className="text-text-grey">Friday (11:00 AM - 10:00 PM)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">Consultation Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">First Visit Fee</span>
                <span className="font-medium line-through text-text-grey">৳{doctor.consultation_fee + 200}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Visit Fee (Discounted)</span>
                <span className="font-bold text-primary text-xl">৳{doctor.consultation_fee}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Avg. Consultation Time</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Joined</span>
                <span className="font-medium">09 Apr, 2026</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">About</h2>
            <p className="text-text-grey leading-relaxed">
              {doctor.about_en || `ডাঃ ${doctor.profile.name} একজন অভিজ্ঞ ${doctor.speciality} বিশেষজ্ঞ। তিনি ${doctor.experience} বছরের বেশি অভিজ্ঞতা সম্পন্ন একজন চিকিৎসক।`}
            </p>
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold text-teal-dark">Dhaka Medical College & Hospital</h3>
              <p className="text-text-grey text-sm">Designation: FCPS (Final Part)</p>
              <p className="text-text-grey text-sm">Department: Obstetrics and Gynaecology</p>
              <p className="text-text-grey text-sm">Period: 6 Months (01 Jul, 2023 - Present)</p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold text-teal-dark">Cumilla Medical College & Hospital</h3>
              <p className="text-text-grey text-sm">Designation: Honorary Medical Officer</p>
              <p className="text-text-grey text-sm">Department: Dept of Obstetrics and Gynaecology</p>
              <p className="text-text-grey text-sm">Period: 11 Months (01 Jul, 2019 - 30 Jun, 2020)</p>
            </div>
            <div>
              <h3 className="font-semibold text-teal-dark">Seba Diagnostic Centre and Hospital</h3>
              <p className="text-text-grey text-sm">Designation: Senior Medical Officer</p>
              <p className="text-text-grey text-sm">Department: Dept of Obs and Gyne</p>
              <p className="text-text-grey text-sm">Period: 2 Years 11 Months (01 Jul, 2020 - 30 Jun, 2023)</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="text-center py-8">
            <p className="text-text-grey">No reviews yet</p>
            <p className="text-sm text-text-grey mt-2">Be the first to review this doctor</p>
          </div>
        </div>
      )}
    </div>
  )
}