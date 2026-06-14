'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

function PaymentCancelContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-text-dark mb-3">Payment Cancelled</h1>
        <p className="text-text-grey mb-6">
          Your payment was cancelled. You can try booking again.
        </p>
        
        <button
          onClick={() => router.push('/patient/doctors')}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Back to Doctors
        </button>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}