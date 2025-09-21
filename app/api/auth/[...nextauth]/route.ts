import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {faker} from '@faker-js/faker';
import User from "@/models/User";
import connectDB from "@/lib/db";

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

const handler = NextAuth({
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
    async jwt({ token, user }) {
      await connectDB();
      
      const existingUser = await User.findOne({ email: token.email });
      
      if (!existingUser) {
        const alias = await generateAnonymousAlias();
        const newUser = await User.create({
          email: token.email,
          alias: alias,
        });
        token.id = newUser._id.toString();
        token.alias = newUser.alias;
      } else {
        token.id = existingUser._id.toString();
        token.alias = existingUser.alias;
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
});

export { handler as GET, handler as POST };