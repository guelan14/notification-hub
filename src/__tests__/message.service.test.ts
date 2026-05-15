import * as messageService from '../services/message.service'
import * as messageRepository from '../repositories/message.repository'
import * as userRepository from '../repositories/user.repository'
import * as notificationService from '../services/notification.service'

jest.mock('../repositories/message.repository')
jest.mock('../repositories/user.repository')
jest.mock('../services/notification.service')

const mockCountToday = messageRepository.countTodayMessages as jest.Mock
const mockFindUser = userRepository.findUserById as jest.Mock
const mockSendTo = notificationService.sendToplatforms as jest.Mock
const mockCreateMessage = messageRepository.createMessage as jest.Mock

describe('message.service', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('sendMessage', () => {
    it('should throw when daily limit is exceeded', async () => {
      mockCountToday.mockResolvedValue(100)

      await expect(
        messageService.sendMessage('user-1', 'hello', ['DISCORD'])
      ).rejects.toThrow('Daily message limit')
    })

    it('should send message and persist it', async () => {
      mockCountToday.mockResolvedValue(0)
      mockFindUser.mockResolvedValue({ id: 'user-1', username: 'testuser' })
      mockSendTo.mockResolvedValue([
        { platform: 'DISCORD', status: 'SUCCESS', providerResponse: 'Status 204' }
      ])
      mockCreateMessage.mockResolvedValue({
        id: 'msg-1',
        content: 'hello',
        userId: 'user-1',
        deliveries: [{ platform: 'DISCORD', status: 'SUCCESS' }]
      })

      const result = await messageService.sendMessage('user-1', 'hello', ['DISCORD'])

      expect(mockSendTo).toHaveBeenCalledWith('hello', 'testuser', ['DISCORD'])
      expect(mockCreateMessage).toHaveBeenCalled()
      expect(result.id).toBe('msg-1')
    })

    it('should persist FAILED status when platform fails', async () => {
      mockCountToday.mockResolvedValue(0)
      mockFindUser.mockResolvedValue({ id: 'user-1', username: 'testuser' })
      mockSendTo.mockResolvedValue([
        { platform: 'DISCORD', status: 'FAILED', providerResponse: 'Webhook error' }
      ])
      mockCreateMessage.mockResolvedValue({
        id: 'msg-2',
        content: 'hello',
        userId: 'user-1',
        deliveries: [{ platform: 'DISCORD', status: 'FAILED' }]
      })

      const result = await messageService.sendMessage('user-1', 'hello', ['DISCORD'])

      const delivery = (result as any).deliveries[0]
      expect(delivery.status).toBe('FAILED')
    })
  })
})