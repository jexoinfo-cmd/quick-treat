'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface HospitalSignupForm {
  hospital_name: string
  dghs_license: string
  email: string
  phone: string
  whatsapp_number: string
  district: string
  upazila: string
  address: string
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

interface AuthError {
  message: string
}

export default function HospitalSignup({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<HospitalSignupForm>()

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
      }
    }
    loadUpazilas()
  }, [selectedDistrict])

  const onSubmit = async (data: HospitalSignupForm) => {
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
      // First check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle()

      if (existingUser) {
        toast.error('This email is already registered. Please login instead.')
        setIsLoading(false)
        return
      }

      // Check if DGHS license already exists
      const { data: existingHospital } = await supabase
        .from('hospitals')
        .select('dghs_license')
        .eq('dghs_license', data.dghs_license)
        .maybeSingle()

      if (existingHospital) {
        toast.error('DGHS license number already registered')
        setIsLoading(false)
        return
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.hospital_name,
            role: 'hospital',
            phone: data.phone,
            is_approved: false
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          toast.error('This email is already registered. Please login instead.')
        } else {
          throw signUpError
        }
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: data.hospital_name,
            email: data.email,
            phone: data.phone,
            role: 'hospital',
            district: data.district,
            upazila: data.upazila,
            is_approved: false
          })

        if (profileError) throw profileError

        // Create hospital record (pending approval)
        const { error: hospitalError } = await supabase
          .from('hospitals')
          .insert({
            id: authData.user.id,
            dghs_license: data.dghs_license,
            whatsapp_number: data.whatsapp_number,
            address: data.address,
            total_beds: 0,
            available_beds: 0,
            has_oxygen: false,
            has_ot: false,
            is_approved: false
          })

        if (hospitalError) throw hospitalError

        toast.success('Registration submitted! Please wait for admin approval.')
        onClose()
        
        // Auto login and redirect to pending approval page
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        })
        
        if (!signInError) {
          router.push('/hospital/pending-approval')
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      const authError = error as AuthError
      toast.error(authError.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Hospital Name *</label>
          <input
            type="text"
            placeholder="City Hospital Ltd."
            {...register('hospital_name', { required: 'Hospital name is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.hospital_name && <p className="text-error text-sm mt-1">{errors.hospital_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">DGHS License Number *</label>
          <input
            type="text"
            placeholder="DGHS-12345"
            {...register('dghs_license', { required: 'DGHS license is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.dghs_license && <p className="text-error text-sm mt-1">{errors.dghs_license.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            placeholder="hospital@example.com"
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
            placeholder="02-XXXXXXX"
            {...register('phone', { required: 'Phone number is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
          <input
            type="tel"
            placeholder="01712-345678"
            {...register('whatsapp_number')}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full Address *</label>
          <textarea
            placeholder="House #123, Road #45, Block #C..."
            {...register('address', { required: 'Address is required' })}
            rows={2}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.address && <p className="text-error text-sm mt-1">{errors.address.message}</p>}
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
        {isLoading ? 'Submitting...' : 'Register Hospital'}
      </button>
      
      <p className="text-center text-sm text-text-grey">
        Your registration will be reviewed by admin. You will be notified once approved.
      </p>
    </form>
  )
}