import axios from 'axios'

export const sendDiscordMessage = async (content: string, username: string): Promise<string> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL!

  const response = await axios.post(webhookUrl, {
    content: `**${username}**: ${content}`,
  })

  return `Status ${response.status}`
}