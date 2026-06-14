'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  fee: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctor: {
    consultation_fee: number;
    profile: {
      name: string;
    };
  };
}

// যে কম্পোনেন্টটি useSearchParams ব্যবহার করে, তাকে আলাদা করে Suspense এর ভিতর রাখা হলো
function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuthStore();
  const appointmentId = searchParams.get('appointment_id');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [platformFeePercent, setPlatformFeePercent] = useState(10);

  const fetchPlatformFee = useCallback(async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('platform_fee_percent')
      .single();
    if (data) {
      setPlatformFeePercent(data.platform_fee_percent);
    }
  }, []);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(
          consultation_fee,
          profile:profiles(name)
        )
      `)
      .eq('id', appointmentId)
      .single();
    setAppointment(data);
    setIsLoading(false);
  }, [appointmentId]);

  useEffect(() => {
    const loadData = async () => {
      await fetchPlatformFee();
      await fetchAppointment();
    };
    loadData();
  }, [fetchPlatformFee, fetchAppointment]);

  const handlePayment = async () => {
    setProcessing(true);
    const paymentData = {
      amount: appointment?.fee,
      order_id: appointmentId,
      customer_name: profile?.name,
      customer_email: profile?.email,
      customer_phone: profile?.phone,
      success_url: `${window.location.origin}/patient/payment-success`,
      cancel_url: `${window.location.origin}/patient/payment-cancel`,
      fail_url: `${window.location.origin}/patient/payment-fail`,
    };
    console.log('Payment data:', paymentData);

    toast.success('Payment gateway will be integrated with Zinipay API');
    setProcessing(false);
    router.push(`/patient/payment-success?appointment_id=${appointmentId}`);
  };

  const platformFee = appointment?.fee ? (appointment.fee * platformFeePercent) / 100 : 0;
  const doctorEarning = appointment?.fee ? appointment.fee - platformFee : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-text-grey">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-2xl font-bold text-text-dark">Payment Details</h1>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Doctor</span>
            <span className="font-medium">{appointment.doctor?.profile?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Date</span>
            <span className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Time</span>
            <span className="font-medium">{appointment.appointment_time}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Consultation Fee</span>
            <span className="font-medium">৳{appointment.fee}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Platform Fee ({platformFeePercent}%)</span>
            <span className="font-medium">৳{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-grey">Doctor Gets</span>
            <span className="font-medium">৳{doctorEarning.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 mt-2 font-bold">
            <span className="text-lg">Total Payable</span>
            <span className="text-primary text-xl">৳{appointment.fee}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Make Payment'}
        </button>

        <p className="text-center text-xs text-text-grey mt-4">Secure payment powered by Zinipay</p>
      </div>
    </div>
  );
}

// Main exported component wrapped in Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <PaymentContent />
    </Suspense>
  );
}