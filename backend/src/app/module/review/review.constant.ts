export const reviewSearchableFields = [
    'comment',
    'patient.name',
    'doctor.name',
];

export const reviewFilterableFields = [
    'rating',
    'doctorId',
    'patientId',
    'appointmentId',
];

export const reviewIncludeConfig = {
    doctor: true,
    patient: true,
    appointment: {
        include: {
            schedule: true,
        }
    },
};
