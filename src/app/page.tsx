'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  const handleRegister = () => {
    router.push('/patient-register')
  }

  const handleDeskLogin = () => {
    router.push('/desk-register')
  }

  const handlePatientLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm">
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
              <p className="text-xs text-text-grey hidden sm:block">Smart Digital Queue & Patient Management System</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={handleLogin}
              className="text-primary hover:text-primary-dark text-sm sm:text-base font-medium cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={handleRegister}
              className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-primary-dark transition cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-teal-dark mb-4">
              Skip Waiting Rooms.
              <br />
              <span className="text-primary">Manage Patients Smarter.</span>
            </h1>
            <p className="text-text-grey text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Quick Treat helps doctors, clinics, hospitals, and patients manage appointments, 
              serial numbers, and live queues in real time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={handleDeskLogin}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition cursor-pointer"
              >
                Desk Login
              </button>
              <button
                onClick={handlePatientLogin}
                className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary-light transition cursor-pointer"
              >
                Patient Login
              </button>
            </div>
          </div>

          {/* Dashboard Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-border">
              <div className="bg-teal-light rounded-2xl p-6 text-center">
                <p className="text-text-grey text-sm">Current Token</p>
                <p className="text-5xl font-bold text-primary">A-023</p>
                <p className="text-text-grey text-sm mt-2">Consultation Room 1</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-text-grey text-sm">Today&apos;s Patients</p>
                  <p className="text-3xl font-bold text-primary">128</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-text-grey text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-500">96</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-teal-dark">Live Queue</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-teal-light/30 rounded-xl">
                  <span className="font-medium">A-023</span>
                  <span className="text-primary text-sm">In Consultation</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">A-024</span>
                  <span className="text-text-grey text-sm">Waiting</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">A-025</span>
                  <span className="text-text-grey text-sm">Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white mt-20">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">
            © 2026 Quick Treat. All Rights Reserved. Powered by Quick Treat
          </div>
        </div>
      </footer>
    </div>
  )
}