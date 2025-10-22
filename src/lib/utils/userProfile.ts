export interface UserProfile {
  name: string;
  birthdate: string;
  country: string;
  profession: string;
}

export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_profile', JSON.stringify(profile));
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
