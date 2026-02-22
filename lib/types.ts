// Type definitions for the FIR Management System

export type UserRole = 'Admin' | 'StationAdmin' | 'Officer';

export type CaseStatus = 'Registered' | 'Under Investigation' | 'Charge Sheet Filed' | 'Closed' | 'Pending';

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type PersonRole = 'Complainant' | 'Accused' | 'Suspect' | 'Witness' | 'Victim';

export type Gender = 'Male' | 'Female' | 'Other';

export type ServiceStatus = 'Active' | 'Inactive' | 'Retired' | 'Suspended';

export type EvidenceStatus = 'Collected' | 'Analyzed' | 'Stored' | 'Disposed';

export interface User {
  id: number;
  username: string;
  password_hash?: string;
  role: UserRole;
  station_id: number | null;
  officer_id: number | null;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionUser {
  id: number;
  username: string;
  role: UserRole;
  station_id: number | null;
  officer_id: number | null;
}

export interface PoliceStation {
  id: number;
  station_code: string;
  station_name: string;
  state: string;
  district: string;
  municipality: string | null;
  ward: string | null;
  jurisdiction: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  incharge_officer_id: number | null;
  photo: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Officer {
  id: number;
  badge_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  rank: string;
  department: string | null;
  station_id: number;
  contact_number: string | null;
  email: string | null;
  service_status: ServiceStatus;
  date_of_joining: Date | null;
  photo: string | null;
  signature: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Person {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: Date | null;
  gender: Gender;
  citizenship: string | null;
  national_id: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  photo: string | null;
  signature: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Case {
  id: number;
  fir_number: string;
  station_id: number;
  crime_type: string;
  crime_section: string | null;
  incident_date: Date;
  incident_location: string;
  incident_description: string;
  status: CaseStatus;
  priority: CasePriority;
  assigned_officer_id: number | null;
  registered_by_officer_id: number;
  registered_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CasePerson {
  id: number;
  case_id: number;
  person_id: number;
  role: PersonRole;
  statement: string | null;
  added_date: Date;
}

export interface Evidence {
  id: number;
  evidence_code: string;
  case_id: number;
  evidence_type: string;
  description: string;
  collection_date: Date;
  collection_location: string | null;
  collected_by_officer_id: number;
  file_path: string | null;
  status: EvidenceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface FIRTrackRecord {
  id: number;
  case_id: number;
  action_type: string;
  action_description: string;
  previous_status: string | null;
  new_status: string | null;
  performed_by_user_id: number;
  action_date: Date;
}
