export const appointmentSearchableFields = [
    'patient.name',
    'patient.email',
    'doctor.name',
    'doctor.email',
];

export const appointmentFilterableFields = [
    'status',
    'paymentStatus',
    'patientId',
    'doctorId',
    'scheduleId',
];

export const appointmentIncludeConfig = {
    doctor: {
        include: {
            specialties: {
                include: {
                    specialty: true,
                }
            }
        }
    },
    patient: true,
    schedule: true,
    payment: true,
    prescription: true,
    review: true,
};
