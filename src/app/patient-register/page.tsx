// src/app/patient-register/page.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Types
interface FormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  weight: string
  height: string
  allergies: string
  district: string
  upazila: string
  postalCode: string
  fullAddress: string
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
const genders = ['Male', 'Female', 'Other']

export default function PatientRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    weight: '',
    height: '',
    allergies: '',
    district: '',
    upazila: '',
    postalCode: '',
    fullAddress: '',
    password: '',
    confirmPassword: ''
  })

  // Fetch districts
  const fetchDistricts = useCallback(async () => {
    const { data } = await supabase.from('districts').select('id, name').order('name')
    setDistricts(data || [])
  }, [])

  // Fetch upazilas
  const fetchUpazilas = useCallback(async (districtId: string) => {
    if (!districtId) {
      setUpazilas([])
      return
    }
    const { data } = await supabase
      .from('upazilas')
      .select('id, name')
      .eq('district_id', parseInt(districtId))
      .order('name')
    setUpazilas(data || [])
  }, [])

  // Load districts
  useEffect(() => {
    fetchDistricts()
  }, [fetchDistricts])

  // Load upazilas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchUpazilas(selectedDistrict)
    } else {
      setUpazilas([])
    }
  }, [selectedDistrict, fetchUpazilas])

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedDistrict(value)
    setFormData({ ...formData, district: value, upazila: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          toast.error('Please fill all required fields')
          return false
        }
        if (!formData.email.includes('@')) {
          toast.error('Please enter a valid email')
          return false
        }
        return true
      case 2:
        if (!formData.bloodGroup || !formData.district || !formData.upazila) {
          toast.error('Please fill all required fields')
          return false
        }
        return true
      case 3:
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsLoading(true)

    try {
      // Check if email exists
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

      // Create user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'patient',
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            gender: formData.gender,
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
            date_of_birth: formData.dateOfBirth,
            blood_group: formData.bloodGroup,
            gender: formData.gender,
            is_approved: true
          })

        if (profileError) {
          console.error('Profile error:', profileError)
          toast.error('Failed to create profile')
          setIsLoading(false)
          return
        }

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

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header - Logo */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/icons/logo.png"
              alt="Quick Treat"
              width={40}
              height={40}
              className="rounded-xl object-cover"
              priority
            />
            <span className="font-bold text-xl text-teal-dark">Quick Treat</span>
          </Link>
          <Link href="/login" className="text-primary hover:text-primary-dark text-sm font-medium">
            Login
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark">
                Patient Registration
              </h1>
              <p className="text-text-grey text-sm mt-2">
                Create your account to book appointments and manage your health easily.
              </p>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all
                    ${step === currentStep ? 'bg-primary text-white ring-4 ring-primary-light' : 
                      step < currentStep ? 'bg-success text-white' : 'bg-gray-200 text-text-grey'}`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  {step < totalSteps && (
                    <div className={`w-12 sm:w-20 h-1 mx-2 transition-all
                      ${step < currentStep ? 'bg-success' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs text-text-grey mb-8 px-2">
              <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>Personal Info</span>
              <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>Medical Info</span>
              <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>Account Setup</span>
            </div>

            {/* Step Content - ✅ ফিক্স করা হয়েছে */}
            <div className="min-h-100">
              {/* Step 1 - Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-teal-dark mb-4">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Phone Number *</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp Number</label>
                      <input
                        name="whatsapp"
                        type="tel"
                        placeholder="Enter WhatsApp number"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Date of Birth</label>
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      >
                        <option value="">Select gender</option>
                        {genders.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 - Medical Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-teal-dark mb-4">Medical Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Blood Group *</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Weight (kg)</label>
                      <input
                        name="weight"
                        type="number"
                        placeholder="e.g. 65"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Height (cm)</label>
                      <input
                        name="height"
                        type="number"
                        placeholder="e.g. 170"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-text-dark mb-1">Allergies (If any)</label>
                      <input
                        name="allergies"
                        type="text"
                        placeholder="e.g. Penicillin, Nuts, etc."
                        value={formData.allergies}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">District *</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleDistrictChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      >
                        <option value="">Select district</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Upazila/Thana *</label>
                      <select
                        name="upazila"
                        value={formData.upazila}
                        onChange={handleChange}
                        disabled={!selectedDistrict}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm disabled:opacity-50"
                      >
                        <option value="">Select upazila</option>
                        {upazilas.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-text-dark mb-1">Full Address *</label>
                      <textarea
                        name="fullAddress"
                        placeholder="Enter your full address"
                        value={formData.fullAddress}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Postal Code (Optional)</label>
                      <input
                        name="postalCode"
                        type="text"
                        placeholder="Enter postal code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Account Setup */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-teal-dark mb-4">Account Setup</h2>
                  <p className="text-text-grey text-sm mb-4">Create a strong password to secure your account.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Password *</label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-1">Confirm Password *</label>
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="bg-teal-light/30 rounded-xl p-4">
                    <p className="text-sm font-medium text-text-dark mb-2">Password must contain:</p>
                    <ul className="text-sm text-text-grey space-y-1">
                      <li className="flex items-center gap-2">• At least 8 characters</li>
                      <li className="flex items-center gap-2">• One uppercase letter</li>
                      <li className="flex items-center gap-2">• One number</li>
                      <li className="flex items-center gap-2">• One special character</li>
                    </ul>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Profile Picture (Optional)</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition">
                      <input type="file" accept="image/*" className="hidden" id="profilePic" />
                      <label htmlFor="profilePic" className="cursor-pointer">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-text-grey text-sm">Upload your photo</p>
                        <p className="text-text-grey text-xs">JPG, PNG – Max 2MB</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={prevStep}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-text-grey cursor-not-allowed'
                    : 'border border-border text-text-dark hover:bg-gray-50'
                }`}
                disabled={currentStep === 1}
              >
                Back
              </button>
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors active:scale-95"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success/80 transition-colors active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-text-grey text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white mt-12">
        <div className="px-4 py-6 text-center text-white/60 text-sm">
          © 2026 Quick Treat. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}