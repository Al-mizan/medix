export const prescriptionSearchableFields = [
    'instructions',
    'patient.name',
    'patient.email',
    'doctor.name',
    'doctor.email',
];

export const prescriptionFilterableFields = [
    'patientId',
    'doctorId',
    'appointmentId',
];

export const prescriptionIncludeConfig = {
    patient: true,
    doctor: true,
    appointment: {
        include: {
            schedule: true,
        }
    },
};
