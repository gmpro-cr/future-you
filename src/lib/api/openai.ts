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
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('🤖 Generating response with system prompt:', {
        attempt,
        systemPromptLength: systemPrompt.length,
        systemPromptPreview: systemPrompt.substring(0, 150) + '...',
        messageHistoryCount: messages.length,
        userMessage: userMessage.substring(0, 100),
      });

      // Use Gemini Flash model
      const model = genAI.getGenerativeModel({
        model: 'models/gemini-2.0-flash-exp'
      });

      // Build conversation context from history
      const contextMessages = messages
        .filter((msg) => msg.role !== 'system')
        .slice(-8) // Keep last 8 messages for context
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Create comprehensive prompt with system instructions embedded
      const fullPrompt = `===CRITICAL ROLE-PLAY INSTRUCTIONS===
YOU ARE NOW PLAYING A SPECIFIC CHARACTER. THIS IS MANDATORY.

CHARACTER DEFINITION:
${systemPrompt}

===ABSOLUTE RULES===
1. You MUST respond ONLY as this character
2. You MUST use the speaking style, tone, and personality described above
3. You MUST never say "I'm an AI" or break character
4. You MUST embody this persona completely in EVERY single response
5. Even when answering simple questions like "hi" or "how are you", respond AS THIS CHARACTER

${contextMessages ? `===PREVIOUS CONVERSATION===\n${contextMessages}\n\n` : ''}===USER'S MESSAGE===
${userMessage}

===YOUR RESPONSE (AS THE CHARACTER DESCRIBED ABOVE)===
Remember: Respond as the character! Stay in character! Use their voice, personality, and perspective!`;

      // Generate response
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Gemini doesn't provide detailed token counts like OpenAI
      // Estimate based on text length
      const estimatedTokens = Math.ceil(responseText.length / 4);

      console.log(`✅ Response generated successfully on attempt ${attempt}`);

      return {
        response: responseText,
        usage: {
          prompt: estimatedTokens,
          completion: estimatedTokens,
          total: estimatedTokens * 2,
        },
      };
    } catch (error: any) {
      lastError = error;

      // Check if it's a 503 Service Unavailable error (model overloaded)
      const isOverloaded = error?.status === 503 ||
                          error?.message?.includes('overloaded') ||
                          error?.message?.includes('503');

      if (isOverloaded && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Model overloaded, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // If it's not an overload error or we've exhausted retries, throw
      console.error('Gemini API error:', error);
      break;
    }
  }

  throw new Error('Failed to generate response from Gemini API. The model may be temporarily overloaded. Please try again in a moment.');
}
