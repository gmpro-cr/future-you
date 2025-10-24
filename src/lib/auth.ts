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
        // Add additional user data to session
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
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
      // Store Google profile data in token
      if (profile) {
        token.email = profile.email;
        token.picture = profile.picture;
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
