'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface DisplayDoctor {
  id: string
  user_id: string
  speciality: string
  degree: string
  experience: number
  consultation_fee: number
  is_available: boolean
  name: string
  email: string
  phone: string
  profile_image: string
}

interface FormData {
  name: string
  email: string
  phone: string
  speciality: string
  degree: string
  experience: string
  consultation_fee: string
}

// প্রোফাইলের টাইপ আলাদা করে তৈরি করা হলো
interface ProfileData {
  name: string | null
  email: string | null
  phone: string | null
  profile_image: string | null
}

// ডাক্তার ডেটার জন্য টাইপ সংজ্ঞায়িত করা হলো - প্রোফাইল অ্যারে বা অবজেক্ট দুইই হতে পারে
interface DoctorData {
  id: string
  user_id: string
  speciality: string | null
  degree: string | null
  experience: number | null
  consultation_fee: number | null
  is_available: boolean | null
  profile: ProfileData | ProfileData[] | null
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
  'Gastroenterologist (গ্যাস্ট্রো বিশেষজ্ঞ)',
  'Endocrinologist (এন্ডোক্রাইনোলজিস্ট)',
  'Nephrologist (কিডনি বিশেষজ্ঞ)',
  'Oncologist (ক্যান্সার বিশেষজ্ঞ)',
  'Rheumatologist (বাত ও জয়েন্ট বিশেষজ্ঞ)',
  'Pulmonologist (ফুসফুস বিশেষজ্ঞ)',
  'Hematologist (রক্ত বিশেষজ্ঞ)',
  'Radiologist (রেডিওলজিস্ট)',
  'Anesthesiologist (এনেস্থেসিওলজিস্ট)',
  'General Physician (সাধারণ চিকিৎসক)',
  'Hepatologist (লিভার বিশেষজ্ঞ)',
  'Infectious Disease Specialist (সংক্রামক রোগ বিশেষজ্ঞ)',
  'Neonatologist (নবজাতক বিশেষজ্ঞ)',
  'Neurosurgeon (নিউরোসার্জন)',
  'Plastic Surgeon (প্লাস্টিক সার্জন)',
  'Cardiothoracic Surgeon (হার্ট ও বুকের সার্জন)'
]

const degrees = [
  'MBBS', 'MD (Medicine)', 'MD (Pediatrics)', 'MD (Dermatology)',
  'MD (Psychiatry)', 'MD (Cardiology)', 'MD (Neurology)',
  'MS (General Surgery)', 'MS (Orthopedics)', 'MS (ENT)',
  'MS (Ophthalmology)', 'MS (Obstetrics & Gynecology)',
  'FCPS (Medicine)', 'FCPS (Surgery)', 'FCPS (Pediatrics)',
  'FCPS (Gynecology)', 'BDS', 'MDS', 'PhD', 'FRCS', 'MRCP',
  'Diploma in Child Health', 'Diploma in Dermatology',
  'CCD (Cardiology)', 'MCPS', 'M Phil'
]

