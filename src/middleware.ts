import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config';

/**
 * Auth.js v5 middleware using the edge-compatible config.
 * 
 * This uses the `authorized` callback defined in auth.config.ts
 * to handle authentication checks and role-based routing.
 * 
 * By using Auth.js's own auth() wrapper instead of raw getToken(),
 * we avoid cookie-name mismatches between Auth.js v5 (uses "authjs.*"
 * cookies) and the legacy getToken() helper (looks for "next-auth.*").
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
