export type AppRole = 'patient' | 'clinic_admin'
export type RequestStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled'
export type AppointmentReason = 'checkup' | 'bleeding' | 'sensitivity' | 'other'

export interface PatientProfile {
  id: string
  full_name: string | null
  phone: string | null
  age: number | null
  dni: string | null
  created_at: string
  updated_at: string
}

export interface CareReminder {
  id: string
  user_id: string
  label: string
  reminder_time: string
  repeat_days: number[]
  active: boolean
  created_at: string
}

export interface CareLog {
  id: string
  user_id: string
  logged_on: string
  brushed_morning: boolean
  brushed_evening: boolean
  cleaned_between_teeth: boolean
  created_at: string
  updated_at: string
}

export interface AppointmentRequest {
  id: string
  patient_id: string
  requested_date: string
  requested_time: string | null
  confirmation_email: string | null
  patient_note: string | null
  preferred_period: 'morning' | 'afternoon' | 'any'
  reason_code: AppointmentReason
  status: RequestStatus
  consent_accepted_at: string
  privacy_notice_version: string
  sensitive_data_consent_at: string | null
  sensitive_data_notice_version: string | null
  confirmation_email_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentAttachment {
  id: string
  appointment_request_id: string
  owner_id: string
  storage_path: string
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp'
  file_size_bytes: number
  created_at: string
}
