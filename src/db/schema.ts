import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  varchar,
  json,
  integer,
  primaryKey,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { eq, relations } from "drizzle-orm";
import type { DefaultSession } from "next-auth";
import { randomUUID } from "crypto";
import { Adapter } from "next-auth/adapters";
import { db } from ".";

// Define custom types for NextAuth
type UserId = string;
interface Account {
  userId: UserId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

// Add this new interface
export interface ResearchSource {
  title: string;
  summary: string;
  source: string;
  url?: string;
}

// Add these types
export type PlanType = "free" | "starter" | "unlimited";

export interface PlanFeatures {
  articleLimit: number;
  customBranding: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  apiAccess: boolean;
}

// Add plans table
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["free", "starter", "unlimited"] }).notNull(),
  price: integer("price").notNull(), // in cents
  features: jsonb("features").$type<PlanFeatures>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  planId: integer("plan_id")
    .references(() => plans.id)
    .notNull(),
  status: text("status", { enum: ["active", "cancelled", "expired"] })
    .notNull()
    .default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  cancelAt: timestamp("cancel_at"),
  canceledAt: timestamp("canceled_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

// Users table - Make planId optional
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  planId: integer("plan_id").references(() => plans.id),
});

// NextAuth accounts table
export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

// NextAuth sessions table
export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  status: text("status", { enum: ["draft", "published", "failed"] })
    .default("draft")
    .notNull(),
  seoScore: integer("seo_score"),
  metadata: json("metadata").$type<{
    keywords: string[];
    description: string;
    readingTime: number;
    error?: string;
  }>(),
  sources: json("sources").$type<ResearchSource[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

// Article versions for revision history
export const articleVersions = pgTable("article_versions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
});

// Article analytics
export const articleAnalytics = pgTable("article_analytics", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  views: integer("views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  averageReadTime: integer("average_read_time"),
  bounceRate: real("bounce_rate"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const plansRelations = relations(plans, ({ many }) => ({
  users: many(users),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  articles: many(articles),
  accounts: many(accounts),
  sessions: many(sessions),
  plan: one(plans, {
    fields: [users.planId],
    references: [plans.id],
  }),
  subscription: many(subscriptions),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  user: one(users, {
    fields: [articles.userId],
    references: [users.id],
  }),
  versions: many(articleVersions),
  analytics: one(articleAnalytics, {
    fields: [articles.id],
    references: [articleAnalytics.articleId],
  }),
}));
