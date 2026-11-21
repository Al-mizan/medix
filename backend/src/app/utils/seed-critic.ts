import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { Role, UserStatus, Gender, BloodGroup } from '../../generated/prisma/enums';
import { envVars } from '../config/env';

export const CRITIC_CREDENTIALS = {
  admin: {
    email: envVars.SUPER_ADMIN_EMAIL || 'admin@medix.com',
    password: envVars.SUPER_ADMIN_PASSWORD || 'SecureSuperAdminPassword123!',
    name: 'Super Admin',
  },
  doctor: {
    email: 'doctor.critic@medix.test',
    password: 'CriticDoctor123!',
    name: 'Dr. Sarah Khan, MD',
  },
  patient: {
    email: 'patient.critic@medix.test',
    password: 'CriticPatient123!',
    name: 'Alex Rivera',
  },
};

export async function resetAndSeedCriticDatabase(): Promise<void> {
  console.log('--- [Critic Seeder] Starting database reset and seed ---');

  // 1. Clean up transient test records from prior runs
  console.log('[1/5] Cleaning prior critic appointments and slots...');
  const testDoctor = await prisma.doctor.findFirst({
    where: { email: CRITIC_CREDENTIALS.doctor.email },
  });

  const testPatient = await prisma.patient.findFirst({
    where: { email: CRITIC_CREDENTIALS.patient.email },
  });

  if (testDoctor || testPatient) {
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          testDoctor ? { doctorId: testDoctor.id } : {},
          testPatient ? { patientId: testPatient.id } : {},
        ],
      },
    });

    if (testDoctor) {
      await prisma.doctorSchedules.deleteMany({
        where: { doctorId: testDoctor.id },
      });
      await prisma.doctorSpecialty.deleteMany({
        where: { doctorId: testDoctor.id },
      });
    }
  }

  // Delete synthetic critic doctors and admins created during critic tests
  await prisma.doctor.deleteMany({
    where: { email: { contains: 'critic_test_' } },
  });
  await prisma.admin.deleteMany({
    where: { email: { contains: 'critic_test_' } },
  });
  await prisma.user.deleteMany({
    where: { email: { contains: 'critic_test_' } },
  });

  // 2. Ensure Specialties exist
  console.log('[2/5] Ensuring default specialties...');
  const defaultSpecialties = [
    { title: 'Cardiology', description: 'Heart and cardiovascular system care', icon: 'Heart' },
    { title: 'Neurology', description: 'Brain and nervous system disorders', icon: 'Brain' },
    { title: 'General Physician', description: 'Comprehensive primary healthcare', icon: 'Stethoscope' },
    { title: 'Pediatrics', description: 'Infant, child, and adolescent healthcare', icon: 'Baby' },
    { title: 'Dermatology', description: 'Skin, hair, and nail health', icon: 'Sparkles' },
  ];

  for (const s of defaultSpecialties) {
    await prisma.specialty.upsert({
      where: { title: s.title },
      create: { title: s.title, description: s.description, icon: s.icon },
      update: { description: s.description },
    });
  }

  const cardiologySpecialty = await prisma.specialty.findUnique({
    where: { title: 'Cardiology' },
  });

  // 3. Ensure Super Admin Account
  console.log('[3/5] Verifying Super Admin account...');
  let adminUser = await prisma.user.findUnique({
    where: { email: CRITIC_CREDENTIALS.admin.email },
  });

  if (!adminUser) {
    const created = await auth.api.signUpEmail({
      body: {
        email: CRITIC_CREDENTIALS.admin.email,
        password: CRITIC_CREDENTIALS.admin.password,
        name: CRITIC_CREDENTIALS.admin.name,
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false,
      },
    });
    adminUser = await prisma.user.update({
      where: { id: created.user.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE },
    });
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        name: CRITIC_CREDENTIALS.admin.name,
        email: CRITIC_CREDENTIALS.admin.email,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE, role: Role.SUPER_ADMIN },
    });
    const adminRecord = await prisma.admin.findUnique({
      where: { userId: adminUser.id },
    });
    if (!adminRecord) {
      await prisma.admin.create({
        data: {
          userId: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
        },
      });
    }
  }

  // 4. Ensure Test Doctor Account
  console.log('[4/5] Provisioning Doctor Critic account & schedules...');
  let doctorUser = await prisma.user.findUnique({
    where: { email: CRITIC_CREDENTIALS.doctor.email },
  });

  if (!doctorUser) {
    const created = await auth.api.signUpEmail({
      body: {
        email: CRITIC_CREDENTIALS.doctor.email,
        password: CRITIC_CREDENTIALS.doctor.password,
        name: CRITIC_CREDENTIALS.doctor.name,
        role: Role.DOCTOR,
        needPasswordChange: false,
        rememberMe: false,
      },
    });
    doctorUser = await prisma.user.update({
      where: { id: created.user.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE },
    });
  } else {
    await prisma.user.update({
      where: { id: doctorUser.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE, role: Role.DOCTOR },
    });
  }

  let doctorRecord = await prisma.doctor.findUnique({
    where: { email: CRITIC_CREDENTIALS.doctor.email },
  });

  if (!doctorRecord) {
    doctorRecord = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        name: CRITIC_CREDENTIALS.doctor.name,
        email: CRITIC_CREDENTIALS.doctor.email,
        registrationNumber: 'CRITIC-DOC-001',
        experience: 12,
        gender: Gender.FEMALE,
        appointmentFee: 1200,
        qualification: 'MBBS, FCPS (Cardiology)',
        currentWorkingPlace: 'Dhaka Medical College & Hospital',
        designation: 'Associate Professor',
        contactNumber: '+8801711223344',
        address: 'Dhanmondi, Dhaka',
      },
    });
  }

  if (cardiologySpecialty) {
    await prisma.doctorSpecialty.upsert({
      where: {
        doctorId_specialtyId: {
          doctorId: doctorRecord.id,
          specialtyId: cardiologySpecialty.id,
        },
      },
      create: {
        doctorId: doctorRecord.id,
        specialtyId: cardiologySpecialty.id,
      },
      update: {},
    });
  }

  // Generate 4 fresh 30-minute schedule slots for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const slotHours = [10, 11, 14, 15];

  for (const hour of slotHours) {
    const start = new Date(tomorrow);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(hour, 30, 0, 0);

    const schedule = await prisma.schedule.create({
      data: {
        startDateTime: start,
        endDateTime: end,
      },
    });

    await prisma.doctorSchedules.create({
      data: {
        doctorId: doctorRecord.id,
        scheduleId: schedule.id,
        isBooked: false,
      },
    });
  }

  // 5. Ensure Test Patient Account
  console.log('[5/5] Provisioning Patient Critic account...');
  let patientUser = await prisma.user.findUnique({
    where: { email: CRITIC_CREDENTIALS.patient.email },
  });

  if (!patientUser) {
    const created = await auth.api.signUpEmail({
      body: {
        email: CRITIC_CREDENTIALS.patient.email,
        password: CRITIC_CREDENTIALS.patient.password,
        name: CRITIC_CREDENTIALS.patient.name,
        role: Role.PATIENT,
        needPasswordChange: false,
        rememberMe: false,
      },
    });
    patientUser = await prisma.user.update({
      where: { id: created.user.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE },
    });
  } else {
    await prisma.user.update({
      where: { id: patientUser.id },
      data: { emailVerified: true, status: UserStatus.ACTIVE, role: Role.PATIENT },
    });
  }

  let patientRecord = await prisma.patient.findUnique({
    where: { email: CRITIC_CREDENTIALS.patient.email },
  });

  if (!patientRecord) {
    patientRecord = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        name: CRITIC_CREDENTIALS.patient.name,
        email: CRITIC_CREDENTIALS.patient.email,
        contactNumber: '+8801811223344',
        address: 'Mirpur, Dhaka',
      },
    });
  }

  // Upsert Patient Health Data
  await prisma.patientHealthData.upsert({
    where: { patientId: patientRecord.id },
    create: {
      patientId: patientRecord.id,
      gender: Gender.MALE,
      dateOfBirth: new Date('1992-05-15'),
      bloodGroup: BloodGroup.A_POSITIVE,
      height: '175 cm',
      weight: '70 kg',
      hasAllergies: false,
      hasDiabetes: false,
      smokingStatus: false,
      dietaryPreferences: 'Balanced, low sodium',
    },
    update: {
      bloodGroup: BloodGroup.A_POSITIVE,
      height: '175 cm',
      weight: '70 kg',
    },
  });

  console.log('--- [Critic Seeder] Database successfully reset and seeded! ---');
  console.log(`Admin:   ${CRITIC_CREDENTIALS.admin.email}`);
  console.log(`Doctor:  ${CRITIC_CREDENTIALS.doctor.email}`);
  console.log(`Patient: ${CRITIC_CREDENTIALS.patient.email}`);
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAndSeedCriticDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Critic seeding error:', err);
      process.exit(1);
    });
}
