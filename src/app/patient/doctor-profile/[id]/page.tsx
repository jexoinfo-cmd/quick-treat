'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import toast from 'react-hot-toast';

interface DoctorProfile {
  id: string;
  speciality: string;
  degree: string;
  experience: number;
  consultation_fee: number;
  followup_fee: number;
  rating: number;
  about_en: string;
  about_bn: string;
  profile?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

function DoctorProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuthStore();

  const doctorId = params?.id as string;

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  const fetchDoctor = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(name,email,phone)
        `)
        .eq('id', doctorId)
        .maybeSingle();

      if (error) throw error;

      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Fixed: Wrapped fetchDoctor call in an async function
  useEffect(() => {
    const loadDoctor = async () => {
      if (doctorId) {
        await fetchDoctor();
      }
    };
    loadDoctor();
  }, [doctorId, fetchDoctor]);

  const bookAppointment = () => {
    if (!profile) {
      toast.error('Please login to book appointment');
      router.push('/login');
      return;
    }

    router.push(`/patient/book-appointment?doctorId=${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">Doctor not found</p>

        <button
          onClick={() => router.push('/patient/doctors')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Find Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Doctor Header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-teal-light rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍⚕️</span>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-teal-dark">
              {doctor?.profile?.name ?? 'Doctor'}
            </h1>

            <p className="text-text-grey">
              {doctor.degree || 'N/A'}
            </p>

            <p className="text-primary font-medium mt-1">
              {doctor.speciality || 'Specialist'}
            </p>

            <p className="text-text-grey text-sm mt-2">
              Doctor Code: DR{doctor.id?.slice(0, 6)}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">
                  {doctor.experience || 0}+
                </p>
                <p className="text-xs text-text-grey">Years Exp.</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">
                  {doctor.rating || 0}
                </p>
                <p className="text-xs text-text-grey">Rating</p>
              </div>
            </div>

            <button
              onClick={bookAppointment}
              className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'info'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          Info
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'about'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          About
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">
              Consultation Info
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Consultation Fee</span>
                <span className="font-bold text-primary text-xl">
                  ৳{doctor.consultation_fee || 0}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Follow-up Fee</span>
                <span className="font-medium">
                  ৳{doctor.followup_fee || Math.max((doctor.consultation_fee || 0) - 200, 0)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Experience</span>
                <span className="font-medium">
                  {doctor.experience || 0} years
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">Degree</span>
                <span className="font-medium">
                  {doctor.degree || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">
              Schedule
            </h2>

            <div className="space-y-2">
              <p className="text-text-grey">Saturday (08:00 PM - 11:30 PM)</p>
              <p className="text-text-grey">Sunday (12:30 PM - 11:00 PM)</p>
              <p className="text-text-grey">Monday (Off)</p>
              <p className="text-text-grey">Tuesday (05:30 PM - 11:00 PM)</p>
              <p className="text-text-grey">Wednesday (02:30 PM - 11:55 PM)</p>
              <p className="text-text-grey">Thursday (03:00 PM - 11:45 PM)</p>
              <p className="text-text-grey">Friday (11:00 AM - 10:00 PM)</p>
            </div>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-teal-dark mb-4">
            About the Doctor
          </h2>

          <p className="text-text-grey leading-relaxed">
            {doctor.about_en ||
              `ডাঃ ${doctor?.profile?.name ?? 'Doctor'} একজন অভিজ্ঞ ${doctor.speciality || 'বিশেষজ্ঞ'} চিকিৎসক। তিনি ${doctor.experience || 0} বছরের বেশি অভিজ্ঞতা সম্পন্ন একজন চিকিৎসক।`}
          </p>
        </div>
      )}
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DoctorProfileContent />
    </Suspense>
  );
}