'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

export default function GlobalSettings() {
  const { profile } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Platform Settings
  const [platformFee, setPlatformFee] = useState(10)
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    payment_alerts: true,
    promotional_emails: false
  })
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    session_timeout: 60
  })

  // Load all settings
  useEffect(() => {
    const loadAllSettings = async () => {
      if (!profile?.id) {
        router.push('/')
        return
      }
      
      // Check if user is admin
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', profile.id)
        .single()
      
      if (data?.role !== 'admin') {
        toast.error('Access denied. Admin only.')
        router.push('/')
        return
      }
      
      setIsAdmin(true)
      
      try {
        // Fetch platform settings
        const { data: platformData } = await supabase
          .from('platform_settings')
          .select('platform_fee_percent')
          .single()
        
        if (platformData) {
          setPlatformFee(platformData.platform_fee_percent)
        }
        
        // Fetch user notification settings
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', profile.id)
          .single()
        
        if (userSettings) {
          setNotificationSettings({
            email_notifications: userSettings.email_notifications ?? true,
            sms_notifications: userSettings.sms_notifications ?? false,
            appointment_reminders: userSettings.appointment_reminders ?? true,
            payment_alerts: userSettings.payment_alerts ?? true,
            promotional_emails: userSettings.promotional_emails ?? false
          })
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllSettings()
  }, [profile?.id, router])

  const savePlatformFee = async () => {
    setSaving(true)
    try {
      const { error: saveError } = await supabase
        .from('platform_settings')
        .upsert({ 
          id: 1, 
          platform_fee_percent: platformFee,
          updated_at: new Date()
        })
      
      if (saveError) throw saveError
      toast.success('Platform fee updated successfully')
    } catch {
      toast.error('Failed to update platform fee')
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSaving(true)
    try {
      const { error: saveError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile?.id,
          ...notificationSettings,
          updated_at: new Date()
        })
      
      if (saveError) throw saveError
      toast.success('Notification settings saved')
    } catch {
      toast.error('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const newPassword = (form.elements.namedItem('new_password') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirm_password') as HTMLInputElement).value
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setSaving(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
      toast.success('Password updated successfully')
      form.reset()
    } catch (err) {
      const authError = err as AuthError
      toast.error(authError.message || 'Failed to update password')
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

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-text-grey">Access denied. This page is for administrators only.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-primary hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Platform Settings (Admin Only) */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-dark">Platform Settings</h2>
            <p className="text-sm text-text-grey">Configure global platform settings</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Platform Fee (%)</label>
                <p className="text-xs text-text-grey">Commission charged per appointment</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(parseFloat(e.target.value))}
                  step="0.5"
                  min="0"
                  max="50"
                  className="w-24 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={savePlatformFee}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-dark">Notification Settings</h2>
            <p className="text-sm text-text-grey">Manage how you receive notifications</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-text-grey">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email_notifications}
                  onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-text-grey">Receive SMS alerts for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.sms_notifications}
                  onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium">Appointment Reminders</p>
                <p className="text-sm text-text-grey">Get reminders before your appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.appointment_reminders}
                  onChange={(e) => setNotificationSettings({...notificationSettings, appointment_reminders: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-text-grey">Get notifications for payment updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.payment_alerts}
                  onChange={(e) => setNotificationSettings({...notificationSettings, payment_alerts: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium">Promotional Emails</p>
                <p className="text-sm text-text-grey">Receive offers and updates about new features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.promotional_emails}
                  onChange={(e) => setNotificationSettings({...notificationSettings, promotional_emails: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="pt-4">
              <button
                onClick={saveNotificationSettings}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-dark">Security</h2>
            <p className="text-sm text-text-grey">Manage your security preferences</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="font-semibold mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Two Factor Auth */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-text-grey">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.two_factor_auth}
                    onChange={(e) => setSecuritySettings({...securitySettings, two_factor_auth: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="border-t border-border pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-medium">Session Timeout (minutes)</p>
                  <p className="text-sm text-text-grey">Automatically log out after inactivity</p>
                </div>
                <div className="flex gap-3">
                  <select
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                  <button
                    onClick={() => toast.success('Session timeout updated')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}