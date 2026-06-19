// src/app/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// ✅ Custom Logo Component
const Logo = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
  const sizes = {
    small: { width: 32, height: 32, text: 'text-lg' },
    default: { width: 40, height: 40, text: 'text-xl' },
    large: { width: 48, height: 48, text: 'text-2xl' },
  }
  const s = sizes[size] || sizes.default
  
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/assets/icons/logo.png"
        alt="Quick Treat Logo"
        width={s.width}
        height={s.height}
        className="rounded-xl object-cover"
        priority
      />
      <span className={`font-bold ${s.text} text-teal-dark`}>Quick Treat</span>
    </div>
  )
}

export default function LandingPage() {
  // ❌ router ব্যবহার করা হচ্ছে না - সরিয়ে ফেলা হয়েছে
  const [currentToken, setCurrentToken] = useState(15)
  // ✅ queuePatients - শুধু read-only, setter প্রয়োজন নেই
  const queuePatients = [
    { name: 'Ahmed Hasan', time: '10:30 AM', region: 'Room 1', bed: 'A-12', doctor: 'Dr. Khan', status: 'In Progress' },
    { name: 'Fatima Begum', time: '11:00 AM', region: 'Room 2', bed: 'B-05', doctor: 'Dr. Khan', status: 'Waiting' },
    { name: 'Rahman Mia', time: '11:30 AM', region: 'Room 1', bed: 'A-08', doctor: 'Dr. Khan', status: 'Waiting' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToken(prev => prev + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { number: '50+', label: 'Expert Doctors', icon: '👨‍⚕️' },
    { number: '100+', label: 'Partner Clinics', icon: '🏥' },
    { number: '10,000+', label: 'Happy Patients', icon: '👤' },
    { number: '99%', label: 'Satisfaction Rate', icon: '⭐' },
  ]

  const features = [
    { title: 'Smart Queue', description: 'Automated token system & live queue management.', icon: '⏳' },
    { title: 'Online Booking', description: '24/7 appointment booking for patients.', icon: '📅' },
    { title: 'Digital Payments', description: 'Secure payments, invoices & transaction history.', icon: '💰' },
    { title: 'Analytics & Reports', description: 'Get real-time insights and grow your practice.', icon: '📊' },
    { title: 'Digital Invoices', description: 'Generate invoices with QR & barcode.', icon: '📄' },
    { title: 'Notifications', description: 'SMS & WhatsApp reminders for appointments.', icon: '🔔' },
  ]

  const testimonials = [
    { quote: 'Awesome management has become so easy. My patients are happier and my practice is growing.', name: 'Dr. Abdullah Khan', title: 'Cardiology Specialist', rating: 5 },
    { quote: 'Quick Treat made booking appointments so convenient. No more long waiting!', name: 'Dr. Fatima Ahmed', title: 'General Physician', rating: 5 },
    { quote: 'Managing doctors, appointments and reports in one place is a game changer for us.', name: 'Dr. Rahman Mia', title: 'Hospital Administrator', rating: 5 },
  ]

  const userTypes = [
    { role: 'For Patients', description: 'Find trusted doctors, book appointments in seconds, track queue live, digital prescriptions & invoices.', cta: 'Book Now →', link: '/patient/doctors', icon: '👤' },
    { role: 'For Doctors', description: 'Manage appointments easily, live queue management, digital prescriptions, track earnings & reports.', cta: 'Join as Doctor →', link: '/desk-register', icon: '👨‍⚕️' },
    { role: 'For Hospitals', description: 'Manage doctors & staff, bed stability management, advanced reports & analytics, revenue & performance tracking.', cta: 'Join as Hospital →', link: '/desk-register', icon: '🏥' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <Logo size="default" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-primary hover:text-primary-dark text-sm sm:text-base font-medium transition-colors">Login</Link>
            <Link href="/patient-register" className="bg-primary text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-primary-dark transition-colors active:scale-95">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-light/50 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span>⭐</span> Trusted by 10,000+ users
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-teal-dark leading-tight">
              Healthcare Without
              <br />
              <span className="text-primary">Waiting.</span>
            </h1>
            <p className="text-text-grey text-lg sm:text-xl max-w-2xl mx-auto mt-4">
              Book appointments, manage queues, track patients and grow your practice. Everything in one powerful platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/patient-register" className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors active:scale-95 flex items-center gap-2">Get Started Free →</Link>
              <button className="border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-light transition-colors active:scale-95">Watch Demo</button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-8">
              <div className="flex items-center gap-1 text-yellow-500">
                <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                <span className="text-text-grey text-sm ml-2">4.5/5</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-sm border border-border">
                <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-text-grey mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark text-center mb-4">From Chaos to Clarity</h2>
          <p className="text-text-grey text-center max-w-2xl mx-auto mb-12">We solve the daily healthcare management challenges</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-200">
              <h3 className="text-xl font-bold text-red-700 mb-4">❌ Before Quick Treat</h3>
              <ul className="space-y-3 text-text-grey">
                <li className="flex items-start gap-3"><span className="text-red-500 text-lg">✕</span><span>Long waiting times and crowd</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 text-lg">✕</span><span>Paper based records</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 text-lg">✕</span><span>Queue confusion and complaints</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 text-lg">✕</span><span>Missed appointments</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 text-lg">✕</span><span>Manual payments and errors</span></li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-200">
              <h3 className="text-xl font-bold text-green-700 mb-4">✅ After Quick Treat</h3>
              <ul className="space-y-3 text-text-grey">
                <li className="flex items-start gap-3"><span className="text-green-500 text-lg">✓</span><span>Smart queue management</span></li>
                <li className="flex items-start gap-3"><span className="text-green-500 text-lg">✓</span><span>Digital patient records</span></li>
                <li className="flex items-start gap-3"><span className="text-green-500 text-lg">✓</span><span>Live queue updates</span></li>
                <li className="flex items-start gap-3"><span className="text-green-500 text-lg">✓</span><span>Automated reminders</span></li>
                <li className="flex items-start gap-3"><span className="text-green-500 text-lg">✓</span><span>Secure digital payments &amp; invoices</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses Quick Treat */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark text-center mb-4">Who Uses Quick Treat?</h2>
          <p className="text-text-grey text-center max-w-2xl mx-auto mb-12">Designed for patients, doctors and hospitals</p>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {userTypes.map((user, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-border hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{user.icon}</div>
                <h3 className="text-xl font-bold text-teal-dark mb-2">{user.role}</h3>
                <p className="text-text-grey text-sm mb-4">{user.description}</p>
                <Link href={user.link} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">{user.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Queue Preview */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark">Live Queue In Real Time</h2>
              <p className="text-text-grey mt-2">See your queue live, reduce waiting time and improve patient experience.</p>
            </div>
            <Link href="/patient/doctors" className="text-primary font-semibold hover:underline mt-4 md:mt-0 inline-flex items-center gap-1">See Live Demo →</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-linear-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
              <p className="text-sm opacity-80">Current Token</p>
              <p className="text-5xl font-bold mt-2">{currentToken}</p>
              <p className="text-sm opacity-80 mt-4">Now Serving</p>
              <p className="text-xl font-semibold">Ahmed Hasan</p>
              <p className="text-sm opacity-80 mt-4">Estimated Wait</p>
              <p className="text-2xl font-bold">12 min</p>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl border border-border overflow-hidden shadow-lg">
              <div className="p-4 bg-gray-50 border-b border-border"><p className="font-semibold text-text-dark">Live Queue</p></div>
              <div className="divide-y divide-border">
                <div className="grid grid-cols-6 gap-2 px-4 py-2 text-xs font-semibold text-text-grey bg-gray-50/50">
                  <span>Patient Name</span><span>Time</span><span>Region</span><span>Bed Number</span><span>Doctor</span><span>Status</span>
                </div>
                {queuePatients.map((patient, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm items-center hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-text-dark">{patient.name}</span>
                    <span className="text-text-grey">{patient.time}</span>
                    <span className="text-text-grey">{patient.region}</span>
                    <span className="text-text-grey">{patient.bed}</span>
                    <span className="text-text-grey">{patient.doctor}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-center w-fit ${patient.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{patient.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark text-center mb-4">Everything You Need in One Platform</h2>
          <p className="text-text-grey text-center max-w-2xl mx-auto mb-12">Complete healthcare management solution</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold text-teal-dark mb-2">{feature.title}</h3>
                <p className="text-text-grey text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark text-center mb-4">Powerful Dashboard for Everyone</h2>
          <p className="text-text-grey text-center max-w-2xl mx-auto mb-12">Tailored views for patients, doctors and hospitals</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-teal-light/30 rounded-2xl p-6 text-center border border-border">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-xl font-bold text-teal-dark">Patient View</h3>
              <p className="text-text-grey text-sm mt-2">Book appointments, track queue, view prescriptions</p>
            </div>
            <div className="bg-primary-light/30 rounded-2xl p-6 text-center border border-primary/20 shadow-lg">
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-teal-dark">Doctor View</h3>
              <p className="text-text-grey text-sm mt-2">Manage queue, appointments, prescriptions &amp; earnings</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-200">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-bold text-teal-dark">Hospital View</h3>
              <p className="text-text-grey text-sm mt-2">Manage doctors, beds, reports &amp; revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-dark text-center mb-4">What Our Users Say</h2>
          <p className="text-text-grey text-center max-w-2xl mx-auto mb-12">Real stories from real users</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
                <div className="flex text-yellow-500 text-sm mb-3">{'⭐'.repeat(testimonial.rating)}</div>
                <p className="text-text-dark italic text-sm">&quot;{testimonial.quote}&quot;</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-bold text-teal-dark">{testimonial.name}</p>
                  <p className="text-text-grey text-sm">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to Transform Your Healthcare Practice?</h2>
          <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto">Join thousands of doctors and hospitals already using Quick Treat.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/patient-register" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors active:scale-95">Get Started Free →</Link>
          </div>
        </div>
      </section>

      {/* Footer Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-teal-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><p className="text-3xl sm:text-4xl font-bold text-white">10,000+</p><p className="text-white/60 text-sm mt-1">Appointments booked</p></div>
            <div><p className="text-3xl sm:text-4xl font-bold text-white">500+</p><p className="text-white/60 text-sm mt-1">Doctors joined</p></div>
            <div><p className="text-3xl sm:text-4xl font-bold text-white">100+</p><p className="text-white/60 text-sm mt-1">Hospitals on board</p></div>
            <div><p className="text-3xl sm:text-4xl font-bold text-white">99%</p><p className="text-white/60 text-sm mt-1">Customer satisfaction</p></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-dark text-white border-t border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/assets/icons/logo.png" alt="Quick Treat" width={32} height={32} className="rounded-lg object-cover" />
                  <span className="font-bold text-lg">Quick Treat</span>
                </div>
                <p className="text-white/60 text-sm">Smart Digital Queue &amp; Patient Management System</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                  <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                  <li><Link href="/patient-register" className="hover:text-white transition">Register</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">For Users</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li><Link href="/patient/doctors" className="hover:text-white transition">Find Doctors</Link></li>
                  <li><Link href="/desk-register" className="hover:text-white transition">Join as Doctor</Link></li>
                  <li><Link href="/desk-register" className="hover:text-white transition">Join as Hospital</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li>📧 support@quicktreat.com</li>
                  <li>📞 +880 1234-567890</li>
                  <li>📍 Dhaka, Bangladesh</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">© 2026 Quick Treat. All Rights Reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}