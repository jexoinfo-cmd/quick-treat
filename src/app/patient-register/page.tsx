'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface PatientSignupForm {
  name: string
  email: string
  phone: string
  whatsapp: string
  date_of_birth: string
  blood_group: string
  district: string
  upazila: string
  password: string
  confirmPassword: string
}

interface District {
  id: number
  name: string
}

interface Upazila {
  id: number
  name: string
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function PatientRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [formData, setFormData] = useState<PatientSignupForm>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    date_of_birth: '',
    blood_group: '',
    district: '',
    upazila: '',
    password: '',
    confirmPassword: ''
  })

  // Function declared first
  const fetchDistricts = async () => {
    const { data } = await supabase.from('districts').select('id, name').order('name')
    setDistricts(data || [])
  }

  const fetchUpazilas = async (districtId: string) => {
    const { data } = await supabase
      .from('upazilas')
      .select('id, name')
      .eq('district_id', parseInt(districtId))
      .order('name')
    setUpazilas(data || [])
  }

  // useEffect after function declaration
  useEffect(() => {
    const loadDistricts = async () => {
      await fetchDistricts()
    }
    loadDistricts()
  }, [])

  useEffect(() => {
    const loadUpazilas = async () => {
      if (selectedDistrict) {
        await fetchUpazilas(selectedDistrict)
      } else {
        setUpazilas([])
      }
    }
    loadUpazilas()
  }, [selectedDistrict])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existingUser) {
        toast.error('This email is already registered')
        setIsLoading(false)
        return
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'patient',
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            district: formData.district,
            upazila: formData.upazila,
            is_approved: true
          }
        }
      })

      if (signUpError) {
        toast.error(signUpError.message)
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            role: 'patient',
            district: formData.district,
            upazila: formData.upazila,
            date_of_birth: formData.date_of_birth,
            blood_group: formData.blood_group,
            is_approved: true
          })

        if (profileError) throw profileError

        toast.success('Account created successfully!')
        
        // Auto login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (!signInError) {
          router.push('/patient/dashboard')
        } else {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/assets/icons/logo.png"
                alt="Quick Treat Logo"
                width={48}
                height={48}
                className="rounded-xl object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-xl sm:text-2xl text-teal-dark">Quick Treat</span>
              <p className="text-xs text-text-grey hidden sm:block">Patient Registration</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-primary hover:text-primary-dark text-sm sm:text-base"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/')}
              className="text-text-grey hover:text-text-dark text-sm sm:text-base"
            >
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <h1 className="text-2xl font-bold text-teal-dark">Patient Registration</h1>
                <p className="text-text-grey text-sm mt-2">
                  Create your account to book appointments and manage your health
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Md. Rahman"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="01712-345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="01712-345678"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Group</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => {
                        setFormData({...formData, district: e.target.value})
                        setSelectedDistrict(e.target.value)
                      }}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upazila/Thana *</label>
                    <select
                      value={formData.upazila}
                      onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                      disabled={!selectedDistrict}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                    >
                      <option value="">Select Upazila</option>
                      {upazilas.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Password *</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 mt-4"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up as Patient'}
                </button>
              </form>

              <p className="text-center text-text-grey text-sm mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white mt-12">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">
            © 2026 Quick Treat. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}