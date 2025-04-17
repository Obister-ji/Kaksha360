import { fetchTests, createTest, updateTest, deleteTest } from '@/services/testService';
import { supabase } from '@/integrations/supabase/client';
import { TestSchedule } from '@/types/test';

// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    }
  }
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Test Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTests', () => {
    it('should fetch tests from Supabase', async () => {
      // Mock Supabase response
      const mockTests = [
        {
          id: '1',
          title: 'Test 1',
          instructor: 'LAKSHYA',
          date: '2025/01/20',
          time: '02:00 PM - 05:00 PM',
          duration: '3 hours',
          status: 'ONLINE',
          participants: ['Class 12 - Science'],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: null,
          created_by: 'user-id'
        }
      ];

      (supabase.select as jest.Mock).mockImplementation(() => ({
        order: jest.fn().mockReturnValue({
          data: mockTests,
          error: null
        })
      }));

      const result = await fetchTests();

      expect(supabase.from).toHaveBeenCalledWith('tests');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(result).toEqual([
        {
          id: '1',
          title: 'Test 1',
          instructor: 'LAKSHYA',
          date: '2025/01/20',
          time: '02:00 PM - 05:00 PM',
          duration: '3 hours',
          status: 'ONLINE',
          participants: ['Class 12 - Science']
        }
      ]);
    });
  });

  describe('createTest', () => {
    it('should create a new test in Supabase', async () => {
      const newTest: Omit<TestSchedule, 'id'> = {
        title: 'New Test',
        instructor: 'LAKSHYA',
        date: '2025/01/20',
        time: '02:00 PM - 05:00 PM',
        duration: '3 hours',
        status: 'ONLINE',
        participants: ['Class 12 - Science']
      };

      const mockResponse = {
        id: '123',
        ...newTest,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: null,
        created_by: 'test-user-id'
      };

      (supabase.insert as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: mockResponse,
            error: null
          })
        })
      }));

      const result = await createTest(newTest);

      expect(supabase.from).toHaveBeenCalledWith('tests');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Test',
        instructor: 'LAKSHYA',
        date: '2025/01/20',
        time: '02:00 PM - 05:00 PM',
        duration: '3 hours',
        status: 'ONLINE',
        participants: ['Class 12 - Science'],
        created_by: 'test-user-id'
      }));

      expect(result).toEqual({
        id: '123',
        title: 'New Test',
        instructor: 'LAKSHYA',
        date: '2025/01/20',
        time: '02:00 PM - 05:00 PM',
        duration: '3 hours',
        status: 'ONLINE',
        participants: ['Class 12 - Science']
      });
    });
  });
});
