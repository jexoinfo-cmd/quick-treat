'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DoctorSignup from '@/components/auth/DoctorSignup'
import HospitalSignup from '@/components/auth/HospitalSignup'

export default function DeskRegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'doctor' | 'hospital'>('doctor')

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
              <p className="text-xs text-text-grey hidden sm:block">Desk Registration</p>
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
          {/* Desk Registration Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🖥️</span>
            </div>
            <h1 className="text-3xl font-bold text-teal-dark">Desk Registration</h1>
            <p className="text-text-grey mt-2">
              Register as a doctor or hospital to start managing patients
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden mb-6">
            <div className="flex">
              <button
                onClick={() => setUserType('doctor')}
                className={`flex-1 py-4 text-center font-semibold transition ${
                  userType === 'doctor'
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-text-grey hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl mr-2">👨‍⚕️</span>
                Doctor Registration
              </button>
              <button
                onClick={() => setUserType('hospital')}
                className={`flex-1 py-4 text-center font-semibold transition ${
                  userType === 'hospital'
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-text-grey hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl mr-2">🏥</span>
                Hospital Registration
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-teal-dark mb-2">
                {userType === 'doctor' ? 'Doctor Information' : 'Hospital Information'}
              </h2>
              <p className="text-text-grey text-sm mb-6">
                {userType === 'doctor' 
                  ? 'Please provide your professional details to register as a doctor'
                  : 'Please provide your hospital details to register your facility'}
              </p>
              
              {userType === 'doctor' ? (
                <DoctorSignup onClose={() => router.push('/doctor/pending-approval')} />
              ) : (
                <HospitalSignup onClose={() => router.push('/hospital/pending-approval')} />
              )}
            </div>
          </div>

          {/* Already have account */}
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