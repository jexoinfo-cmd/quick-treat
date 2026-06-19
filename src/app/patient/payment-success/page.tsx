'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// যে কম্পোনেন্টটি useSearchParams ব্যবহার করে, তাকে আলাদা করে Suspense এর ভিতর রাখা হলো
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointment_id');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (appointmentId) {
      // Update appointment status to confirmed
      supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId)
        .then(({ error }) => {
          if (error) console.error('Error updating appointment:', error);
          else toast.success('Payment successful! Appointment confirmed.');
        });
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/patient/appointments');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appointmentId, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-text-dark mb-3">Payment Successful!</h1>
        <p className="text-text-grey mb-6">
          Your appointment has been confirmed. You will receive a notification shortly.
        </p>
        
        <div className="bg-primary-light rounded-xl p-4 mb-6">
          <p className="text-sm text-text-dark">
            Redirecting to appointments in <span className="font-bold text-primary">{countdown}</span> seconds...
          </p>
        </div>
        
        <button
          onClick={() => router.push('/patient/appointments')}
          className="text-primary hover:underline"
        >
          Go to Appointments Now
        </button>
      </div>
    </div>
  );
}

// Main exported component wrapped in Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}