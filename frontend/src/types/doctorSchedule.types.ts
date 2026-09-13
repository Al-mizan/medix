export interface IDoctorScheduleDoctor {
    id?: string;
    name?: string;
    email?: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    designation?: string;
    qualification?: string;
    currentWorkingPlace?: string;
    experience?: number;
    appointmentFee?: number;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        status?: string;
    };
    specialties?: Array<{
        specialty?: {
            id?: string;
            title?: string;
            icon?: string;
        };
    }>;
    appointments?: Array<{
        id: string;
        scheduleId: string;
        status?: string;
        patient?: {
            id?: string;
            name?: string;
            email?: string;
        };
    }>;
}

export interface IDoctorScheduleSchedule {
    id: string;
    startDateTime: string | Date;
    endDateTime: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface IDoctorSchedule {
    doctorId: string;
    scheduleId: string;
    isBooked: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    schedule?: IDoctorScheduleSchedule;
    doctor?: IDoctorScheduleDoctor;
    appointmentId?: string | null;
}

export interface ICreateDoctorSchedulePayload {
    scheduleIds: string[];
}

export interface IUpdateDoctorSchedulePayload {
    scheduleIds: Array<{
        shouldDelete: boolean;
        id: string;
    }>;
}
