'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
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

export default function PatientSignup({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<PatientSignupForm>()

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

  // Fixed useEffect with wrapper function
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

  const onSubmit = async (data: PatientSignupForm) => {
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
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle()

      if (existingUser) {
        toast.error('This email is already registered')
        setIsLoading(false)
        return
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'patient',
            phone: data.phone,
            whatsapp: data.whatsapp,
            district: data.district,
            upazila: data.upazila,
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
            name: data.name,
            email: data.email,
            phone: data.phone,
            whatsapp: data.whatsapp,
            role: 'patient',
            district: data.district,
            upazila: data.upazila,
            date_of_birth: data.date_of_birth,
            blood_group: data.blood_group,
            is_approved: true
          })

        if (profileError) throw profileError

        toast.success('Account created successfully!')
        onClose()
        
        // Auto login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        })
        
        if (!signInError) {
          router.push('/patient/dashboard')
          router.refresh()
        } else {
          router.push('/')
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            placeholder="Md. Rahman"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            placeholder="patient@example.com"
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
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            {...register('date_of_birth')}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Blood Group</label>
          <select
            {...register('blood_group')}
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
        {isLoading ? 'Creating Account...' : 'Sign Up as Patient'}
      </button>
    </form>
  )
}