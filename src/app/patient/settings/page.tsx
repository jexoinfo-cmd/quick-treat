'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

export default function PatientSettings() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    date_of_birth: '',
    blood_group: '',
    district: '',
    upazila: '',
    notification_enabled: true,
    email_notification: true,
    sms_notification: false
  })

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

  // Fetch settings - without useCallback
  useEffect(() => {
    const fetchSettings = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single()

        if (error) throw error

        setFormData({
          name: data?.name || '',
          email: data?.email || '',
          phone: data?.phone || '',
          whatsapp: data?.whatsapp || '',
          date_of_birth: data?.date_of_birth || '',
          blood_group: data?.blood_group || '',
          district: data?.district || '',
          upazila: data?.upazila || '',
          notification_enabled: true,
          email_notification: true,
          sms_notification: false
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [profile?.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          date_of_birth: formData.date_of_birth,
          blood_group: formData.blood_group,
          district: formData.district,
          upazila: formData.upazila
        })
        .eq('id', profile?.id)

      if (error) throw error

      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-dark">Profile Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                <input
                  type="tel"
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
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upazila/Thana</label>
                <input
                  type="text"
                  value={formData.upazila}
                  onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-dark">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-text-grey">Receive updates about your appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notification_enabled}
                  onChange={(e) => setFormData({...formData, notification_enabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-text-grey">Get appointment reminders via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.email_notification}
                  onChange={(e) => setFormData({...formData, email_notification: e.target.checked})}
                  disabled={!formData.notification_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-text-grey">Get SMS alerts for appointment updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sms_notification}
                  onChange={(e) => setFormData({...formData, sms_notification: e.target.checked})}
                  disabled={!formData.notification_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}