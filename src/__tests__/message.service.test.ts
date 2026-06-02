import * as messageService from '../services/message.service';
import * as messageRepository from '../repositories/message.repository';
import * as userRepository from '../repositories/user.repository';
import * as notificationService from '../services/notification.service';

jest.mock('../repositories/message.repository');
jest.mock('../repositories/user.repository');
jest.mock('../services/notification.service');

const mockCountToday      = messageRepository.countTodayMessages as jest.Mock;
const mockFindUser        = userRepository.findUserById as jest.Mock;
const mockSendTo          = notificationService.sendToplatforms as jest.Mock;
const mockCreateMessage   = messageRepository.createMessage as jest.Mock;
const mockGetMessages     = messageRepository.getMessagesByUser as jest.Mock;
const mockGetAllUsers     = userRepository.getAllUsers as jest.Mock;
const mockGroupedTotal    = messageRepository.getMessageCountsGroupedByUser as jest.Mock;
const mockGroupedToday    = messageRepository.getTodayMessageCountsGroupedByUser as jest.Mock;

const DEFAULT_FILTERS = { page: 1, limit: 20 };

describe('message.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('sendMessage', () => {
    it('should throw when daily limit is exceeded', async () => {
      mockCountToday.mockResolvedValue(100);

      await expect(messageService.sendMessage('user-1', 'hello', ['DISCORD'])).rejects.toThrow(
        'Daily message limit'
      );
    });

    it('should send message to single platform', async () => {
      mockCountToday.mockResolvedValue(0);
      mockFindUser.mockResolvedValue({ id: 'user-1', username: 'testuser' });
      mockSendTo.mockResolvedValue([
        { platform: 'DISCORD', status: 'SUCCESS', providerResponse: 'Status 204' },
      ]);
      mockCreateMessage.mockResolvedValue({
        id: 'msg-1',
        content: 'hello',
        userId: 'user-1',
        deliveries: [{ platform: 'DISCORD', status: 'SUCCESS' }],
      });

      const result = await messageService.sendMessage('user-1', 'hello', ['DISCORD'] as any);

      expect(mockSendTo).toHaveBeenCalledWith('hello', 'testuser', ['DISCORD'] as any);
      expect(mockCreateMessage).toHaveBeenCalled();
      expect(result.id).toBe('msg-1');
    });

    it('should send message to Slack platform', async () => {
      mockCountToday.mockResolvedValue(0);
      mockFindUser.mockResolvedValue({ id: 'user-1', username: 'testuser' });
      mockSendTo.mockResolvedValue([
        { platform: 'SLACK', status: 'SUCCESS', providerResponse: 'Status 200' },
      ]);
      mockCreateMessage.mockResolvedValue({
        id: 'msg-2',
        content: 'test message',
        userId: 'user-1',
        deliveries: [{ platform: 'SLACK', status: 'SUCCESS' }],
      });

      const result = await messageService.sendMessage('user-1', 'test message', ['SLACK'] as any);

      expect(mockSendTo).toHaveBeenCalledWith('test message', 'testuser', ['SLACK'] as any);
      expect(result.deliveries[0].platform).toBe('SLACK');
    });

    it('should throw when user not found', async () => {
      mockCountToday.mockResolvedValue(0);
      mockFindUser.mockResolvedValue(null);

      await expect(
        messageService.sendMessage('invalid-user', 'hello', ['DISCORD'] as any)
      ).rejects.toThrow('User not found');
    });

    it('should persist FAILED status when platform fails', async () => {
      mockCountToday.mockResolvedValue(0);
      mockFindUser.mockResolvedValue({ id: 'user-1', username: 'testuser' });
      mockSendTo.mockResolvedValue([
        { platform: 'DISCORD', status: 'FAILED', providerResponse: 'Webhook error' },
      ]);
      mockCreateMessage.mockResolvedValue({
        id: 'msg-3',
        content: 'hello',
        userId: 'user-1',
        deliveries: [{ platform: 'DISCORD', status: 'FAILED' }],
      });

      const result = await messageService.sendMessage('user-1', 'hello', ['DISCORD'] as any);

      expect(result.deliveries[0].status).toBe('FAILED');
    });
  });

  describe('getUserMessages', () => {
    it('should return paginated messages for user', async () => {
      mockGetMessages.mockResolvedValue({
        messages: [{ id: 'msg-1', content: 'hello', createdAt: new Date(), deliveries: [] }],
        total: 1,
      });

      const result = await messageService.getUserMessages('user-1', DEFAULT_FILTERS);

      expect(mockGetMessages).toHaveBeenCalledWith('user-1', DEFAULT_FILTERS);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should calculate totalPages correctly', async () => {
      mockGetMessages.mockResolvedValue({ messages: [], total: 55 });

      const result = await messageService.getUserMessages('user-1', { page: 2, limit: 20 });

      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.page).toBe(2);
    });
  });

  describe('getAdminMetrics', () => {
    it('should return metrics for all users including those with no messages', async () => {
      mockGetAllUsers.mockResolvedValue([
        { id: 'user-1', username: 'alice' },
        { id: 'user-2', username: 'bob' },
      ]);
      mockGroupedTotal.mockResolvedValue([{ userId: 'user-1', _count: { id: 3 } }]);
      mockGroupedToday.mockResolvedValue([{ userId: 'user-1', _count: { id: 1 } }]);

      const result = await messageService.getAdminMetrics();

      expect(result).toHaveLength(2);

      const alice = result.find((r) => r.username === 'alice')!;
      expect(alice.totalMessages).toBe(3);
      expect(alice.remainingToday).toBe(99);

      const bob = result.find((r) => r.username === 'bob')!;
      expect(bob.totalMessages).toBe(0);
      expect(bob.remainingToday).toBe(100);
    });
  });
});
