import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth configuration.
 * This file must NOT import mongoose, bcrypt, or any Node.js-only modules
 * because it is used by the middleware which runs in the Edge runtime.
 *
 * The full auth config (with providers + DB logic) is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [], // Actual providers are added in auth.ts (needs Node.js runtime)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyRef = (user as any).companyRef;
        token.transporterRef = (user as any).transporterRef;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).companyRef = token.companyRef as string | null;
        (session.user as any).transporterRef = token.transporterRef as string | null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public routes — always allow
      const publicPaths = ['/', '/login', '/register', '/register/transporter'];
      const publicPrefixes = [
        '/_next',
        '/api/auth',
        '/api/register',
        '/api/db/',
        '/favicon.ico',
        '/uploads'
      ];

      if (publicPaths.includes(pathname)) return true;
      for (const prefix of publicPrefixes) {
        if (pathname.startsWith(prefix)) return true;
      }

      // Not logged in → redirect to login
      if (!isLoggedIn) {
        return false; // Auth.js will redirect to pages.signIn
      }

      // Role-based route guards
      const role = (auth?.user as any)?.role;

      if (pathname.startsWith('/customer') && role !== 'customer') {
        return Response.redirect(new URL(getHomeForRole(role), nextUrl));
      }
      if (pathname.startsWith('/officer') && role !== 'sales_officer' && role !== 'admin') {
        return Response.redirect(new URL(getHomeForRole(role), nextUrl));
      }
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return Response.redirect(new URL(getHomeForRole(role), nextUrl));
      }
      if (pathname.startsWith('/transporter') && role !== 'transporter') {
        return Response.redirect(new URL(getHomeForRole(role), nextUrl));
      }

      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'development-secret-key-change-in-production' : undefined)
};

function getHomeForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'sales_officer':
      return '/officer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    case 'transporter':
      return '/transporter/dashboard';
    default:
      return '/login';
  }
}
