import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { db } from "@/db";
import { users, sessions, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Adapter } from "next-auth/adapters";

const customAdapter: Adapter = {
  async createUser(user: any) {
    try {
      const id = randomUUID();
      await db.insert(users).values({
        id,
        name: user.name,
        email: user.email!,
        image: user.image,
        emailVerified: new Date(),
      });

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      // Create initial session for new user
      if (dbUser) {
        const sessionToken = randomUUID();
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await db.insert(sessions).values({
          sessionToken,
          userId: dbUser.id,
          expires,
        });
      }

      return dbUser!;
    } catch (error) {
      throw error;
    }
  },

  async getUser(id) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return dbUser || null;
  },

  async getUserByEmail(email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return dbUser || null;
  },

  async getUserByAccount({ providerAccountId, provider }) {
    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.providerAccountId, providerAccountId),
        eq(accounts.provider, provider)
      ),
    });

    if (!account) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, account.userId),
    });
    return user || null;
  },

  async linkAccount(account: any) {
    try {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });

      // Create or update session after linking account
      const sessionToken = randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Delete any existing sessions
      await db.delete(sessions).where(eq(sessions.userId, account.userId));

      // Create new session
      await db.insert(sessions).values({
        sessionToken,
        userId: account.userId,
        expires,
      });
    } catch (error) {
      throw error;
    }
  },

  async createSession({ sessionToken, userId, expires }) {
    await db.insert(sessions).values({
      sessionToken,
      userId,
      expires,
    });

    const dbSession = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });
    return dbSession!;
  },

  async getSessionAndUser(sessionToken) {
    const dbSession = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });

    if (!dbSession) return null;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, dbSession.userId),
    });

    if (!dbUser) return null;

    return {
      session: dbSession,
      user: dbUser,
    };
  },

  async updateSession({ sessionToken, expires }) {
    await db.update(sessions).set({ expires }).where(eq(sessions.sessionToken, sessionToken));

    const dbSession = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });
    return dbSession!;
  },

  async deleteSession(sessionToken) {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
  },

  async updateUser(user) {
    await db
      .update(users)
      .set({
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      })
      .where(eq(users.id, user.id));

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });
    return dbUser!;
  },

  async unlinkAccount({ providerAccountId, provider }) {
    await db
      .delete(accounts)
      .where(
        and(eq(accounts.providerAccountId, providerAccountId), eq(accounts.provider, provider))
      );
  },
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
    async signIn({ user, account, profile }) {
      try {
        if (!user.email || !account) return false;

        // Check if user exists
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        // Create new user if doesn't exist
        if (!dbUser) {
          const id = randomUUID();
          await db.insert(users).values({
            id,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: new Date(),
          });

          dbUser = await db.query.users.findFirst({
            where: eq(users.id, id),
          });

          if (!dbUser) return false;
          user.id = dbUser.id;
        }

        // Link OAuth account
        await db.insert(accounts).values({
          userId: dbUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        });

        // Create or update session
        const sessionToken = randomUUID();
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await db.delete(sessions).where(eq(sessions.userId, dbUser.id));

        await db.insert(sessions).values({
          sessionToken,
          userId: dbUser.id,
          expires,
        });

        return true;
      } catch (error) {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      const dbSession = await db.query.sessions.findFirst({
        where: eq(sessions.userId, token.id as string),
      });

      if (!dbSession) {
        return {
          ...token,
          error: "NoSessionFound",
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "NoSessionFound") {
        return {
          ...session,
          error: "NoSessionFound",
        };
      }

      try {
        const dbSession = await db.query.sessions.findFirst({
          where: and(
            eq(sessions.userId, token.id as string),
            eq(sessions.expires, new Date(session.expires))
          ),
        });

        if (!dbSession) {
          return session;
        }

        const dbUser = await customAdapter.getUser!(token.id as string);

        if (!dbUser) {
          return session;
        }

        return {
          ...session,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
          },
          expires: dbSession.expires.toISOString(),
        };
      } catch (error) {
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
