export interface Institute {
  _id: string;
  name: string;
  address: string;
  logo?: string | null;
  trainerName?: string | null;
  founderName?: string | null;
  createdAt?: string;
}

export interface Certificate {
  _id: string;
  orderId: string;
  candidateName: string;
  courseName: string;
  designation: string;
  completionDate: string;
  expiryDate?: string | null;
  level: string;
  rollNumber: string;
  photoUrl?: string | null;
  gender?: string | null;
  institutionName: string;
  duration: string;
  status: 'Completed' | 'On Process' | 'Incomplete';
  institute?: Institute | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  _id: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt?: string;
}

export interface SiteSettings {
  _id: string;
  headerLogoUrl?: string | null;
  faviconUrl?: string | null;
  ukrlpLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  footerText?: string | null;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
}

export interface DashboardStats {
  totalCertificates: number;
  totalInstitutions: number;
  pendingCertificates: number;
  completedCertificates: number;
}

export const CERTIFICATE_LEVELS = ['Foundational', 'Intermediate', 'Professional', 'Expert'] as const;
export const CERTIFICATE_STATUSES = ['Completed', 'On Process', 'Incomplete'] as const;
export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

/** True when an expiry date exists and is in the past. */
export function isExpired(cert: Pick<Certificate, 'expiryDate'>): boolean {
  if (!cert.expiryDate) return false;
  const d = new Date(cert.expiryDate);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}
