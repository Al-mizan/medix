import { UserRole } from "@/lib/authUtils";

export interface IPatientProfile {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    patientHealthData?: {
        gender?: string | null;
        dateOfBirth?: string | null;
        bloodGroup?: string | null;
        hasAllergies?: boolean | null;
        hasDiabetes?: boolean | null;
        height?: string | null;
        weight?: string | null;
        smokingStatus?: boolean | null;
        dietaryPreferences?: string | null;
        pregnancyStatus?: boolean | null;
        mentalHealthHistory?: string | null;
        immunizationStatus?: string | null;
        hasPastSurgeries?: boolean | null;
        recentAnxiety?: boolean | null;
        recentDepression?: boolean | null;
        maritalStatus?: string | null;
    } | null;
    medicalReports?: Array<{
        id: string;
        reportName: string;
        reportLink: string;
        createdAt?: string;
    }>;
}

export interface IDoctorProfile {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    registrationNumber?: string | null;
    experience?: number | null;
    gender?: string | null;
    appointmentFee?: number | null;
    qualification?: string | null;
    currentWorkingPlace?: string | null;
    designation?: string | null;
    averageRating?: number | null;
    specialties?: Array<{
        specialtyId: string;
        specialty?: {
            id: string;
            title: string;
            icon?: string | null;
        };
    }>;
}

export interface IAdminProfile {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string | null;
    profilePhoto?: string | null;
    status?: string | null;
    emailVerified?: boolean | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    patient?: IPatientProfile | null;
    doctor?: IDoctorProfile | null;
    admin?: IAdminProfile | null;
}
