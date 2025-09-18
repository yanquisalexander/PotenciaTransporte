import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDataSource } from '@/lib/db/config';
import { Driver } from '@/entities/Driver';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        document: { label: 'Document', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.document || !credentials?.password) {
          return null;
        }

        try {
          const dataSource = await getDataSource();
          const driverRepository = dataSource.getRepository(Driver);
          
          const driver = await driverRepository.findOne({
            where: { document: credentials.document }
          });

          if (!driver || !driver.hashedPassword) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, driver.hashedPassword);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: driver.id.toString(),
            name: driver.name,
            email: driver.email || driver.document,
            role: driver.role,
            document: driver.document,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.document = user.document;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role as string;
        session.user.document = token.document as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };