import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { db } from "@/db";
import { users, sessions, accounts, plans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";

const customAdapter: Adapter = {
  async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
    try {
      const freePlan = await db.query.plans.findFirst({
        where: eq(plans.type, "free"),
      });

      if (!freePlan) {
        throw new Error("Free plan not found");
      }

      const id = randomUUID();
      await db.insert(users).values({
        id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        planId: freePlan.id,
        subscriptionId: null,
        customerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!dbUser) {
        throw new Error("Failed to create user");
      }

      // Create initial session for new user
      const sessionToken = randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(sessions).values({
        sessionToken,
        userId: dbUser.id,
        expires,
      });

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        image: dbUser.image,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUser(id: string): Promise<AdapterUser | null> {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      image: dbUser.image,
    };
  },

  async getUserByEmail(email: string): Promise<AdapterUser | null> {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      image: dbUser.image,
    };
  },

  async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.providerAccountId, providerAccountId),
        eq(accounts.provider, provider)
      ),
    });

    if (!account) return null;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, account.userId),
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      image: dbUser.image,
    };
  },

  async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
    await db
      .update(users)
      .set({
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!dbUser) throw new Error("User not found");

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      image: dbUser.image,
    };
  },

  async linkAccount(account: AdapterAccount): Promise<void> {
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
  },

  async createSession(session: {
    sessionToken: string;
    userId: string;
    expires: Date;
  }): Promise<AdapterSession> {
    await db.insert(sessions).values(session);
    return session;
  },

  async getSessionAndUser(
    sessionToken: string
  ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
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
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        image: dbUser.image,
      },
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

        // Check if account exists
        const existingAccount = await db.query.accounts.findFirst({
          where: and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId)
          ),
        });

        // If account exists, ensure it matches the user
        if (existingAccount) {
          if (dbUser && existingAccount.userId === dbUser.id) {
            // Account is already properly linked
            // Just update the session
            const sessionToken = randomUUID();
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await db.delete(sessions).where(eq(sessions.userId, dbUser.id));
            await db.insert(sessions).values({
              sessionToken,
              userId: dbUser.id,
              expires,
            });

            return true;
          }
          // Account exists but doesn't match user - deny access
          return false;
        }

        // Create new user if doesn't exist
        if (!dbUser) {
          // Get the free plan
          const freePlan = await db.query.plans.findFirst({
            where: eq(plans.type, "free"),
          });

          if (!freePlan) {
            console.error("Free plan not found");
            return false;
          }

          const id = randomUUID();
          await db.insert(users).values({
            id,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: new Date(),
            planId: freePlan.id,
            subscriptionId: null,
            customerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          dbUser = await db.query.users.findFirst({
            where: eq(users.id, id),
          });

          if (!dbUser) return false;
          user.id = dbUser.id;
        }

        // Link new OAuth account
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
        console.error("SignIn error:", error);
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
        // Check if user still exists in database
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });

        if (!dbUser) {
          // User doesn't exist anymore, invalidate session
          await db.delete(sessions).where(eq(sessions.userId, token.id as string));
          return {
            ...session,
            error: "UserDeleted",
          };
        }

        // Check if session is valid
        const dbSession = await db.query.sessions.findFirst({
          where: and(
            eq(sessions.userId, token.id as string),
            eq(sessions.expires, new Date(session.expires))
          ),
        });

        if (!dbSession) {
          return {
            ...session,
            error: "InvalidSession",
          };
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
        console.error("Session validation error:", error);
        return {
          ...session,
          error: "SessionValidationError",
        };
      }
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signOut({ token }) {
      try {
        if (token?.sub) {
          // Delete all sessions for this user
          await db.delete(sessions).where(eq(sessions.userId, token.sub));
        }
      } catch (error) {
        console.error("Error during signOut:", error);
      }
    },
  },
};