export default function HospitalDoctors() {
  const { profile } = useAuthStore()
  const [doctors, setDoctors] = useState<DisplayDoctor[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    speciality: '',
    degree: '',
    experience: '',
    consultation_fee: ''
  })

  // Load doctors when component mounts
  useEffect(() => {
    const loadDoctors = async () => {
      if (!profile?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            user_id,
            speciality,
            degree,
            experience,
            consultation_fee,
            is_available,
            profile:profiles(name, email, phone, profile_image)
          `)
          .eq('hospital_id', profile.id)

        if (error) throw error
        
        // এখন টাইপ সঠিকভাবে হ্যান্ডেল করা হলো
        const transformedDoctors: DisplayDoctor[] = (data || []).map((doc: DoctorData) => {
          // প্রোফাইল ডেটা নিরাপদে হ্যান্ডেল করা - অ্যারে বা অবজেক্ট দুই হতে পারে
          let profileData: ProfileData = {
            name: null,
            email: null,
            phone: null,
            profile_image: null
          }
          
          if (doc.profile) {
            if (Array.isArray(doc.profile)) {
              // যদি অ্যারে হয়, প্রথম এলিমেন্ট নাও
              profileData = doc.profile[0] || profileData
            } else {
              // যদি অবজেক্ট হয়, সেটা ব্যবহার করো
              profileData = doc.profile
            }
          }
          
          return {
            id: doc.id,
            user_id: doc.user_id,
            speciality: doc.speciality || 'General',
            degree: doc.degree || 'N/A',
            experience: doc.experience || 0,
            consultation_fee: doc.consultation_fee || 0,
            is_available: doc.is_available || false,
            name: profileData.name || 'Unknown',
            email: profileData.email || '',
            phone: profileData.phone || '',
            profile_image: profileData.profile_image || ''
          }
        })
        
        setDoctors(transformedDoctors)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        toast.error('ডাক্তার লোড করতে সমস্যা হচ্ছে')
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctors()
  }, [profile?.id])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('দয়া করে একটি ইমেজ ফাইল আপলোড করুন')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('ইমেজের সাইজ ২MB এর কম হতে হবে')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('doctor-profiles')
      .upload(filePath, imageFile, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('doctor-profiles')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleAddDoctor = async () => {
    if (!formData.name || !formData.email || !formData.speciality) {
      toast.error('দয়া করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন')
      return
    }

    setIsLoading(true)
    setUploadingImage(true)
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp123456',
        options: {
          data: {
            name: formData.name,
            role: 'doctor'
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            role: 'doctor'
          })

        if (profileError) throw profileError

        // Upload image
        if (imageFile) {
          const imageUrl = await uploadImage(authData.user.id)
          if (imageUrl) {
            await supabase
              .from('profiles')
              .update({ profile_image: imageUrl })
              .eq('id', authData.user.id)
          }
        }

        // Create doctor record
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            user_id: authData.user.id,
            speciality: formData.speciality,
            degree: formData.degree,
            experience: parseInt(formData.experience) || 0,
            consultation_fee: parseFloat(formData.consultation_fee) || 0,
            hospital_id: profile?.id
          })

        if (doctorError) throw doctorError

        toast.success('ডাক্তার সফলভাবে যোগ করা হয়েছে')
        setShowModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          speciality: '',
          degree: '',
          experience: '',
          consultation_fee: ''
        })
        setImageFile(null)
        setImagePreview('')
        
        // Refresh the list
        window.location.reload()
      }
    } catch (err) {
      console.error('Error adding doctor:', err)
      toast.error('ডাক্তার যোগ করতে সমস্যা হচ্ছে')
    } finally {
      setIsLoading(false)
      setUploadingImage(false)
    }
  }

  const handleRemoveDoctor = async (doctorId: string, userId: string) => {
    if (!confirm('আপনি কি এই ডাক্তারকে সরাতে চান?')) return
    
    setIsLoading(true)
    
    try {
      const { error: doctorError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId)

      if (doctorError) throw doctorError

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      toast.success('ডাক্তার সফলভাবে সরানো হয়েছে')
      window.location.reload()
    } catch (err) {
      console.error('Error removing doctor:', err)
      toast.error('ডাক্তার সরাতে সমস্যা হচ্ছে')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-text-dark">ডাক্তার ব্যবস্থাপনা</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          + নতুন ডাক্তার যোগ করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
                {doctor.profile_image ? (
                  <Image
                    src={doctor.profile_image}
                    alt={doctor.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👨‍⚕️</span>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                doctor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {doctor.is_available ? 'উপলব্ধ' : 'অনুপলব্ধ'}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <p className="text-primary text-sm">{doctor.speciality}</p>
            <p className="text-text-grey text-sm mt-2">{doctor.degree}</p>
            <p className="text-text-grey text-xs mt-1">{doctor.email}</p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-grey">অভিজ্ঞতা</span>
                <span className="font-medium">{doctor.experience} বছর</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-text-grey">ফি</span>
                <span className="font-medium">৳{doctor.consultation_fee}</span>
              </div>
            </div>
            <button
              onClick={() => handleRemoveDoctor(doctor.id, doctor.user_id)}
              className="mt-4 w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm"
            >
              ডাক্তার সরান
            </button>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !isLoading && (
        <div className="text-center py-12 text-text-grey">
          কোনো ডাক্তার পাওয়া যায়নি। &quot;নতুন ডাক্তার যোগ করুন&quot; এ ক্লিক করে শুরু করুন।
        </div>
      )}

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">নতুন ডাক্তার যোগ করুন</h2>
            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">প্রোফাইল পিকচার</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👨‍⚕️</span>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-gray-100 text-text-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                      ইমেজ নির্বাচন করুন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="text-xs text-text-grey mt-1">সর্বোচ্চ ২MB। শুধু JPG, PNG</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">পুরো নাম *</label>
                <input
                  type="text"
                  placeholder="ডাঃ মোঃ রহমান"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ইমেইল *</label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ফোন</label>
                <input
                  type="tel"
                  placeholder="০১৭১২-৩৪৫৬৭৮"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">বিশেষত্ব *</label>
                <select
                  value={formData.speciality}
                  onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">বিশেষত্ব নির্বাচন করুন</option>
                  {specialities.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ডিগ্রী</label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ডিগ্রী নির্বাচন করুন</option>
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">অভিজ্ঞতা (বছর)</label>
                <input
                  type="number"
                  placeholder="৫"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">পরামর্শ ফি (৳)</label>
                <input
                  type="number"
                  placeholder="৮০০"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddDoctor}
                disabled={isLoading || uploadingImage}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {uploadingImage ? 'ইমেজ আপলোড হচ্ছে...' : isLoading ? 'যোগ করা হচ্ছে...' : 'ডাক্তার যোগ করুন'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setImageFile(null)
                  setImagePreview('')
                }}
                className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50 transition"
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