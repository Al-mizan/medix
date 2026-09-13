/**
 * OpenAPI 3.0.0 Specification for Medix Healthcare Platform
 */

export const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Medix Healthcare API',
    version: '1.0.0',
    description:
      'Enterprise RESTful backend service for Medix — A Digital Healthcare and Telemedicine platform connecting patients, doctors, and administrators.',
    contact: {
      name: 'Medix Engineering Team',
      email: 'engineering@medix.health',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://medix-api.onrender.com/api/v1',
      description: 'Production Server (Render)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token in the format: Bearer <token>',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Operation executed successfully' },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 50 },
              totalPages: { type: 'number', example: 5 },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation Error or Resource Not Found' },
          errorMessages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
          stack: { type: 'string', example: 'Error stack trace in development mode' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'patient@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
        },
      },
      CreatePatientRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
          contactNumber: { type: 'string', example: '+8801700000000' },
          address: { type: 'string', example: 'Dhaka, Bangladesh' },
        },
      },
      CreateDoctorRequest: {
        type: 'object',
        required: [
          'name',
          'email',
          'password',
          'contactNumber',
          'registrationNumber',
          'experience',
          'gender',
          'appointmentFee',
          'qualification',
          'currentWorkingPlace',
          'designation',
        ],
        properties: {
          name: { type: 'string', example: 'Dr. Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sarah.connor@hospital.com' },
          password: { type: 'string', format: 'password', example: 'DoctorPassword123!' },
          contactNumber: { type: 'string', example: '+8801800000000' },
          registrationNumber: { type: 'string', example: 'BMDC-12345' },
          experience: { type: 'number', example: 8 },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'FEMALE' },
          appointmentFee: { type: 'number', example: 1000 },
          qualification: { type: 'string', example: 'MBBS, FCPS (Cardiology)' },
          currentWorkingPlace: { type: 'string', example: 'National Heart Foundation' },
          designation: { type: 'string', example: 'Senior Consultant' },
        },
      },
      CreateAdminRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'contactNumber'],
        properties: {
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', format: 'email', example: 'admin@medix.health' },
          password: { type: 'string', format: 'password', example: 'AdminPassword123!' },
          contactNumber: { type: 'string', example: '+8801900000000' },
        },
      },
      BookAppointmentRequest: {
        type: 'object',
        required: ['doctorId', 'scheduleId'],
        properties: {
          doctorId: { type: 'string', format: 'uuid', example: '018f3a5b-9d41-7c99-b1d5-2e0618035123' },
          scheduleId: { type: 'string', format: 'uuid', example: '018f3a5b-9d41-7c99-b1d5-2e0618035456' },
        },
      },
      ChangeAppointmentStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELED'],
            example: 'CANCELED',
          },
        },
      },
      CreateSpecialtyRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Cardiology' },
          description: { type: 'string', example: 'Heart and cardiovascular care' },
        },
      },
      CreateScheduleRequest: {
        type: 'object',
        required: ['startDate', 'endDate', 'startTime', 'endTime'],
        properties: {
          startDate: { type: 'string', format: 'date', example: '2026-10-01' },
          endDate: { type: 'string', format: 'date', example: '2026-10-07' },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '17:00' },
        },
      },
      CreatePrescriptionRequest: {
        type: 'object',
        required: ['appointmentId', 'instructions'],
        properties: {
          appointmentId: { type: 'string', format: 'uuid' },
          instructions: { type: 'string', example: 'Take Paracetamol 500mg twice daily after meals.' },
          followUpDate: { type: 'string', format: 'date', example: '2026-10-15' },
        },
      },
      CreateReviewRequest: {
        type: 'object',
        required: ['appointmentId', 'rating', 'comment'],
        properties: {
          appointmentId: { type: 'string', format: 'uuid' },
          rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Excellent consultation, doctor was very patient and attentive.' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Authenticated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Obtain new access token via refresh token cookie',
        responses: {
          200: { description: 'Access token refreshed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          401: { description: 'Unauthorized / expired refresh token' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Change password for authenticated user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                  oldPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Bad request' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new patient account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePatientRequest' } } },
        },
        responses: {
          201: { description: 'Patient registered successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/users/create-doctor': {
      post: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a new doctor (Admin/SuperAdmin only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDoctorRequest' } } },
        },
        responses: {
          201: { description: 'Doctor created successfully' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/users/create-admin': {
      post: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a new administrator (SuperAdmin only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAdminRequest' } } },
        },
        responses: {
          201: { description: 'Admin created successfully' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Get currently authenticated user profile',
        responses: {
          200: { description: 'Profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'Search and filter doctor directory (Public)',
        parameters: [
          { name: 'searchTerm', in: 'query', schema: { type: 'string' }, description: 'Search term across doctor name, email, or specialty' },
          { name: 'specialties.specialty.title', in: 'query', schema: { type: 'string' }, description: 'Filter by specialty title' },
          { name: 'appointmentFee', in: 'query', schema: { type: 'object' }, description: 'Range filter: appointmentFee[gte]=100&appointmentFee[lte]=500' },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 10 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Doctors list returned with pagination meta' },
        },
      },
    },
    '/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get single doctor details by ID (Public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Doctor details returned' },
          404: { description: 'Doctor not found' },
        },
      },
    },
    '/patients': {
      get: {
        tags: ['Patients'],
        security: [{ bearerAuth: [] }],
        summary: 'List all patients (Admin/SuperAdmin only)',
        parameters: [
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 10 } },
        ],
        responses: {
          200: { description: 'Patients list returned' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/patients/my-profile': {
      get: {
        tags: ['Patients'],
        security: [{ bearerAuth: [] }],
        summary: 'Get logged-in patient profile details',
        responses: {
          200: { description: 'Patient profile returned' },
          403: { description: 'Forbidden - not a patient' },
        },
      },
    },
    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        security: [{ bearerAuth: [] }],
        summary: 'Get patient by ID (Admin, SuperAdmin, or Doctor with active appointment)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Patient record returned' },
          404: { description: 'Patient not found' },
        },
      },
      delete: {
        tags: ['Patients'],
        security: [{ bearerAuth: [] }],
        summary: 'Soft-delete patient account (Admin/SuperAdmin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Patient soft-deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/appointments/book-appointment': {
      post: {
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        summary: 'Book appointment and generate Stripe Checkout URL (Patient only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookAppointmentRequest' } } },
        },
        responses: {
          201: { description: 'Appointment booked and Stripe session URL returned' },
          400: { description: 'Schedule unavailable or already booked' },
        },
      },
    },
    '/appointments/my-appointments': {
      get: {
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        summary: 'List appointments for authenticated patient or doctor',
        responses: {
          200: { description: 'Appointments list returned' },
        },
      },
    },
    '/appointments/status/{id}': {
      patch: {
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        summary: 'Update appointment status (Strict state machine transitions)',
        description:
          'Patients can only cancel (`CANCELED`) their own `SCHEDULED` appointments (frees doctor slot). Doctors can only advance `SCHEDULED` -> `INPROGRESS` and `INPROGRESS` -> `COMPLETED`. Completed or Canceled appointments cannot be modified.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeAppointmentStatusRequest' } } },
        },
        responses: {
          200: { description: 'Appointment status transitioned successfully' },
          400: { description: 'Invalid state machine transition' },
          403: { description: 'Unauthorized to perform status change' },
        },
      },
    },
    '/appointments/change-appointment-status/{id}': {
      patch: {
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        summary: 'Update appointment status (Strict state machine transitions)',
        description:
          'Patients can only cancel (`CANCELED`) their own `SCHEDULED` appointments (frees doctor slot). Doctors can only advance `SCHEDULED` -> `INPROGRESS` and `INPROGRESS` -> `COMPLETED`. Completed or Canceled appointments cannot be modified.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeAppointmentStatusRequest' } } },
        },
        responses: {
          200: { description: 'Appointment status transitioned successfully' },
          400: { description: 'Invalid state machine transition' },
          403: { description: 'Unauthorized to perform status change' },
        },
      },
    },
    '/schedules': {
      get: {
        tags: ['Schedules'],
        security: [{ bearerAuth: [] }],
        summary: 'List available schedule slots',
        responses: { 200: { description: 'Schedules returned' } },
      },
      post: {
        tags: ['Schedules'],
        security: [{ bearerAuth: [] }],
        summary: 'Generate bulk schedule slots (Admin/SuperAdmin only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateScheduleRequest' } } },
        },
        responses: { 201: { description: 'Schedules generated' } },
      },
    },
    '/specialties': {
      get: {
        tags: ['Specialties'],
        summary: 'Get all medical specialties (Public)',
        responses: { 200: { description: 'Specialties returned' } },
      },
      post: {
        tags: ['Specialties'],
        security: [{ bearerAuth: [] }],
        summary: 'Create new medical specialty (Admin/SuperAdmin only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSpecialtyRequest' } } },
        },
        responses: { 201: { description: 'Specialty created' } },
      },
    },
    '/specialties/{id}': {
      delete: {
        tags: ['Specialties'],
        security: [{ bearerAuth: [] }],
        summary: 'Soft delete a specialty (Admin/SuperAdmin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Specialty soft-deleted' } },
      },
    },
    '/prescriptions': {
      post: {
        tags: ['Prescriptions'],
        security: [{ bearerAuth: [] }],
        summary: 'Create prescription for appointment (Doctor only)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePrescriptionRequest' } } },
        },
        responses: { 201: { description: 'Prescription issued' } },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        summary: 'Submit patient review for completed appointment',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewRequest' } } },
        },
        responses: { 201: { description: 'Review submitted' } },
      },
    },
    '/appointments/initiate-payment/{id}': {
      post: {
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        summary: 'Initiate Stripe payment session for appointment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Stripe session created' } },
      },
    },
    '/stats': {
      get: {
        tags: ['Analytics & Meta'],
        security: [{ bearerAuth: [] }],
        summary: 'Retrieve dashboard metrics tailored to current user role',
        responses: { 200: { description: 'Dashboard analytics returned' } },
      },
    },
    '/rag/query': {
      post: {
        tags: ['RAG & AI Assistant'],
        summary: 'Query healthcare knowledge base with conversational AI',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string', example: 'What are the symptoms of hypertension?' },
                  topK: { type: 'integer', example: 5 },
                  minSimilarity: { type: 'number', example: 0.5 },
                  sourceTypes: {
                    type: 'array',
                    items: { type: 'string', enum: ['SPECIALTY', 'DOCTOR', 'APPOINTMENT', 'DOCUMENT', 'SYSTEM'] },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'AI Assistant response with context citations' } },
      },
    },
  },
};
