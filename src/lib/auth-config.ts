import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { db } from "@/db";
import { users, sessions, accounts, plans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Adapter } from "next-auth/adapters";

const customAdapter: Adapter = {
  // ... existing adapter code ...
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // ... existing callbacks ...
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    // ... existing events ...
  },
};
