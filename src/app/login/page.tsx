'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login for:', formData.email)


      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        })


      if (error) {
        console.error('Login error:', error)
        toast.error(error.message)
        setIsLoading(false)
        return
      }


      if (!data.user) {
        toast.error('Login failed')
        setIsLoading(false)
        return
      }


      console.log(
        'Login successful, fetching profile...'
      )


      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select(`
            role,
            is_approved
          `)
          .eq('id', data.user.id)
          .maybeSingle()



      if (profileError) {

        console.error(
          'Profile fetch error:',
          profileError
        )

        toast.error(
          'Profile loading failed'
        )

        setIsLoading(false)
        return
      }



      if (!profile) {

        console.log(
          'No profile found. Creating patient fallback...'
        )


        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            role: 'patient',
            is_approved: true
          })


        toast.success(
          'Account created'
        )

        router.push(
          '/patient/dashboard'
        )

        return
      }



      toast.success(
        'Login successful!'
      )



      switch(profile.role) {

        case 'doctor':

          if(profile.is_approved) {
            router.push(
              '/doctor/dashboard'
            )
          } else {
            router.push(
              '/doctor/pending-approval'
            )
          }

          break



        case 'hospital':

          if(profile.is_approved) {
            router.push(
              '/hospital/dashboard'
            )
          } else {
            router.push(
              '/hospital/pending-approval'
            )
          }

          break



        case 'patient':

          router.push(
            '/patient/dashboard'
          )

          break



        case 'desk':

          router.push(
            '/desk/dashboard'
          )

          break



        default:

          router.push('/')

      }


    } catch(error) {

      console.error(
        'Unexpected error:',
        error
      )

      toast.error(
        'Something went wrong'
      )

    } finally {

      setIsLoading(false)

    }

  }



  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex flex-col">

      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm sticky top-0 z-50">

        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3"
          >

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

              <span className="font-bold text-xl sm:text-2xl text-teal-dark">
                Quick Treat
              </span>


              <p className="text-xs text-text-grey hidden sm:block">
                Smart Digital Queue & Patient Management System
              </p>

            </div>

          </Link>


          <div className="flex gap-3">

            <Link
              href="/patient-register"
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Register
            </Link>


            <Link
              href="/"
              className="text-text-grey"
            >
              Home
            </Link>

          </div>


        </div>

      </nav>
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">

          <div className="max-w-md w-full">

            <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">

              <div className="p-6 sm:p-8">

                <div className="text-center mb-6">

                  <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">
                      🔐
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-teal-dark">
                    Welcome Back!
                  </h1>

                  <p className="text-text-grey text-sm mt-2">
                    Login to your account
                  </p>

                </div>


                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  <div>

                    <label className="block text-sm font-medium text-text-dark mb-1">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e)=>setFormData({
                        ...formData,
                        email:e.target.value
                      })}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-text-dark mb-1">
                      Password
                    </label>


                    <div className="relative">

                      <input
                        type={
                          showPassword
                          ? "text"
                          : "password"
                        }
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e)=>setFormData({
                          ...formData,
                          password:e.target.value
                        })}
                        required
                        className="w-full px-4 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />


                      <button
                        type="button"
                        onClick={()=>setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >

                        {
                          showPassword
                          ? "👁️"
                          : "👁️‍🗨️"
                        }

                      </button>

                    </div>

                  </div>


                  <div className="text-right">

                    <button
                      type="button"
                      onClick={()=>toast.error(
                        'Please contact support to reset password'
                      )}
                      className="text-primary text-sm"
                    >
                      Forgot Password?
                    </button>

                  </div>


                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >

                    {
                      isLoading
                      ? "Logging in..."
                      : "Login"
                    }

                  </button>


                </form>



                <div className="mt-6 text-center">

                  <p className="text-text-grey text-sm">

                    Don't have an account?{" "}

                    <Link
                      href="/patient-register"
                      className="text-primary hover:underline font-medium"
                    >
                      Register here
                    </Link>

                  </p>

                </div>



                <div className="relative my-6">

                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>

                  <div className="relative flex justify-center text-sm">

                    <span className="px-2 bg-white text-text-grey">
                      or
                    </span>

                  </div>

                </div>



                <Link
                  href="/desk-register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition"
                >

                  <span className="text-xl">
                    🖥️
                  </span>

                  Desk Registration (Doctor / Hospital)

                </Link>



                <p className="text-xs text-text-grey mt-2 text-center">
                  Register as a doctor or hospital to start managing patients
                </p>


              </div>

            </div>

          </div>

        </main>



        <footer className="bg-teal-dark text-white mt-12">

          <div className="px-4 sm:px-6 lg:px-8 py-6">

            <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">

              © 2026 Quick Treat. All Rights Reserved. Powered by Quick Treat

            </div>

          </div>

        </footer>


      </div>
    )
}