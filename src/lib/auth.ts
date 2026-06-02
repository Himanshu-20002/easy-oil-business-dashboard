import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from './db';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { authConfig } from './auth.config';

/**
 * Full auth configuration with database-backed Credentials provider.
 * This extends the edge-compatible auth.config.ts with the actual
 * provider logic that requires Node.js runtime (mongoose, bcrypt).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          const email = credentials.email.toString().toLowerCase().trim();
          const user = await User.findOne({ email });
          
          if (!user) {
            return null;
          }
          
          if (!user.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password.toString(),
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            companyRef: user.companyRef ? user.companyRef.toString() : null,
            transporterRef: user.transporterRef ? user.transporterRef.toString() : null
          };
        } catch (error: any) {
          console.error('Authorization error:', error?.message);
          return null;
        }
      }
    })
  ]
});
