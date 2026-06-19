'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  // Navigation functions
  const goToLogin = () => {
    router.push('/login')
  }

  const goToRegister = () => {
    router.push('/patient-register')
  }

  const goToDeskLogin = () => {
    router.push('/desk-register')
  }

  const goToPatientLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm sticky top-0 z-50">
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
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-border">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-semibold text-teal-dark">50+</h3>
              <p className="text-text-grey">Expert Doctors</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-border">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="text-xl font-semibold text-teal-dark">100+</h3>
              <p className="text-text-grey">Partner Clinics</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-border">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-teal-dark">1000+</h3>
              <p className="text-text-grey">Happy Patients</p>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">A-026</span>
                  <span className="text-text-grey text-sm">Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Footer Top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
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
                <p className="text-white/70 text-sm">
                  Smart Digital Queue & Patient Management System
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition">Home</a></li>
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                </ul>
              </div>

              {/* For Doctors */}
              <div>
                <h4 className="font-semibold mb-4">For Doctors</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><button onClick={goToDeskLogin} className="hover:text-white transition">Desk Login</button></li>
                  <li><a href="#" className="hover:text-white transition">Resources</a></li>
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition">Support</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-center gap-2">📧 support@quicktreat.com</li>
                  <li className="flex items-center gap-2">📞 +880 1234-567890</li>
                  <li className="flex items-center gap-2">🌐 www.quicktreat.com</li>
                  <li className="flex items-center gap-2">📍 Dhaka, Bangladesh</li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm">
                © 2026 Quick Treat. All Rights Reserved.
              </p>
              <div className="flex gap-6 text-white/60 text-sm">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}