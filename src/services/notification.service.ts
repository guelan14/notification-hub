import { sendDiscordMessage } from './discord.service';
import { sendSlackMessage } from './slack.service';
import { sendTelegramMessage } from './telegram.service';
import { Platform as PrismaPlatform } from '@prisma/client';

export type Platform = PrismaPlatform;

export interface DeliveryResult {
  platform: Platform;
  status: 'SUCCESS' | 'FAILED';
  providerResponse: string;
}

export const sendToPlatforms = async (
  content: string,
  username: string,
  platforms: Platform[]
): Promise<DeliveryResult[]> => {
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      if (platform === 'DISCORD') {
        const response = await sendDiscordMessage(content, username);
        return { platform, status: 'SUCCESS' as const, providerResponse: response };
      }
      if (platform === 'TELEGRAM') {
        const response = await sendTelegramMessage(content, username);
        return { platform, status: 'SUCCESS' as const, providerResponse: response };
      }
      if (platform === 'SLACK') {
        const response = await sendSlackMessage(content, username);
        return { platform, status: 'SUCCESS' as const, providerResponse: response };
      }
      throw new Error(`Unknown platform: ${platform}`);
    })
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      platform: platforms[i],
      status: 'FAILED' as const,
      providerResponse: (result.reason as Error)?.message || 'Unknown error',
    };
  });
};
