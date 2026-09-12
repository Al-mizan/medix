import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryBuilder } from '../QueryBuilder';
import { PrismaModelDelegate } from '../../interface/query.interface';

describe('QueryBuilder', () => {
  let mockModel: PrismaModelDelegate & {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockModel = {
      findMany: vi.fn().mockResolvedValue([{ id: '1', name: 'Dr. John' }]),
      count: vi.fn().mockResolvedValue(1),
    };
  });

  describe('search()', () => {
    it('should generate OR search conditions for direct fields', () => {
      const qb = new QueryBuilder(
        mockModel,
        { searchTerm: 'john' },
        { searchableFields: ['name', 'email'] }
      );

      qb.search();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        OR: [
          { name: { contains: 'john', mode: 'insensitive' } },
          { email: { contains: 'john', mode: 'insensitive' } },
        ],
      });
    });

    it('should generate nested 2-level relation search conditions', () => {
      const qb = new QueryBuilder(
        mockModel,
        { searchTerm: 'cardiologist' },
        { searchableFields: ['user.name', 'specialty.title'] }
      );

      qb.search();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        OR: [
          { user: { name: { contains: 'cardiologist', mode: 'insensitive' } } },
          { specialty: { title: { contains: 'cardiologist', mode: 'insensitive' } } },
        ],
      });
    });

    it('should generate nested 3-level relation search conditions with some operator', () => {
      const qb = new QueryBuilder(
        mockModel,
        { searchTerm: 'surgery' },
        { searchableFields: ['specialties.specialty.title'] }
      );

      qb.search();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        OR: [
          {
            specialties: {
              some: {
                specialty: {
                  title: { contains: 'surgery', mode: 'insensitive' },
                },
              },
            },
          },
        ],
      });
    });

    it('should not add search conditions if searchTerm is not provided', () => {
      const qb = new QueryBuilder(
        mockModel,
        {},
        { searchableFields: ['name'] }
      );

      qb.search();
      const query = qb.getQuery();

      expect(query.where).toEqual({});
    });
  });

  describe('filter()', () => {
    it('should handle direct filter values including booleans and numbers', () => {
      const qb = new QueryBuilder(
        mockModel,
        { isDeleted: 'false', status: 'ACTIVE', age: '30' },
        { filterableFields: ['isDeleted', 'status', 'age'] }
      );

      qb.filter();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        isDeleted: false,
        status: 'ACTIVE',
        age: 30,
      });
    });

    it('should handle range filters like lt, gt, lte, gte', () => {
      const qb = new QueryBuilder(
        mockModel,
        { appointmentFee: { gte: '50', lte: '200' } },
        { filterableFields: ['appointmentFee'] }
      );

      qb.filter();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        appointmentFee: { gte: 50, lte: 200 },
      });
    });

    it('should handle 2-level nested relation filters', () => {
      const qb = new QueryBuilder(
        mockModel,
        { 'user.email': 'test@example.com' },
        { filterableFields: ['user.email'] }
      );

      qb.filter();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        user: { email: 'test@example.com' },
      });
    });

    it('should ignore non-whitelisted filterable fields when filterableFields is specified', () => {
      const qb = new QueryBuilder(
        mockModel,
        { maliciousField: 'drop_table', allowedField: 'valid' },
        { filterableFields: ['allowedField'] }
      );

      qb.filter();
      const query = qb.getQuery();

      expect(query.where).toEqual({
        allowedField: 'valid',
      });
    });
  });

  describe('paginate()', () => {
    it('should default to page 1 and limit 10 with skip 0', () => {
      const qb = new QueryBuilder(mockModel, {});

      qb.paginate();
      const query = qb.getQuery();

      expect(query.skip).toBe(0);
      expect(query.take).toBe(10);
    });

    it('should calculate correct skip and take for custom page and limit', () => {
      const qb = new QueryBuilder(mockModel, { page: 3, limit: 15 });

      qb.paginate();
      const query = qb.getQuery();

      expect(query.skip).toBe(30);
      expect(query.take).toBe(15);
    });
  });

  describe('sort()', () => {
    it('should default to createdAt descending', () => {
      const qb = new QueryBuilder(mockModel, {});

      qb.sort();
      const query = qb.getQuery();

      expect(query.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('should sort by direct field ascending', () => {
      const qb = new QueryBuilder(mockModel, { sortBy: 'name', sortOrder: 'asc' });

      qb.sort();
      const query = qb.getQuery();

      expect(query.orderBy).toEqual({ name: 'asc' });
    });

    it('should sort by nested relation field', () => {
      const qb = new QueryBuilder(mockModel, { sortBy: 'user.name', sortOrder: 'asc' });

      qb.sort();
      const query = qb.getQuery();

      expect(query.orderBy).toEqual({ user: { name: 'asc' } });
    });
  });

  describe('dynamicInclude()', () => {
    it('should apply default includes and dynamic requested includes', () => {
      const includeConfig = {
        doctor: true,
        patient: true,
        prescription: true,
      };

      const qb = new QueryBuilder(
        mockModel,
        { include: 'doctor,prescription' }
      );

      qb.dynamicInclude(includeConfig, ['patient']);
      const query = qb.getQuery();

      expect(query.include).toEqual({
        patient: true,
        doctor: true,
        prescription: true,
      });
    });
  });

  describe('execute()', () => {
    it('should call count and findMany and return paginated data with meta', async () => {
      mockModel.count.mockResolvedValue(25);
      mockModel.findMany.mockResolvedValue([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);

      const qb = new QueryBuilder(mockModel, { page: 2, limit: 10 });
      qb.paginate();

      const result = await qb.execute();

      expect(mockModel.count).toHaveBeenCalledTimes(1);
      expect(mockModel.findMany).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });
});
