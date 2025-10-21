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
    // Use Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build conversation history for Gemini
    const history = messages
      .filter((msg) => msg.role !== 'system')
      .slice(-8) // Keep last 8 messages for context
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
        topP: 0.95,
        topK: 40,
      },
    });

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nRespond as the future self persona:`;

    // Send message
    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const responseText = response.text();

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
