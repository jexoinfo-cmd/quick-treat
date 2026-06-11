'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface WalletData {
  balance: number
  total_earned: number
  total_withdrawn: number
  pending_withdrawal: number
}

interface WithdrawalRequest {
  id: string
  amount: number
  method: string
  account_number: string
  bank_name: string
  account_holder_name: string
  status: string
  created_at: string
}

const withdrawalMethods = [
  { method: 'bkash', label: 'bKash', icon: '💸', placeholder: '01712-345678' },
  { method: 'nagad', label: 'Nagad', icon: '💰', placeholder: '01712-345678' },
  { method: 'rocket', label: 'Rocket', icon: '🚀', placeholder: '01712-345678' },
  { method: 'upay', label: 'Upay', icon: '📱', placeholder: '01712-345678' },
  { method: 'bank', label: 'Bank Account', icon: '🏦', placeholder: 'Account Number' },
]

export default function DoctorWallet() {
  const { profile } = useAuthStore()
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
    pending_withdrawal: 0
  })
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bkash')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [doctorId, setDoctorId] = useState<string | null>(null)

  // Get doctor id
  useEffect(() => {
    const getDoctorId = async () => {
      if (!profile?.id) return
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', profile.id)
        .single()
      if (data) setDoctorId(data.id)
    }
    getDoctorId()
  }, [profile?.id])

  // Load wallet and withdrawals
  useEffect(() => {
    const loadData = async () => {
      if (!doctorId) return

      setIsLoading(true)

      try {
        // Fetch wallet data
        const { data: walletData } = await supabase
          .from('doctor_wallets')
          .select('*')
          .eq('doctor_id', doctorId)
          .single()

        if (walletData) {
          setWallet(walletData)
        }

        // Fetch withdrawal history
        const { data: withdrawalData } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', profile?.id)
          .eq('role', 'doctor')
          .order('created_at', { ascending: false })

        setWithdrawals(withdrawalData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [doctorId, profile?.id])

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > wallet.balance) {
      toast.error('Insufficient balance')
      return
    }

    if (withdrawMethod === 'bank') {
      if (!bankName) {
        toast.error('Please enter bank name')
        return
      }
      if (!accountHolderName) {
        toast.error('Please enter account holder name')
        return
      }
      if (!accountNumber) {
        toast.error('Please enter account number')
        return
      }
    } else {
      if (!accountNumber) {
        toast.error('Please enter account number')
        return
      }
    }

    const { error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: profile?.id,
        role: 'doctor',
        amount: amount,
        method: withdrawMethod,
        account_number: accountNumber,
        bank_name: withdrawMethod === 'bank' ? bankName : null,
        account_holder_name: withdrawMethod === 'bank' ? accountHolderName : null,
        status: 'pending'
      })

    if (error) {
      toast.error('Failed to submit withdrawal request')
    } else {
      toast.success('Withdrawal request submitted. Admin will review it.')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setAccountNumber('')
      setBankName('')
      setAccountHolderName('')
      
      // Refresh data
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Completed</span>
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Rejected</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'bkash': return '💸'
      case 'nagad': return '💰'
      case 'rocket': return '🚀'
      case 'upay': return '📱'
      case 'bank': return '🏦'
      default: return '💳'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">My Wallet</h1>

      {/* Wallet Stats Cards - BDT Currency */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Available Balance</p>
          <p className="text-3xl font-bold mt-2">৳{wallet.balance.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Earned</p>
          <p className="text-3xl font-bold mt-2">৳{wallet.total_earned.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total Withdrawn</p>
          <p className="text-3xl font-bold mt-2">৳{wallet.total_withdrawn.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Pending Withdrawal</p>
          <p className="text-3xl font-bold mt-2">৳{wallet.pending_withdrawal.toLocaleString()}</p>
        </div>
      </div>

      {/* Withdraw Button - সবসময় দেখাবে */}
      <div className="mb-8">
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={wallet.balance <= 0}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            wallet.balance > 0 
              ? 'bg-primary text-white hover:bg-primary-dark' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Withdraw Funds 
          {wallet.balance > 0 && ` (৳${wallet.balance.toLocaleString()} Available)`}
        </button>
        {wallet.balance <= 0 && (
          <p className="text-sm text-text-grey mt-2">
            ℹ️ No funds available for withdrawal. Complete appointments to earn money.
          </p>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Withdrawal History</h2>
        </div>
        <div className="divide-y divide-border">
          {withdrawals.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMethodIcon(item.method)}</span>
                <div>
                  <p className="font-medium">৳{item.amount.toLocaleString()}</p>
                  <p className="text-xs text-text-grey">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-text-grey mt-1">
                    {item.method === 'bank' ? `${item.bank_name} - ${item.account_number}` : item.account_number}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
          {withdrawals.length === 0 && (
            <div className="p-8 text-center text-text-grey">
              No withdrawal requests yet
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Withdraw Funds</h2>
            <p className="text-text-grey mb-4">Available Balance: ৳{wallet.balance.toLocaleString()}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (৳)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Withdrawal Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {withdrawalMethods.map((method) => (
                    <button
                      key={method.method}
                      type="button"
                      onClick={() => setWithdrawMethod(method.method)}
                      className={`p-3 rounded-lg border text-center transition ${
                        withdrawMethod === method.method
                          ? 'bg-primary text-white border-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <p className="text-xs mt-1">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {withdrawMethod === 'bank' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Dutch-Bangla Bank, Islami Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="As per bank account"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="Bank account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {withdrawMethod === 'bkash' && 'bKash Account Number'}
                    {withdrawMethod === 'nagad' && 'Nagad Account Number'}
                    {withdrawMethod === 'rocket' && 'Rocket Account Number'}
                    {withdrawMethod === 'upay' && 'Upay Account Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 01712-345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleWithdraw} 
                disabled={wallet.balance <= 0}
                className={`flex-1 py-2 rounded-lg transition ${
                  wallet.balance > 0
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Request
              </button>
              <button onClick={() => setShowWithdrawModal(false)} className="flex-1 border border-border py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            </div>
            
            <p className="text-center text-xs text-text-grey mt-4">
              Your request will be reviewed by admin within 24-48 hours
            </p>
          </div>
        </div>
      )}
    </div>
  )
}