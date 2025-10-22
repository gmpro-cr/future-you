// Generate consistent avatar image URL based on persona name
export const getPersonaAvatar = (personaName: string): string => {
  const avatarMap: Record<string, string> = {
    // Career personas - Professional/Business themed
    'Tech Lead': 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech-leader&backgroundColor=b6e3f4&style=circle',
    'Senior': 'https://api.dicebear.com/7.x/avataaars/svg?seed=senior-professional&backgroundColor=c0aede&style=circle',
    'Successful Graduate': 'https://api.dicebear.com/7.x/avataaars/svg?seed=graduate&backgroundColor=ffd5dc&style=circle',
    'Successful Founder': 'https://api.dicebear.com/7.x/avataaars/svg?seed=founder-success&backgroundColor=ffdfbf&style=circle',
    'Entrepreneur': 'https://api.dicebear.com/7.x/avataaars/svg?seed=entrepreneur&backgroundColor=d1f4e0&style=circle',

    // Life stage personas
    'Thriving': 'https://api.dicebear.com/7.x/avataaars/svg?seed=thriving-life&backgroundColor=fff4e6&style=circle',
    'Wisdom': 'https://api.dicebear.com/7.x/avataaars/svg?seed=wisdom-elder&backgroundColor=e0e7ff&style=circle',

    // Universal personas
    'Health': 'https://api.dicebear.com/7.x/avataaars/svg?seed=health-fitness&backgroundColor=dcfce7&style=circle',
    'Wellness': 'https://api.dicebear.com/7.x/avataaars/svg?seed=wellness-mindful&backgroundColor=fce7f3&style=circle',
    'Financial': 'https://api.dicebear.com/7.x/avataaars/svg?seed=financial-free&backgroundColor=fef3c7&style=circle',
    'Relationship': 'https://api.dicebear.com/7.x/avataaars/svg?seed=relationship-love&backgroundColor=ffe4e6&style=circle',
    'Creative': 'https://api.dicebear.com/7.x/avataaars/svg?seed=creative-artist&backgroundColor=ddd6fe&style=circle',
    'Fulfilled': 'https://api.dicebear.com/7.x/avataaars/svg?seed=fulfilled-happy&backgroundColor=fef9c3&style=circle',

    // Default
    'Future You': 'https://api.dicebear.com/7.x/avataaars/svg?seed=future-self&backgroundColor=e0f2fe&style=circle',
  };

  // Find matching keyword in persona name
  for (const [keyword, imageUrl] of Object.entries(avatarMap)) {
    if (personaName.includes(keyword)) {
      return imageUrl;
    }
  }

  // Generate unique avatar based on persona name if no match
  const seed = personaName.toLowerCase().replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=f0f0f0&style=circle`;
};

export const getPersonaColor = (personaName: string): string => {
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
};
