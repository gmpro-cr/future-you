export interface UserProfile {
  name: string;
  birthdate?: string; // Optional for Google sign-in users
  country?: string; // Optional for Google sign-in users
  profession?: string; // Optional for Google sign-in users
  email?: string; // Email from Google
  image?: string; // Profile picture URL from Google
  googleId?: string; // Google account ID (unique identifier)
  locale?: string; // Language/region preference (e.g., en-IN)
  emailVerified?: boolean; // Whether email is verified
}

export const saveUserProfile = (profile: Partial<UserProfile>): void => {
  if (typeof window !== 'undefined') {
    // Merge with existing profile to preserve data
    const existingProfile = getUserProfile();
    const mergedProfile = { ...existingProfile, ...profile };
    localStorage.setItem('user_profile', JSON.stringify(mergedProfile));
  }
};

export const getUserProfile = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
};

export const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export const hasUserProfile = (): boolean => {
  return getUserProfile() !== null;
};
