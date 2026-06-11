'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface ReportData {
  totalAppointments: number
  totalRevenue: number
  totalDoctors: number
  totalPatients: number
  pendingApprovals: number
  monthlyData: { month: string; revenue: number; appointments: number }[]
}

export default function HospitalReports() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportData>({
    totalAppointments: 0,
    totalRevenue: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingApprovals: 0,
    monthlyData: []
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Get doctors count
        const { count: doctorCount } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true })
          .eq('hospital_id', profile?.id)

        // Get appointments and revenue
        const { data: earnings } = await supabase
          .from('earnings')
          .select('amount, hospital_amount, patient_id, created_at')
          .eq('hospital_id', profile?.id)

        const totalRevenue = earnings?.reduce((sum, e) => sum + (e.hospital_amount || 0), 0) || 0
        const totalAppointments = earnings?.length || 0

        // Get unique patients
        const uniquePatients = new Set(earnings?.map(e => e.patient_id))
        const totalPatients = uniquePatients.size

        // Monthly data
        const monthlyMap = new Map<string, { revenue: number; appointments: number }>()
        earnings?.forEach(e => {
          const date = new Date(e.created_at)
          const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
          if (!monthlyMap.has(monthYear)) {
            monthlyMap.set(monthYear, { revenue: 0, appointments: 0 })
          }
          const data = monthlyMap.get(monthYear)!
          data.revenue += e.hospital_amount || 0
          data.appointments += 1
        })

        const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          appointments: data.appointments
        }))

        setReport({
          totalAppointments,
          totalRevenue,
          totalDoctors: doctorCount || 0,
          totalPatients,
          pendingApprovals: 0,
          monthlyData: monthlyData.slice(-6)
        })
      } catch (error) {
        console.error('Error fetching reports:', error)
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [profile?.id])

  const exportReport = () => {
    const csvData = report.monthlyData.map(d => `${d.month},${d.revenue},${d.appointments}`).join('\n')
    const blob = new Blob([`Month,Revenue,Appointments\n${csvData}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hospital-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-dark">Reports & Analytics</h1>
        <button
          onClick={exportReport}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          📊 Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Appointments</p>
          <p className="text-3xl font-bold mt-2">{report.totalAppointments}</p>
        </div>
        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">৳{report.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Doctors</p>
          <p className="text-3xl font-bold mt-2">{report.totalDoctors}</p>
        </div>
        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Patients</p>
          <p className="text-3xl font-bold mt-2">{report.totalPatients}</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Monthly Performance</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {report.monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...report.monthlyData.map(d => d.revenue), 1)
              const percentage = (data.revenue / maxRevenue) * 100
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{data.month}</span>
                    <span>৳{data.revenue.toLocaleString()} ({data.appointments} appts)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {report.monthlyData.length === 0 && (
              <div className="text-center text-text-grey py-8">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">৳{report.totalRevenue.toLocaleString()}</p>
            <p className="text-text-grey mt-2">Total earned from appointments</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">Appointment Stats</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{report.totalAppointments}</p>
            <p className="text-text-grey mt-2">Total appointments completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}