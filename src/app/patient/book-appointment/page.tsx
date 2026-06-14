'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import toast from 'react-hot-toast';

interface Doctor {
  id: string;
  speciality: string;
  degree: string;
  experience: number;
  consultation_fee: number;
  rating: number;
  is_available: boolean;
  profile: { name: string; email: string; phone: string };
}

// যে কম্পোনেন্টটি useSearchParams ব্যবহার করে, তাকে আলাদা করে Suspense এর ভিতর রাখা হলো
function BookAppointmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');
  const { profile } = useAuthStore();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Function with useCallback
  const fetchDoctor = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*, profile:profiles(name, email, phone)')
        .eq('id', doctorId)
        .single();
      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }
      setDoctor(data);
    } catch (err) {
      console.error('Error fetching doctor:', err);
      toast.error('Failed to load doctor info');
    } finally {
      setLoadingDoctor(false);
    }
  }, [doctorId]);

  // useEffect with proper dependency
  useEffect(() => {
    const loadDoctor = async () => {
      if (doctorId) {
        await fetchDoctor();
      }
    };
    loadDoctor();
  }, [doctorId, fetchDoctor]);

  async function handleSubmit() {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }
    if (!profile?.id) {
      toast.error('Please login to book appointment');
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('is_available, consultation_fee')
        .eq('id', doctorId)
        .single();
      
      if (doctorError) {
        console.error('Doctor data error:', doctorError);
        throw doctorError;
      }
      
      if (!doctorData?.is_available) {
        toast.error('Doctor is not available at this time');
        setLoading(false);
        return;
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          doctor_id: doctorId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          symptoms: symptoms || null,
          fee: doctorData.consultation_fee,
          status: 'pending_payment',
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Appointment error:', appointmentError);
        throw appointmentError;
      }
      
      toast.success('Please complete payment to confirm appointment');
      router.push(`/patient/payment?appointment_id=${appointment.id}`);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  }

  if (loadingDoctor) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!doctor) return <div className="text-center py-12 text-text-grey">Doctor not found</div>;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-dark mb-8">Book Appointment</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Info */}
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-6 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-4xl">👨‍⚕️</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{doctor.profile.name}</h2>
                <p className="text-primary">{doctor.speciality}</p>
                <p className="text-text-grey text-sm">{doctor.degree}</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between"><span className="text-text-grey">Experience</span><span>{doctor.experience} years</span></div>
              <div className="flex justify-between"><span className="text-text-grey">Rating</span><span>⭐ {doctor.rating}</span></div>
              <div className="flex justify-between"><span className="text-text-grey">Consultation Fee</span><span className="font-bold text-primary text-xl">৳{doctor.consultation_fee}</span></div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-lg mb-6">Select Date & Time</h3>

            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Select Date</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedDate === date.toISOString().split('T')[0] ? 'bg-primary text-white border-primary shadow-md scale-105' : 'border-border hover:border-primary hover:shadow-md'}`}
                  >
                    <div className="text-xs font-medium">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                    <div className="text-lg font-bold mt-1">{date.getDate()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Select Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedTime === time ? 'bg-primary text-white border-primary shadow-md' : 'border-border hover:border-primary'}`}
                  >
                    <span className="font-medium">{time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-text-grey mb-3">Symptoms (Optional)</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Describe your symptoms..." />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-grey">Consultation Fee</span><span>৳{doctor.consultation_fee}</span></div>
                <div className="flex justify-between"><span className="text-text-grey">Platform Fee (10%)</span><span>৳{(doctor.consultation_fee * 0.1).toFixed(2)}</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold"><span>Total Payable</span><span className="text-primary">৳{doctor.consultation_fee}</span></div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !selectedDate || !selectedTime} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              {loading ? 'Processing...' : `Proceed to Payment - ৳${doctor.consultation_fee}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component wrapped in Suspense
export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <BookAppointmentForm />
    </Suspense>
  );
}