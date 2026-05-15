import { sendDiscordMessage } from './discord.service'
import { sendTelegramMessage } from './telegram.service'

export type Platform = 'DISCORD' | 'TELEGRAM'

export interface DeliveryResult {
  platform: Platform
  status: 'SUCCESS' | 'FAILED'
  providerResponse: string
}

export const sendToplatforms = async (
  content: string,
  username: string,
  platforms: Platform[]
): Promise<DeliveryResult[]> => {
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      if (platform === 'DISCORD') {
        const response = await sendDiscordMessage(content, username)
        return { platform, status: 'SUCCESS' as const, providerResponse: response }
      }
      if (platform === 'TELEGRAM') {
        const response = await sendTelegramMessage(content, username)
        return { platform, status: 'SUCCESS' as const, providerResponse: response }
      }
      throw new Error(`Unknown platform: ${platform}`)
    })
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value
    return {
      platform: platforms[i],
      status: 'FAILED' as const,
      providerResponse: result.reason?.message || 'Unknown error'
    }
  })
}