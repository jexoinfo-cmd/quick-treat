'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()
  const [showDeskModal, setShowDeskModal] = useState(false)
  
  // Dynamic counters
  const [stats, setStats] = useState({
    patientsServed: 0,
    clinics: 0,
    doctors: 0,
    uptime: 99.9
  })

  // Animated counter effect
  useEffect(() => {
    const targetStats = {
      patientsServed: 1250,
      clinics: 156,
      doctors: 842
    }
    
    const duration = 2000
    const interval = 20
    const steps = duration / interval
    
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      setStats({
        patientsServed: Math.floor(targetStats.patientsServed * progress),
        clinics: Math.floor(targetStats.clinics * progress),
        doctors: Math.floor(targetStats.doctors * progress),
        uptime: 99.9
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setStats({
          patientsServed: targetStats.patientsServed,
          clinics: targetStats.clinics,
          doctors: targetStats.doctors,
          uptime: 99.9
        })
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [])

  // Navigation handlers
  const goToLogin = () => {
    router.push('/login')
  }

  const goToRegister = () => {
    router.push('/patient-register')
  }

  const goToDeskLogin = () => {
    setShowDeskModal(true)
  }

  const goToPatientLogin = () => {
    router.push('/login')
  }

  const handleDeskRoleSelect = (role: 'doctor' | 'hospital') => {
    setShowDeskModal(false)
    router.push(`/desk-register?role=${role}`)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 bg-white/90 backdrop-blur-sm z-50 shadow-sm">
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
              onClick={goToLogin}
              className="text-primary hover:text-primary-dark text-sm sm:text-base font-medium cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={goToRegister}
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
                onClick={goToDeskLogin}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition cursor-pointer"
              >
                Desk Login
              </button>
              <button
                onClick={goToPatientLogin}
                className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary-light transition cursor-pointer"
              >
                Patient Login
              </button>
            </div>
          </div>

          {/* Dashboard Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-border">
              <div className="mb-6">
                <div className="bg-teal-light rounded-2xl p-6 text-center">
                  <p className="text-text-grey text-sm">Current Token</p>
                  <p className="text-5xl font-bold text-primary">A-023</p>
                  <p className="text-text-grey text-sm mt-2">Consultation Room 1</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <button className="text-primary text-sm">View All →</button>
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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">A-026</span>
                  <span className="text-text-grey text-sm">Waiting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-primary rounded-2xl p-8 sm:p-12 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{stats.patientsServed}+</p>
                <p className="text-sm opacity-90 mt-1">Patients Served</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{stats.clinics}+</p>
                <p className="text-sm opacity-90 mt-1">Clinics</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{stats.doctors}+</p>
                <p className="text-sm opacity-90 mt-1">Doctors</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{stats.uptime}%</p>
                <p className="text-sm opacity-90 mt-1">Uptime</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-teal-dark mb-4">FEATURES</h2>
            <p className="text-center text-text-grey mb-12">Everything You Need to Manage Better</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🎯', title: 'Live Queue Management', desc: 'Manage patient queues in real-time with instant updates.' },
                { icon: '🔢', title: 'Smart Serial System', desc: 'Automated serial system for smooth patient flow.' },
                { icon: '👨‍⚕️', title: 'Multi Doctor Support', desc: 'Manage multiple doctors and their queues easily.' },
                { icon: '🏥', title: 'Hospital & Clinic Dashboard', desc: 'Powerful dashboard for total control and analytics.' },
                { icon: '📱', title: 'Real-time Patient Updates', desc: 'Patients get live updates on their queue status.' },
                { icon: '⚡', title: 'Fast Appointment System', desc: 'Book, manage and track appointments effortlessly.' },
              ].map((feature, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold text-teal-dark mb-2">{feature.title}</h3>
                  <p className="text-text-grey text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-teal-dark mb-4">HOW IT WORKS</h2>
            <p className="text-center text-text-grey mb-12">Simple steps to get started</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Patient Books Serial', desc: 'Patient books a serial easily from anywhere.' },
                { step: '2', title: 'Doctor Manages Queue', desc: 'Doctor manages the queue in real time.' },
                { step: '3', title: 'Admin Monitors System', desc: 'Admin controls doctors, clinics & hospitals.' },
                { step: '4', title: 'Patient Tracks Live', desc: 'Patient sees live queue and updates instantly.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-teal-dark mb-2">{item.title}</h3>
                  <p className="text-text-grey text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who Can Use */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-teal-dark mb-4">WHO CAN USE QUICK TREAT</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[
                { icon: '🏪', title: 'Clinic', features: ['Manage patients', 'Control queue', 'Schedule availability'] },
                { icon: '🏥', title: 'Hospital', features: ['Department mgmt.', 'Doctor management', 'Queue monitoring'] },
                { icon: '👨‍⚕️', title: 'Multi Clinic', features: ['Multiple doctors', 'Queue tracking', 'Staff management'] },
                { icon: '👤', title: 'Patient', features: ['Book serial', 'Live updates', 'Track appointments'] },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-teal-dark mb-3">{item.title}</h3>
                  <ul className="space-y-1">
                    {item.features.map((feature) => (
                      <li key={feature} className="text-text-grey text-sm flex items-center gap-2">
                        <span className="text-primary">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white mt-20">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/assets/icons/logo.png"
                      alt="Quick Treat Logo"
                      width={32}
                      height={32}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <span className="font-bold text-lg">Quick Treat</span>
                </div>
                <p className="text-white/70 text-sm">Smart Digital Queue & Patient Management System</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition">Home</a></li>
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">For Doctors</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><button onClick={goToDeskLogin} className="hover:text-white transition">Desk Login</button></li>
                  <li><a href="#" className="hover:text-white transition">Resources</a></li>
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>📧 support@quicktreat.com</li>
                  <li>📞 +880 1234-567890</li>
                  <li>🌐 www.quicktreat.com</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
              © 2026 Quick Treat. All Rights Reserved. Powered by Quick Treat
            </div>
          </div>
        </div>
      </footer>

      {/* Desk Login Modal */}
      {showDeskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-teal-dark">Desk Login</h2>
              <button onClick={() => setShowDeskModal(false)} className="text-text-grey hover:text-text-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-text-grey text-sm mb-6">Select your role to continue</p>
            <div className="space-y-3">
              <button
                onClick={() => handleDeskRoleSelect('doctor')}
                className="w-full flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-primary-light transition cursor-pointer"
              >
                <span className="text-3xl">👨‍⚕️</span>
                <div className="text-left">
                  <p className="font-semibold text-teal-dark">Doctor</p>
                  <p className="text-xs text-text-grey">Manage your patients and queue</p>
                </div>
              </button>
              <button
                onClick={() => handleDeskRoleSelect('hospital')}
                className="w-full flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-primary-light transition cursor-pointer"
              >
                <span className="text-3xl">🏥</span>
                <div className="text-left">
                  <p className="font-semibold text-teal-dark">Hospital / Clinic</p>
                  <p className="text-xs text-text-grey">Manage doctors, beds and facilities</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}