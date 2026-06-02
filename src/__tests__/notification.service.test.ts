import * as notificationService from '../services/notification.service';
import * as discordService from '../services/discord.service';
import * as slackService from '../services/slack.service';
import * as telegramService from '../services/telegram.service';

jest.mock('../services/discord.service');
jest.mock('../services/slack.service');
jest.mock('../services/telegram.service');

const mockSendDiscord = discordService.sendDiscordMessage as jest.Mock;
const mockSendSlack = slackService.sendSlackMessage as jest.Mock;
const mockSendTelegram = telegramService.sendTelegramMessage as jest.Mock;

describe('notification.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('routes messages to Slack provider', async () => {
    mockSendSlack.mockResolvedValue('Status 200');

    const results = await notificationService.sendToPlatforms('hello', 'testuser', ['SLACK'] as any);

    expect(mockSendSlack).toHaveBeenCalledWith('hello', 'testuser');
    expect(results).toEqual([
      { platform: 'SLACK', status: 'SUCCESS', providerResponse: 'Status 200' },
    ]);
  });

  it('returns FAILED when provider throws', async () => {
    mockSendDiscord.mockRejectedValue(new Error('Webhook error'));

    const results = await notificationService.sendToPlatforms('hello', 'testuser', ['DISCORD'] as any);

    expect(results[0].status).toBe('FAILED');
    expect(results[0].providerResponse).toContain('Webhook error');
  });

  it('routes multiple providers', async () => {
    mockSendSlack.mockResolvedValue('Status 200');
    mockSendTelegram.mockResolvedValue('Status 200');

    const results = await notificationService.sendToPlatforms('hello', 'testuser', ['SLACK', 'TELEGRAM'] as any);

    expect(mockSendSlack).toHaveBeenCalledWith('hello', 'testuser');
    expect(mockSendTelegram).toHaveBeenCalledWith('hello', 'testuser');
    expect(results).toHaveLength(2);
  });
});
