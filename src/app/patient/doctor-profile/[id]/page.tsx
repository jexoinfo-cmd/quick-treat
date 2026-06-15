'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
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

  // fetchDoctor ফাংশনটি সরিয়ে দেওয়া হয়েছে কারণ এটি আর ব্যবহৃত হচ্ছে না

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      if (!doctorId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            *,
            profile:profiles(name,email,phone)
          `)
          .eq('id', doctorId)
          .maybeSingle();

        if (error) throw error;

        if (isMounted) {
          if (data) {
            if (!data.profile) {
              data.profile = { name: 'ডাক্তার', email: null, phone: null };
            }
            setDoctor(data);
          } else {
            setDoctor(null);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        if (isMounted) {
          toast.error('ডাক্তারের তথ্য লোড করতে ব্যর্থ হয়েছে');
          setDoctor(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDoctor();

    // ক্লিনআপ ফাংশন - কম্পোনেন্ট আনমাউন্ট হলে স্টেট আপডেট প্রতিরোধ করে
    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  const bookAppointment = () => {
    if (!profile) {
      toast.error('অ্যাপয়েন্টমেন্ট বুক করতে লগইন করুন');
      router.push('/login');
      return;
    }

    if (!doctorId) {
      toast.error('ডাক্তার তথ্য পাওয়া যায়নি');
      return;
    }

    router.push(`/patient/book-appointment?doctorId=${doctorId}`);
  };

  // লোডিং স্টেট
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ডাক্তার না পাওয়া গেলে
  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">ডাক্তার পাওয়া যায়নি</p>
        <button
          onClick={() => router.push('/patient/doctors')}
          className="mt-4 text-primary hover:underline"
        >
          ডাক্তার খুঁজতে ফিরে যান
        </button>
      </div>
    );
  }

  // নিরাপদে ডাক্তারের নাম পাওয়া
  const doctorName = doctor?.profile?.name ?? 'ডাক্তার';
  const doctorSpeciality = doctor?.speciality ?? 'বিশেষজ্ঞ';
  const doctorDegree = doctor?.degree ?? 'N/A';
  const doctorExperience = doctor?.experience ?? 0;
  const doctorRating = doctor?.rating ?? 0;
  const doctorConsultationFee = doctor?.consultation_fee ?? 0;
  const doctorFollowupFee = doctor?.followup_fee ?? Math.max(doctorConsultationFee - 200, 0);
  const doctorAboutEn = doctor?.about_en ?? `ডাঃ ${doctorName} একজন অভিজ্ঞ ${doctorSpeciality} চিকিৎসক। তিনি ${doctorExperience} বছরের বেশি অভিজ্ঞতা সম্পন্ন একজন চিকিৎসক।`;

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
              {doctorName}
            </h1>

            <p className="text-text-grey">
              {doctorDegree}
            </p>

            <p className="text-primary font-medium mt-1">
              {doctorSpeciality}
            </p>

            <p className="text-text-grey text-sm mt-2">
              ডাক্তার কোড: DR{doctor?.id?.slice(0, 6) ?? '000000'}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">
                  {doctorExperience}+
                </p>
                <p className="text-xs text-text-grey">বছর অভিজ্ঞতা</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-teal-dark">
                  {doctorRating}
                </p>
                <p className="text-xs text-text-grey">রেটিং</p>
              </div>
            </div>

            <button
              onClick={bookAppointment}
              className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition"
            >
              অ্যাপয়েন্টমেন্ট বুক করুন
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
          তথ্য
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'about'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-grey hover:text-teal-dark'
          }`}
        >
          বিস্তারিত
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">
              পরামর্শের তথ্য
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">পরামর্শ ফি</span>
                <span className="font-bold text-primary text-xl">
                  ৳{doctorConsultationFee}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">ফলোআপ ফি</span>
                <span className="font-medium">
                  ৳{doctorFollowupFee}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">অভিজ্ঞতা</span>
                <span className="font-medium">
                  {doctorExperience} বছর
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-grey">ডিগ্রি</span>
                <span className="font-medium">
                  {doctorDegree}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-teal-dark mb-4">
              সময়সূচী
            </h2>

            <div className="space-y-2">
              <p className="text-text-grey">শনিবার (০৮:০০ PM - ১১:৩০ PM)</p>
              <p className="text-text-grey">রবিবার (১২:৩০ PM - ১১:০০ PM)</p>
              <p className="text-text-grey">সোমবার (বন্ধ)</p>
              <p className="text-text-grey">মঙ্গলবার (০৫:৩০ PM - ১১:০০ PM)</p>
              <p className="text-text-grey">বুধবার (০২:৩০ PM - ১১:৫৫ PM)</p>
              <p className="text-text-grey">বৃহস্পতিবার (০৩:০০ PM - ১১:৪৫ PM)</p>
              <p className="text-text-grey">শুক্রবার (১১:০০ AM - ১০:০০ PM)</p>
            </div>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-teal-dark mb-4">
            ডাক্তারের সম্পর্কে
          </h2>

          <p className="text-text-grey leading-relaxed">
            {doctorAboutEn}
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