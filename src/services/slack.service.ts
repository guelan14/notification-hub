import axios from 'axios';

export const sendSlackMessage = async (content: string, username: string): Promise<string> => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

  const response = await axios.post(webhookUrl, {
    text: `*${username}*: ${content}`,
  });

  return `Status ${response.status}`;
};