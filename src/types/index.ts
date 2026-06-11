export type UserRole = 'doctor' | 'hospital' | 'patient';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  district?: string;
  upazila?: string;
  profile_image?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  speciality: string;
  degree: string;
  experience: number;
  consultation_fee: number;
  followup_fee: number;
  about_bn?: string;
  about_en?: string;
  is_available: boolean;
  hospital_id?: string;
  rating: number;
  profile?: Profile;
}

export interface Hospital {
  id: string;
  total_beds: number;
  available_beds: number;
  has_oxygen: boolean;
  has_ot: boolean;
  profile?: Profile;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  created_at: string;
  doctor?: Doctor;
  patient?: Profile;
}

export interface Queue {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  token: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'skipped';
  created_at: string;
}