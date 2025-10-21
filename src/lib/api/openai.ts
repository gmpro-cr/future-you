import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey,
});

export async function moderateContent(text: string): Promise<boolean> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    return moderation.results[0].flagged;
  } catch (error) {
    console.error('Moderation error:', error);
    // Fail open - don't block users if moderation fails
    return false;
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userMessage: string
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8), // Keep last 8 messages for context (cost optimization)
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 500,
    presence_penalty: 0.6,
    frequency_penalty: 0.3,
  });

  return {
    response: completion.choices[0].message.content || '',
    usage: {
      prompt: completion.usage?.prompt_tokens || 0,
      completion: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0,
    },
  };
}
