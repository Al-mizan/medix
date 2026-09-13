import { describe, it, expect, vi, beforeEach } from 'vitest';
import status from 'http-status';
import { Role, UserStatus } from '../../../../generated/prisma/enums';

const { mockUser, mockPatient } = vi.hoisted(() => ({
  mockUser: {
    findUnique: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  mockPatient: {
    create: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    user: mockUser,
    patient: mockPatient,
    $transaction: vi.fn(async (cb: (tx: {
      patient: typeof mockPatient;
    }) => Promise<unknown>) =>
      cb({
        patient: mockPatient,
      })
    ),
  },
}));

vi.mock('../../../lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      verifyEmailOTP: vi.fn(),
      getSession: vi.fn(),
      changePassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('../../../utils/token', () => ({
  tokenUtils: {
    getAccessToken: vi.fn().mockReturnValue('mock-access-token'),
    getRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
  },
}));

import { AuthService } from '../auth.service';
import { auth } from '../../../lib/auth';
import AppError from '../../../errorHelpers/AppError';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerPatient', () => {
    const payload = {
      name: 'Jane Patient',
      email: 'jane@example.com',
      password: 'StrongPassword123!',
    };

    it('should register patient successfully and return tokens with profile', async () => {
      const mockAuthUser = {
        id: 'usr-101',
        name: payload.name,
        email: payload.email,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
        isDeleted: false,
        emailVerified: false,
      };

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        user: mockAuthUser,
        token: 'session-token',
      } as unknown as Awaited<ReturnType<typeof auth.api.signUpEmail>>);

      const mockPatientRecord = {
        id: 'pat-101',
        userId: 'usr-101',
        name: payload.name,
        email: payload.email,
      };
      mockPatient.create.mockResolvedValue(mockPatientRecord);

      const result = await AuthService.registerPatient(payload);

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          email: payload.email,
          password: payload.password,
          name: payload.name,
        },
      });
      expect(mockPatient.create).toHaveBeenCalledWith({
        data: {
          userId: 'usr-101',
          name: payload.name,
          email: payload.email,
        },
      });
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('patient', mockPatientRecord);
    });

    it('should rollback user creation if patient record creation fails', async () => {
      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        user: { id: 'usr-fail', email: payload.email },
      } as unknown as Awaited<ReturnType<typeof auth.api.signUpEmail>>);

      mockPatient.create.mockRejectedValue(new Error('DB error on patient insert'));

      await expect(AuthService.registerPatient(payload)).rejects.toThrow('DB error on patient insert');
      expect(mockUser.delete).toHaveBeenCalledWith({
        where: { id: 'usr-fail' },
      });
    });
  });

  describe('loginUser', () => {
    const payload = {
      email: 'user@example.com',
      password: 'ValidPassword123!',
    };

    it('should successfully log in active user', async () => {
      const mockAuthUser = {
        id: 'usr-202',
        name: 'Alex User',
        email: payload.email,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
        isDeleted: false,
        emailVerified: true,
      };

      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        user: mockAuthUser,
        token: 'session-login-token',
      } as unknown as Awaited<ReturnType<typeof auth.api.signInEmail>>);

      const result = await AuthService.loginUser(payload);

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result.user).toEqual(mockAuthUser);
    });

    it('should throw FORBIDDEN if user is blocked', async () => {
      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        user: {
          id: 'usr-blocked',
          status: UserStatus.BLOCKED,
          isDeleted: false,
        },
      } as unknown as Awaited<ReturnType<typeof auth.api.signInEmail>>);

      await expect(AuthService.loginUser(payload)).rejects.toThrow(
        new AppError(status.FORBIDDEN, 'User is blocked')
      );
    });

    it('should throw NOT_FOUND if user is marked deleted', async () => {
      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        user: {
          id: 'usr-deleted',
          status: UserStatus.DELETED,
          isDeleted: true,
        },
      } as unknown as Awaited<ReturnType<typeof auth.api.signInEmail>>);

      await expect(AuthService.loginUser(payload)).rejects.toThrow(
        new AppError(status.NOT_FOUND, 'User is deleted')
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email OTP successfully', async () => {
      mockUser.findUnique.mockResolvedValue({
        id: 'usr-303',
        email: 'verify@example.com',
        isDeleted: false,
        status: UserStatus.ACTIVE,
        accounts: [{ providerId: 'credential' }],
      });

      vi.mocked(auth.api.verifyEmailOTP).mockResolvedValue({
        status: true,
        user: { id: 'usr-303', emailVerified: false },
      } as unknown as Awaited<ReturnType<typeof auth.api.verifyEmailOTP>>);

      mockUser.update.mockResolvedValue({ id: 'usr-303', emailVerified: true });

      await AuthService.verifyEmail('verify@example.com', '123456');

      expect(auth.api.verifyEmailOTP).toHaveBeenCalledWith({
        body: {
          email: 'verify@example.com',
          otp: '123456',
        },
      });
      expect(mockUser.update).toHaveBeenCalledWith({
        where: { email: 'verify@example.com' },
        data: { emailVerified: true },
      });
    });

    it('should reject OTP verification for Google OAuth accounts', async () => {
      mockUser.findUnique.mockResolvedValue({
        id: 'usr-google',
        email: 'google@example.com',
        isDeleted: false,
        status: UserStatus.ACTIVE,
        accounts: [{ providerId: 'google' }],
      });

      await expect(
        AuthService.verifyEmail('google@example.com', '123456')
      ).rejects.toThrow(
        new AppError(status.BAD_REQUEST, 'Google login user cannot use verify email feature')
      );

      expect(auth.api.verifyEmailOTP).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND if email does not exist in DB', async () => {
      mockUser.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.verifyEmail('unknown@example.com', '123456')
      ).rejects.toThrow(new AppError(status.NOT_FOUND, 'User not found'));
    });
  });
});
