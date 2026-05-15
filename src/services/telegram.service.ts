import axios from 'axios'
import https from 'https'

const ipv4Agent = new https.Agent({ family: 4 })

export const sendTelegramMessage = async (content: string, username: string): Promise<string> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN!
  const chatId = process.env.TELEGRAM_CHAT_ID!

  const response = await axios.post(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text: `*${username}*: ${content}`,
      parse_mode: 'Markdown'
    },
    { httpsAgent: ipv4Agent }
  )

  return `Status ${response.status}`
}