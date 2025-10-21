import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function moderateContent(text: string): Promise<boolean> {
  try {
    // Simple keyword-based moderation for now
    // Gemini doesn't have a direct moderation API like OpenAI
    const harmfulPatterns = [
      /\b(kill|murder|suicide|harm yourself)\b/i,
      /\b(hate speech|racist|sexist)\b/i,
      /\b(explicit|nsfw|sexual content)\b/i,
    ];

    return harmfulPatterns.some((pattern) => pattern.test(text));
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
  try {
    // Use Gemini 2.5 Flash model (fast and efficient) - exact name from API
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash-preview-05-20' });

    // Build conversation context from history
    const contextMessages = messages
      .filter((msg) => msg.role !== 'system')
      .slice(-8) // Keep last 8 messages for context
      .map((msg) => `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`)
      .join('\n\n');

    // Combine system prompt, history, and user message
    const fullPrompt = `${systemPrompt}

${contextMessages ? `Previous conversation:\n${contextMessages}\n\n` : ''}Question: ${userMessage}

IMPORTANT: Keep your response brief and conversational (2-4 sentences max). Only give longer answers if the user specifically asks for detailed advice.

Answer:`;

    // Generate response using simple string format
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // Gemini doesn't provide detailed token counts like OpenAI
    // Estimate based on text length
    const estimatedTokens = Math.ceil(responseText.length / 4);

    return {
      response: responseText,
      usage: {
        prompt: estimatedTokens,
        completion: estimatedTokens,
        total: estimatedTokens * 2,
      },
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate response from Gemini API');
  }
}
