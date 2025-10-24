import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      // Store Google user data in the user object for later use
      if (account?.provider === 'google' && profile) {
        // User data will be passed to JWT and session callbacks
        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Skip onboarding for authenticated users, go directly to personas
      if (url === `${baseUrl}/onboarding`) {
        return `${baseUrl}/personas`;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/personas`;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        // Add all Google user data to session
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
        // @ts-ignore - Add custom fields to session
        if (token.googleId) session.user.googleId = token.googleId as string;
        // @ts-ignore
        if (token.locale) session.user.locale = token.locale as string;
        // @ts-ignore
        if (token.emailVerified !== undefined) session.user.emailVerified = token.emailVerified as boolean;
        // @ts-ignore
        if (token.givenName) session.user.givenName = token.givenName as string;
        // @ts-ignore
        if (token.familyName) session.user.familyName = token.familyName as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      // Store all available Google profile data in token
      if (profile) {
        token.email = profile.email;
        token.picture = profile.picture;
        token.googleId = profile.sub; // Google account ID
        token.locale = profile.locale; // Language/region preference
        token.emailVerified = profile.email_verified;
        token.givenName = profile.given_name;
        token.familyName = profile.family_name;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
