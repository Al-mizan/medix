export const specialtySearchableFields = [
    'title',
    'description',
];

export const specialtyFilterableFields = [
    'title',
    'isDeleted',
];

export const specialtyIncludeConfig = {
    doctorSpecialties: {
        include: {
            doctor: true,
        }
    }
};
