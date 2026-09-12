export const patientSearchableFields = [
    'name',
    'email',
    'contactNumber',
    'address',
];

export const patientFilterableFields = [
    'name',
    'email',
    'contactNumber',
    'isDeleted',
];

export const patientIncludeConfig = {
    patientHealthData: true,
    medicalReports: true,
    user: true,
    appointments: {
        include: {
            doctor: true,
            schedule: true,
        }
    },
    prescriptions: true,
    reviews: true,
};
