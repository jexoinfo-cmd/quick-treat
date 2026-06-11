'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface DoctorSignupForm {
  name: string
  email: string
  phone: string
  whatsapp: string
  bmdc_number: string
  speciality: string
  degree: string
  experience: string
  consultation_fee: string
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

const specialities = [
  'Cardiologist (হৃদরোগ বিশেষজ্ঞ)',
  'Neurologist (স্নায়ুরোগ বিশেষজ্ঞ)',
  'Orthopedic (হাড় ও জয়েন্ট)',
  'Pediatrician (শিশু বিশেষজ্ঞ)',
  'Gynecologist (স্ত্রীরোগ বিশেষজ্ঞ)',
  'Dermatologist (চর্ম বিশেষজ্ঞ)',
  'Psychiatrist (মানসিক রোগ বিশেষজ্ঞ)',
  'ENT Specialist (কান-নাক-গলা)',
  'Ophthalmologist (চক্ষু বিশেষজ্ঞ)',
  'Dentist (দন্ত বিশেষজ্ঞ)',
  'Urologist (মূত্ররোগ বিশেষজ্ঞ)',
  'Gastroenterologist (গ্যাস্ট্রো বিশেষজ্ঞ)'
]

const degrees = ['MBBS', 'MD', 'MS', 'FCPS', 'BDS', 'MDS', 'PhD', 'FRCS']

export default function DoctorSignup({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<DoctorSignupForm>()

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

  const onSubmit = async (data: DoctorSignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('========== DOCTOR SIGNUP START ==========')
      console.log('Form Data:', { 
        name: data.name, 
        email: data.email, 
        phone: data.phone,
        whatsapp: data.whatsapp,
        bmdc: data.bmdc_number,
        speciality: data.speciality,
        district: data.district,
        upazila: data.upazila
      })
      
      // Check if email already exists
      console.log('Step 1: Checking existing email...')
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle()

      if (emailCheckError) {
        console.error('Email check error:', emailCheckError)
      }

      if (existingUser) {
        console.log('Email already exists:', data.email)
        toast.error('This email is already registered')
        setIsLoading(false)
        return
      }
      console.log('Step 1: OK - Email available')

      // Check if BMDC number already exists
      console.log('Step 2: Checking existing BMDC...')
      const { data: existingDoctor, error: bmdcCheckError } = await supabase
        .from('doctors')
        .select('bmdc_number')
        .eq('bmdc_number', data.bmdc_number)
        .maybeSingle()

      if (bmdcCheckError) {
        console.error('BMDC check error:', bmdcCheckError)
      }

      if (existingDoctor) {
        console.log('BMDC already exists:', data.bmdc_number)
        toast.error('BMDC number already registered')
        setIsLoading(false)
        return
      }
      console.log('Step 2: OK - BMDC available')

      // Create user account
      console.log('Step 3: Creating auth user...')
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'doctor',
            phone: data.phone,
            whatsapp: data.whatsapp,
            district: data.district,
            upazila: data.upazila,
            is_approved: false
          }
        }
      })

      if (signUpError) {
        console.error('Signup error details:', signUpError)
        console.error('Error message:', signUpError.message)
        toast.error(`Signup failed: ${signUpError.message}`)
        setIsLoading(false)
        return
      }

      console.log('Step 3: OK - Auth user created:', authData.user?.id)
      
      if (authData.user) {
        // Create profile
        console.log('Step 4: Creating profile...')
        const profileData = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp,
          role: 'doctor',
          district: data.district,
          upazila: data.upazila,
          is_approved: false
        }
        console.log('Profile data:', profileData)
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Profile insert error:', profileError)
          console.error('Error details:', profileError.message, profileError.details, profileError.hint)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
        console.log('Step 4: OK - Profile created')

        // Create doctor record
        console.log('Step 5: Creating doctor record...')
        const doctorData = {
          user_id: authData.user.id,
          bmdc_number: data.bmdc_number,
          speciality: data.speciality,
          degree: data.degree,
          experience: parseInt(data.experience),
          consultation_fee: parseFloat(data.consultation_fee),
          is_available: false,
          is_approved: false
        }
        console.log('Doctor data:', doctorData)
        
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert(doctorData)

        if (doctorError) {
          console.error('Doctor insert error:', doctorError)
          console.error('Error details:', doctorError.message, doctorError.details, doctorError.hint)
          throw new Error(`Doctor record creation failed: ${doctorError.message}`)
        }
        console.log('Step 5: OK - Doctor record created')

        console.log('========== SIGNUP SUCCESS ==========')
        toast.success('Registration submitted! Please wait for admin approval.')
        onClose()
        
        // Auto login and redirect
        console.log('Step 6: Auto login...')
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        })
        
        if (!signInError) {
          console.log('Step 6: OK - Redirecting to pending approval')
          router.push('/doctor/pending-approval')
        } else {
          console.error('Auto login error:', signInError)
        }
      }
    } catch (error) {
      console.error('========== SIGNUP FAILED ==========')
      console.error('Error object:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        toast.error(error.message)
      } else {
        console.error('Unknown error type:', typeof error)
        toast.error('Signup failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            placeholder="Dr. Md. Rahman"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            placeholder="doctor@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <input
            type="tel"
            placeholder="01712-345678"
            {...register('phone', { required: 'Phone is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
          <input
            type="tel"
            placeholder="01712-345678"
            {...register('whatsapp')}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">BMDC Number *</label>
          <input
            type="text"
            placeholder="BMDC-12345"
            {...register('bmdc_number', { required: 'BMDC number is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.bmdc_number && <p className="text-error text-sm mt-1">{errors.bmdc_number.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Speciality *</label>
          <select
            {...register('speciality', { required: 'Speciality is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Speciality</option>
            {specialities.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          {errors.speciality && <p className="text-error text-sm mt-1">{errors.speciality.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Degree *</label>
          <select
            {...register('degree', { required: 'Degree is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Degree</option>
            {degrees.map(deg => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>
          {errors.degree && <p className="text-error text-sm mt-1">{errors.degree.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Experience (years) *</label>
          <input
            type="number"
            placeholder="5"
            {...register('experience', { required: 'Experience is required', min: 0 })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.experience && <p className="text-error text-sm mt-1">{errors.experience.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Consultation Fee (৳) *</label>
          <input
            type="number"
            placeholder="800"
            {...register('consultation_fee', { required: 'Consultation fee is required', min: 0 })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.consultation_fee && <p className="text-error text-sm mt-1">{errors.consultation_fee.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">District *</label>
          <select
            {...register('district', { required: 'District is required' })}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.district && <p className="text-error text-sm mt-1">{errors.district.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upazila/Thana *</label>
          <select
            {...register('upazila', { required: 'Upazila is required' })}
            disabled={!selectedDistrict}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          >
            <option value="">Select Upazila</option>
            {upazilas.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {errors.upazila && <p className="text-error text-sm mt-1">{errors.upazila.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            {...register('password', { 
              required: 'Password is required', 
              minLength: { value: 6, message: 'Minimum 6 characters' }
            })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password *</label>
          <input
            type="password"
            placeholder="Confirm password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password'
            })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 mt-4"
      >
        {isLoading ? 'Submitting...' : 'Submit for Approval'}
      </button>
      
      <p className="text-center text-sm text-text-grey">
        Your registration will be reviewed by admin. You will be notified once approved.
      </p>
    </form>
  )
}