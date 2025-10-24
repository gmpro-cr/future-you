/**
 * Generate avatar/portrait for personas
 * For realistic personas, uses placeholder photo services
 * For others, uses DiceBear API with different styles
 */

export type AvatarStyle =
  | 'realistic'      // Photorealistic portrait style
  | 'professional'   // Professional headshot style
  | 'artistic'       // Artistic/creative style
  | 'casual'         // Casual photo style
  | 'initials';      // Simple text-based with initials

/**
 * Check if persona name likely refers to a real person
 */
function isLikelyRealPerson(name: string, description?: string): boolean {
  const combined = `${name} ${description || ''}`.toLowerCase();

  // Check for common real person indicators
  const realPersonIndicators = [
    /\b(ceo|founder|entrepreneur|celebrity|actor|singer|musician|artist|author|politician)\b/,
    /\b(elon|musk|gates|jobs|zuckerberg|bezos)\b/,
    /\b(kim|taehyung|bts|blackpink)\b/,
    /\b(tesla|apple|microsoft|google|meta|amazon)\b/,
  ];

  return realPersonIndicators.some(pattern => pattern.test(combined));
}

/**
 * Generate a persona avatar URL
 * Uses illustrated avatars from DiceBear or emoji-based avatars
 */
export function generatePersonaAvatar(
  personaName: string,
  style: AvatarStyle = 'realistic',
  description?: string,
  emoji?: string
): string {
  const seed = encodeURIComponent(personaName);
  const backgroundColor = getColorFromName(personaName);

  // If emoji is provided, create an emoji-based avatar
  if (emoji) {
    return createEmojiAvatar(emoji, backgroundColor);
  }

  // For realistic/professional personas - use illustrated portrait style
  if (style === 'realistic' || style === 'professional') {
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=${backgroundColor}&radius=50&size=400`;
  }

  // For artistic personas, use "personas" for illustrated style
  if (style === 'artistic') {
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=${backgroundColor}&radius=50&size=400`;
  }

  // For casual personas, use "adventurer" for friendly appearance
  if (style === 'casual') {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=${backgroundColor}&radius=50&size=400`;
  }

  // Fallback to initials style using UI Avatars
  const textColor = 'ffffff';
  return `https://ui-avatars.com/api/?name=${seed}&size=400&background=${backgroundColor}&color=${textColor}&bold=true&format=svg`;
}

/**
 * Create an emoji-based avatar using data URI
 */
function createEmojiAvatar(emoji: string, backgroundColor: string): string {
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#${backgroundColor}" rx="50"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="200" font-family="system-ui, -apple-system, sans-serif">
        ${emoji}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Hash a string to a number for consistent avatar selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a consistent color from a name (for backgrounds)
 */
function getColorFromName(name: string): string {
  // Hash the name to get a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to a nice color (avoiding too dark or too bright)
  const colors = [
    '6366f1', // indigo
    '8b5cf6', // purple
    'ec4899', // pink
    'f43f5e', // rose
    '06b6d4', // cyan
    '10b981', // emerald
    'f59e0b', // amber
    '3b82f6', // blue
    '14b8a6', // teal
    'a855f7', // violet
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get style suggestion based on persona name/description
 */
export function suggestAvatarStyle(personaName: string, description?: string): AvatarStyle {
  const combined = `${personaName} ${description || ''}`.toLowerCase();

  // Professional personas
  if (combined.match(/professional|business|entrepreneur|ceo|manager/)) {
    return 'professional';
  }

  // Creative/Artistic personas
  if (combined.match(/artist|creative|designer|musician|poet|singer/)) {
    return 'artistic';
  }

  // Casual personas
  if (combined.match(/casual|friendly|cheerful/)) {
    return 'casual';
  }

  // Default to realistic
  return 'realistic';
}

/**
 * Get Tailwind CSS color classes for a persona based on their name
 * Returns consistent colors for UI elements like badges
 */
export function getPersonaColor(personaName: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-yellow-100 text-yellow-700',
    'bg-indigo-100 text-indigo-700',
    'bg-red-100 text-red-700',
    'bg-teal-100 text-teal-700',
  ];

  // Generate consistent color based on name
  const hash = personaName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
