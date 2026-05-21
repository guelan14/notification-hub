import * as messageService from '../services/message.service';
import * as messageRepository from '../repositories/message.repository';
import * as userRepository from '../repositories/user.repository';
import * as notificationService from '../services/notification.service';

jest.mock('../repositories/message.repository');
jest.mock('../repositories/user.repository');
jest.mock('../services/notification.service');

const mockCountToday = messageRepository.countTodayMessages as jest.Mock;
const mockFindUser = userRepository.findUserById as jest.Mock;
const mockSendTo = notificationService.sendToplatforms as jest.Mock;
const mockCreateMessage = messageRepository.createMessage as jest.Mock;
const mockGetMessages = messageRepository.getMessagesByUser as jest.Mock;
const mockGetAllMessages = messageRepository.getAllMessages as jest.Mock;

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

      await expect(messageService.sendMessage('invalid-user', 'hello', ['DISCORD'] as any)).rejects.toThrow(
        'User not found'
      );
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
    it('should return messages for user', async () => {
      mockGetMessages.mockResolvedValue([
        { id: 'msg-1', content: 'hello', platform: 'DISCORD' },
      ]);

      const result = await messageService.getUserMessages('user-1', {});

      expect(mockGetMessages).toHaveBeenCalledWith('user-1', {});
      expect(result).toHaveLength(1);
    });
  });

  describe('getAdminMetrics', () => {
    it('should return metrics for all users', async () => {
      mockGetAllMessages.mockResolvedValue([
        {
          userId: 'user-1',
          user: { username: 'testuser' },
          createdAt: new Date(),
        },
      ]);

      const result = await messageService.getAdminMetrics();

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('testuser');
    });
  });
});
