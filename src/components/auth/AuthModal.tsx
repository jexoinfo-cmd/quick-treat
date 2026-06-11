'use client'

import { useState, useEffect } from 'react'
import LoginTab from './LoginTab'
import DoctorSignup from './DoctorSignup'
import HospitalSignup from './HospitalSignup'
import PatientSignup from './PatientSignup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultRole: 'doctor' | 'hospital' | 'patient'
}

export default function AuthModal({ isOpen, onClose, defaultRole }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [signupRole, setSignupRole] = useState<'doctor' | 'hospital' | 'patient'>(defaultRole)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fix: Use a wrapper function to avoid direct setState in effect
  useEffect(() => {
    const updateRole = () => {
      setSignupRole(defaultRole)
    }
    updateRole()
  }, [defaultRole])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const renderSignupForm = () => {
    switch(signupRole) {
      case 'doctor':
        return <DoctorSignup onClose={onClose} />
      case 'hospital':
        return <HospitalSignup onClose={onClose} />
      case 'patient':
        return <PatientSignup onClose={onClose} />
      default:
        return <PatientSignup onClose={onClose} />
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`absolute ${
        isMobile 
          ? 'inset-x-0 bottom-0 rounded-t-2xl animate-slide-up'
          : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-2xl'
      } bg-white shadow-xl overflow-hidden`}>
        
        {/* Header Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'login'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-grey hover:text-text-dark'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'signup'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-grey hover:text-text-dark'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selection for Signup */}
        {activeTab === 'signup' && (
          <div className="flex border-b border-border bg-gray-50">
            <button
              onClick={() => setSignupRole('doctor')}
              className={`flex-1 py-3 text-center transition ${
                signupRole === 'doctor'
                  ? 'text-primary border-b-2 border-primary font-medium bg-white'
                  : 'text-text-grey'
              }`}
            >
              👨‍⚕️ Doctor
            </button>
            <button
              onClick={() => setSignupRole('hospital')}
              className={`flex-1 py-3 text-center transition ${
                signupRole === 'hospital'
                  ? 'text-primary border-b-2 border-primary font-medium bg-white'
                  : 'text-text-grey'
              }`}
            >
              🏥 Hospital
            </button>
            <button
              onClick={() => setSignupRole('patient')}
              className={`flex-1 py-3 text-center transition ${
                signupRole === 'patient'
                  ? 'text-primary border-b-2 border-primary font-medium bg-white'
                  : 'text-text-grey'
              }`}
            >
              👤 Patient
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-grey hover:text-text-dark transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <LoginTab onClose={onClose} />
          ) : (
            renderSignupForm()
          )}
        </div>
      </div>
    </div>
  )
}