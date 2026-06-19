// src/app/desk-register/page.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// ============ TYPES ============
interface DoctorFormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  bmdcNumber: string
  specialty: string
  qualification: string
  experience: string
  consultationFee: string
  visitFee: string
  about: string
  district: string
  upazila: string
  address: string
  password: string
  confirmPassword: string
}

interface HospitalFormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  dghsLicense: string
  tinNumber: string
  district: string
  upazila: string
  address: string
  postalCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyRelationship: string
  facilities: string[]
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

const specialties = [
  'Cardiologist', 'Neurologist', 'Orthopedic', 'Pediatrician',
  'Gynecologist', 'Dermatologist', 'Psychiatrist', 'ENT Specialist',
  'Ophthalmologist', 'Dentist', 'Urologist', 'Gastroenterologist',
  'Endocrinologist', 'Nephrologist', 'Oncologist', 'General Physician'
]

const qualifications = ['MBBS', 'MD', 'MS', 'FCPS', 'BDS', 'MDS', 'PhD', 'FRCS', 'MRCP']

const facilities = ['Emergency', 'ICU', 'CCU', 'NICU', 'Ambulance', 'Oxygen', 'Operation Theater', 'Pharmacy']

const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other']

export default function DeskRegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'doctor' | 'hospital'>('doctor')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // Doctor Form
  const [doctorData, setDoctorData] = useState<DoctorFormData>({
    name: '', email: '', phone: '', whatsapp: '',
    bmdcNumber: '', specialty: '', qualification: '', experience: '',
    consultationFee: '', visitFee: '', about: '',
    district: '', upazila: '', address: '',
    password: '', confirmPassword: ''
  })

  // Hospital Form
  const [hospitalData, setHospitalData] = useState<HospitalFormData>({
    name: '', email: '', phone: '', whatsapp: '',
    dghsLicense: '', tinNumber: '',
    district: '', upazila: '', address: '', postalCode: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyRelationship: '',
    facilities: [],
    password: '', confirmPassword: ''
  })

  // ============ FETCH DISTRICTS & UPAZILAS ============
  const fetchDistricts = useCallback(async () => {
    const { data } = await supabase.from('districts').select('id, name').order('name')
    setDistricts(data || [])
  }, [])

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

  useEffect(() => {
    fetchDistricts()
  }, [fetchDistricts])

  useEffect(() => {
    if (selectedDistrict) {
      fetchUpazilas(selectedDistrict)
    } else {
      setUpazilas([])
    }
  }, [selectedDistrict, fetchUpazilas])

  // ============ HANDLERS ============
  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDoctorData(prev => ({ ...prev, [name]: value }))
  }

  const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setHospitalData(prev => ({ ...prev, [name]: value }))
  }

  const handleFacilityToggle = (facility: string) => {
    setHospitalData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedDistrict(value)
    if (userType === 'doctor') {
      setDoctorData(prev => ({ ...prev, district: value, upazila: '' }))
    } else {
      setHospitalData(prev => ({ ...prev, district: value, upazila: '' }))
    }
    fetchUpazilas(value)
  }

  // ============ VALIDATION ============
  const validateDoctorStep = (step: number) => {
    switch(step) {
      case 1:
        if (!doctorData.name || !doctorData.email || !doctorData.phone) {
          toast.error('Please fill all required fields')
          return false
        }
        if (!doctorData.email.includes('@')) {
          toast.error('Please enter a valid email')
          return false
        }
        return true
      case 2:
        if (!doctorData.bmdcNumber || !doctorData.specialty || !doctorData.qualification) {
          toast.error('Please fill all required fields')
          return false
        }
        if (!doctorData.consultationFee || parseInt(doctorData.consultationFee) <= 0) {
          toast.error('Please enter a valid consultation fee')
          return false
        }
        return true
      case 3:
        if (!doctorData.district || !doctorData.upazila) {
          toast.error('Please select district and upazila')
          return false
        }
        return true
      case 4:
        if (doctorData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (doctorData.password !== doctorData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  const validateHospitalStep = (step: number) => {
    switch(step) {
      case 1:
        if (!hospitalData.name || !hospitalData.email || !hospitalData.phone) {
          toast.error('Please fill all required fields')
          return false
        }
        if (!hospitalData.email.includes('@')) {
          toast.error('Please enter a valid email')
          return false
        }
        return true
      case 2:
        if (!hospitalData.dghsLicense || !hospitalData.district || !hospitalData.upazila) {
          toast.error('Please fill all required fields')
          return false
        }
        return true
      case 3:
        // Facilities is optional - just show review
        return true
      case 4:
        if (hospitalData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (hospitalData.password !== hospitalData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  // ============ NAVIGATION ============
  const nextStep = () => {
    if (userType === 'doctor') {
      if (validateDoctorStep(currentStep)) {
        setCurrentStep(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      if (validateHospitalStep(currentStep)) {
        setCurrentStep(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ============ SUBMIT ============
  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      if (userType === 'doctor') {
        // Check email
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', doctorData.email)
          .maybeSingle()

        if (existingUser) {
          toast.error('This email is already registered')
          setIsLoading(false)
          return
        }

        // Check BMDC
        const { data: existingDoctor } = await supabase
          .from('doctors')
          .select('bmdc_number')
          .eq('bmdc_number', doctorData.bmdcNumber)
          .maybeSingle()

        if (existingDoctor) {
          toast.error('BMDC number already registered')
          setIsLoading(false)
          return
        }

        // Create user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: doctorData.email,
          password: doctorData.password,
          options: {
            data: {
              name: doctorData.name,
              role: 'doctor',
              phone: doctorData.phone,
              whatsapp: doctorData.whatsapp,
              district: doctorData.district,
              upazila: doctorData.upazila,
              is_approved: false
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
          await supabase.from('profiles').insert({
            id: authData.user.id,
            name: doctorData.name,
            email: doctorData.email,
            phone: doctorData.phone,
            whatsapp: doctorData.whatsapp,
            role: 'doctor',
            district: doctorData.district,
            upazila: doctorData.upazila,
            is_approved: false
          })

          // Create doctor
          await supabase.from('doctors').insert({
            user_id: authData.user.id,
            bmdc_number: doctorData.bmdcNumber,
            speciality: doctorData.specialty,
            degree: doctorData.qualification,
            experience: parseInt(doctorData.experience) || 0,
            consultation_fee: parseFloat(doctorData.consultationFee) || 0,
            about_en: doctorData.about,
            is_available: false,
            is_approved: false
          })

          toast.success('Registration submitted for approval!')
          
          // Auto login
          await supabase.auth.signInWithPassword({
            email: doctorData.email,
            password: doctorData.password
          })
          
          router.push('/doctor/pending-approval')
        }
      } else {
        // Hospital Registration
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', hospitalData.email)
          .maybeSingle()

        if (existingUser) {
          toast.error('This email is already registered')
          setIsLoading(false)
          return
        }

        const { data: existingHospital } = await supabase
          .from('hospitals')
          .select('dghs_license')
          .eq('dghs_license', hospitalData.dghsLicense)
          .maybeSingle()

        if (existingHospital) {
          toast.error('DGHS license already registered')
          setIsLoading(false)
          return
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: hospitalData.email,
          password: hospitalData.password,
          options: {
            data: {
              name: hospitalData.name,
              role: 'hospital',
              phone: hospitalData.phone,
              whatsapp: hospitalData.whatsapp,
              is_approved: false
            }
          }
        })

        if (signUpError) {
          toast.error(signUpError.message)
          setIsLoading(false)
          return
        }

        if (authData.user) {
          await supabase.from('profiles').insert({
            id: authData.user.id,
            name: hospitalData.name,
            email: hospitalData.email,
            phone: hospitalData.phone,
            whatsapp: hospitalData.whatsapp,
            role: 'hospital',
            district: hospitalData.district,
            upazila: hospitalData.upazila,
            is_approved: false
          })

          await supabase.from('hospitals').insert({
            id: authData.user.id,
            dghs_license: hospitalData.dghsLicense,
            whatsapp_number: hospitalData.whatsapp,
            address: hospitalData.address,
            is_approved: false
          })

          toast.success('Registration submitted for approval!')
          
          await supabase.auth.signInWithPassword({
            email: hospitalData.email,
            password: hospitalData.password
          })
          
          router.push('/hospital/pending-approval')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ RENDER ============
  const renderDoctorSteps = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Full Name *</label>
                <input name="name" type="text" placeholder="Enter your full name" value={doctorData.name} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Email Address *</label>
                <input name="email" type="email" placeholder="Enter your email" value={doctorData.email} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Phone Number *</label>
                <input name="phone" type="tel" placeholder="Enter phone number" value={doctorData.phone} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp Number</label>
                <input name="whatsapp" type="tel" placeholder="Enter WhatsApp number" value={doctorData.whatsapp} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Professional Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">BMDC Number *</label>
                <input name="bmdcNumber" type="text" placeholder="e.g. A-123456" value={doctorData.bmdcNumber} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Specialty *</label>
                <select name="specialty" value={doctorData.specialty} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                  <option value="">Select specialty</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Qualification/Degree *</label>
                <select name="qualification" value={doctorData.qualification} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                  <option value="">Select qualification</option>
                  {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Experience (Years)</label>
                <input name="experience" type="number" placeholder="e.g. 5" value={doctorData.experience} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Consultation Fee (৳) *</label>
                <input name="consultationFee" type="number" placeholder="e.g. 800" value={doctorData.consultationFee} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Visit Fee (Optional)</label>
                <input name="visitFee" type="number" placeholder="e.g. 500" value={doctorData.visitFee} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">About Yourself (Optional)</label>
                <textarea name="about" rows={3} placeholder="Write about your experience, skills, and expertise..." value={doctorData.about} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none" />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Address & Documents</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">District *</label>
                <select name="district" value={doctorData.district} onChange={handleDistrictChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Upazila/Thana *</label>
                <select name="upazila" value={doctorData.upazila} onChange={handleDoctorChange} disabled={!selectedDistrict} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50">
                  <option value="">Select upazila</option>
                  {upazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Full Address</label>
                <textarea name="address" rows={2} placeholder="Enter your full address" value={doctorData.address} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none" />
              </div>
            </div>
            <div className="bg-teal-light/30 rounded-xl p-4">
              <h3 className="font-semibold text-teal-dark mb-2">Documents Required</h3>
              <ul className="text-sm text-text-grey space-y-2">
                <li className="flex items-center gap-2">📄 BMDC Registration Certificate</li>
                <li className="flex items-center gap-2">🪪 National ID Card</li>
                <li className="flex items-center gap-2">🎓 Academic Certificate (Highest Degree)</li>
                <li className="flex items-center gap-2">📸 Profile Picture</li>
              </ul>
              <p className="text-xs text-text-grey mt-3">All documents are securely encrypted and used only for verification purposes.</p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Account Setup</h2>
            <p className="text-text-grey text-sm">Create a strong password to secure your account.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Password *</label>
                <input name="password" type="password" placeholder="Minimum 6 characters" value={doctorData.password} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Confirm Password *</label>
                <input name="confirmPassword" type="password" placeholder="Confirm your password" value={doctorData.confirmPassword} onChange={handleDoctorChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
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
          </div>
        )
      default:
        return null
    }
  }

  const renderHospitalSteps = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Hospital Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Hospital / Clinic Name *</label>
                <input name="name" type="text" placeholder="Enter hospital or clinic name" value={hospitalData.name} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Email Address *</label>
                <input name="email" type="email" placeholder="Enter email address" value={hospitalData.email} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Phone Number *</label>
                <input name="phone" type="tel" placeholder="Enter phone number" value={hospitalData.phone} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp Number</label>
                <input name="whatsapp" type="tel" placeholder="Enter WhatsApp number" value={hospitalData.whatsapp} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">License & Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">DGHS License Number *</label>
                <input name="dghsLicense" type="text" placeholder="e.g. DGHS-123456" value={hospitalData.dghsLicense} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">TIN Number (Optional)</label>
                <input name="tinNumber" type="text" placeholder="e.g. 123456789012" value={hospitalData.tinNumber} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">District *</label>
                <select name="district" value={hospitalData.district} onChange={handleDistrictChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Upazila/Thana *</label>
                <select name="upazila" value={hospitalData.upazila} onChange={handleHospitalChange} disabled={!selectedDistrict} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50">
                  <option value="">Select upazila</option>
                  {upazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-1">Full Address *</label>
                <textarea name="address" rows={2} placeholder="Enter full address of hospital/clinic" value={hospitalData.address} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Postal Code (Optional)</label>
                <input name="postalCode" type="text" placeholder="Enter postal code" value={hospitalData.postalCode} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Facilities & Emergency Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-2">Available Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {facilities.map(f => (
                    <label key={f} className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-teal-light/30 transition cursor-pointer">
                      <input type="checkbox" checked={hospitalData.facilities.includes(f)} onChange={() => handleFacilityToggle(f)} className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Emergency Contact Name</label>
                <input name="emergencyContactName" type="text" placeholder="Enter contact name" value={hospitalData.emergencyContactName} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Emergency Phone</label>
                <input name="emergencyContactPhone" type="tel" placeholder="Enter phone number" value={hospitalData.emergencyContactPhone} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Relationship</label>
                <select name="emergencyRelationship" value={hospitalData.emergencyRelationship} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                  <option value="">Select relationship</option>
                  {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-teal-light/30 rounded-xl p-4">
              <h3 className="font-semibold text-teal-dark mb-2">Documents Required</h3>
              <ul className="text-sm text-text-grey space-y-2">
                <li className="flex items-center gap-2">📄 DGHS License Certificate</li>
                <li className="flex items-center gap-2">📄 Trade License</li>
                <li className="flex items-center gap-2">📄 TIN Certificate (Optional)</li>
                <li className="flex items-center gap-2">📸 Hospital Logo</li>
              </ul>
              <p className="text-xs text-text-grey mt-3">All documents are securely encrypted and used only for verification purposes.</p>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-teal-dark">Account Setup</h2>
            <p className="text-text-grey text-sm">Create a strong password to secure your account.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Password *</label>
                <input name="password" type="password" placeholder="Minimum 6 characters" value={hospitalData.password} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Confirm Password *</label>
                <input name="confirmPassword" type="password" placeholder="Confirm your password" value={hospitalData.confirmPassword} onChange={handleHospitalChange} className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" required />
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
          </div>
        )
      default:
        return null
    }
  }

  const getTotalSteps = () => {
    return userType === 'doctor' ? 4 : 4
  }

  const getStepLabel = (step: number) => {
    if (userType === 'doctor') {
      const labels = ['Personal Info', 'Professional Info', 'Address & Docs', 'Account Setup']
      return labels[step - 1] || ''
    } else {
      const labels = ['Hospital Info', 'License & Address', 'Facilities', 'Account Setup']
      return labels[step - 1] || ''
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-dark">
                {userType === 'doctor' ? 'Doctor Registration' : 'Hospital Registration'}
              </h1>
              <p className="text-text-grey text-sm mt-2">
                {userType === 'doctor' 
                  ? 'Join as a doctor and start managing your appointments & patients.'
                  : 'Register your hospital/clinic and manage everything in one place.'}
              </p>
            </div>

            {/* User Type Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border mb-8">
              <button
                onClick={() => { setUserType('doctor'); setCurrentStep(1); setSelectedDistrict('') }}
                className={`flex-1 py-3 text-center font-medium transition ${
                  userType === 'doctor' ? 'bg-primary text-white' : 'bg-gray-50 text-text-grey hover:bg-gray-100'
                }`}
              >
                👨‍⚕️ Doctor
              </button>
              <button
                onClick={() => { setUserType('hospital'); setCurrentStep(1); setSelectedDistrict('') }}
                className={`flex-1 py-3 text-center font-medium transition ${
                  userType === 'hospital' ? 'bg-primary text-white' : 'bg-gray-50 text-text-grey hover:bg-gray-100'
                }`}
              >
                🏥 Hospital
              </button>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between mb-6">
              {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all
                    ${step === currentStep ? 'bg-primary text-white ring-4 ring-primary-light' : 
                      step < currentStep ? 'bg-success text-white' : 'bg-gray-200 text-text-grey'}`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  {step < getTotalSteps() && (
                    <div className={`w-8 sm:w-16 h-1 mx-1 transition-all
                      ${step < currentStep ? 'bg-success' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-[10px] sm:text-xs text-text-grey mb-8 px-1">
              {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
                <span key={step} className={step === currentStep ? 'text-primary font-medium' : ''}>
                  {getStepLabel(step)}
                </span>
              ))}
            </div>

            {/* Content - ✅ min-h-[400px] থেকে min-h-100 তে পরিবর্তন */}
            <div className="min-h-100">
              {userType === 'doctor' ? renderDoctorSteps() : renderHospitalSteps()}
            </div>

            {/* Navigation */}
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
              {currentStep < getTotalSteps() ? (
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
                  {isLoading ? 'Submitting...' : 'Submit for Review'}
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

        {/* Why Join Section */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-border">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-teal-dark text-sm">Get More Patients</h3>
            <p className="text-text-grey text-xs">Reach thousands of patients online</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-border">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-teal-dark text-sm">Secure Payments</h3>
            <p className="text-text-grey text-xs">Receive payments securely</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-border">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold text-teal-dark text-sm">Smart Management</h3>
            <p className="text-text-grey text-xs">Manage appointments and queue easily</p>
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