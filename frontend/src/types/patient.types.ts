export type Gender = "MALE" | "FEMALE" | "OTHER";

export type BloodGroup =
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";

export interface IPatientHealthData {
    id?: string;
    gender: Gender;
    dateOfBirth: string | Date;
    bloodGroup: BloodGroup;
    hasAllergies: boolean;
    hasDiabetes: boolean;
    height: string;
    weight: string;
    smokingStatus: boolean;
    dietaryPreferences?: string | null;
    pregnancyStatus: boolean;
    mentalHealthHistory?: string | null;
    immunizationStatus?: string | null;
    hasPastSurgeries: boolean;
    recentAnxiety: boolean;
    recentDepression: boolean;
    maritalStatus?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    patientId?: string;
}

export interface IMedicalReport {
    id: string;
    reportName: string;
    reportLink: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    patientId?: string;
}

export type IPatientProfile = IPatientDetails;

export interface IPatient {
    id: string;
    userId: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    isDeleted: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    user: {
        id: string;
        email: string;
        role: string;
        status: import("./doctor.types").UserStatus;
        needPasswordChange?: boolean;
        createdAt?: string | Date;
        updatedAt?: string | Date;
    };
    patientHealthData?: IPatientHealthData | null;
    medicalReports?: IMedicalReport[];
}

export interface IPatientDetails extends IPatient {
    appointments?: Array<{
        id: string;
        status: string;
        appointmentDate?: string;
        doctor?: {
            id: string;
            name: string;
            designation?: string;
            profilePhoto?: string | null;
        };
        schedule?: {
            startDateTime: string;
            endDateTime: string;
        };
    }>;
}

export interface IUpdatePatientHealthDataPayload {
    gender?: Gender;
    dateOfBirth?: string;
    bloodGroup?: BloodGroup;
    hasAllergies?: boolean;
    hasDiabetes?: boolean;
    height?: string;
    weight?: string;
    smokingStatus?: boolean;
    dietaryPreferences?: string;
    pregnancyStatus?: boolean;
    mentalHealthHistory?: string;
    immunizationStatus?: string;
    hasPastSurgeries?: boolean;
    recentAnxiety?: boolean;
    recentDepression?: boolean;
    maritalStatus?: string;
}

export interface IUpdatePatientProfilePayload {
    patientInfo?: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
    };
    patientHealthData?: IUpdatePatientHealthDataPayload;
    medicalReports?: Array<{
        shouldDelete?: boolean;
        reportId?: string;
        reportName?: string;
        reportLink?: string;
    }>;
}
