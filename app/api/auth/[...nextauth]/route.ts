import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {faker} from '@faker-js/faker';
import User from "@/models/User";
import connectDB from "@/lib/db";

interface ExtendedUser {
  dbId?: string;
  alias?: string;
  email?: string | null;
}

async function generateAnonymousAlias() {
  const patterns = [
    () => `${faker.word.adjective()}${faker.animal.type()}${faker.number.int({ min: 100, max: 999 })}`,
    () => `${faker.color.human()}${faker.word.noun()}${faker.number.int({ min: 1000, max: 9999 })}`,
    () => `anonymous${faker.word.verb()}${faker.number.int({ min: 10, max: 99 })}`,
    () => `${faker.word.adverb()}${faker.word.adjective()}${faker.number.int({ min: 100, max: 999 })}`,
    () => `user${faker.hacker.noun().replace(/\s+/g, '')}${faker.number.int({ min: 100, max: 999 })}`
  ];
  
  let attempts = 0;
  const maxAttempts = 15;
  
  while (attempts < maxAttempts) {
    const patternIndex = attempts % patterns.length;
    let alias = patterns[patternIndex]().toLowerCase().replace(/\s+/g, '');
    
    if (alias.length > 20) {
      alias = alias.substring(0, 20);
    }
    
    const existingUser = await User.findOne({ alias });
    if (!existingUser) {
      return alias;
    }
    
    attempts++;
  }
  
  return `user${faker.number.int({ min: 100, max: 999 })}${Date.now().toString().slice(-6)}`.toLowerCase();
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const alias = await generateAnonymousAlias();
        const created = await User.create({ email: user.email!, alias });
        (user as ExtendedUser).dbId = created._id.toString();
        (user as ExtendedUser).alias = created.alias;
      } else {
        (user as ExtendedUser).dbId = existingUser._id.toString();
        (user as ExtendedUser).alias = existingUser.alias;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as ExtendedUser).dbId as string;
        token.alias = (user as ExtendedUser).alias as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.alias = token.alias as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };