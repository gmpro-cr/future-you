export interface UserSession {
  userId: string;
  name: string;
  email?: string;
  isLoggedIn: boolean;
  loginTimestamp: string;
}

export const AUTH_SESSION_KEY = 'auth_session';

export const createUserSession = (userId: string, name: string, email?: string): UserSession => {
  const session: UserSession = {
    userId,
    name,
    email,
    isLoggedIn: true,
    loginTimestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  return session;
};

export const getUserSession = (): UserSession | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
};

export const isUserLoggedIn = (): boolean => {
  const session = getUserSession();
  return session !== null && session.isLoggedIn;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem('user_profile');
    localStorage.removeItem('personas');
    localStorage.removeItem('selected_persona_id');
  }
};

export const updateSession = (updates: Partial<UserSession>): void => {
  const session = getUserSession();
  if (session) {
    const updatedSession = { ...session, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedSession));
    }
  }
};
