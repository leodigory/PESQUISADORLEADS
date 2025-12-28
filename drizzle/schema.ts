import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table: stores identified Instagram users from real estate posts
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  instagramUsername: varchar("instagramUsername", { length: 255 }).notNull(),
  instagramProfileUrl: varchar("instagramProfileUrl", { length: 512 }).notNull(),
  commentText: text("commentText").notNull(),
  postUrl: varchar("postUrl", { length: 512 }).notNull(),
  postDate: timestamp("postDate"),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  keywords: varchar("keywords", { length: 500 }), // comma-separated keywords found
  sourceUrl: varchar("sourceUrl", { length: 512 }), // Google search result URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Searches table: stores search history and cache
 */
export const searches = mysqlTable("searches", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  resultsCount: int("resultsCount").default(0),
  searchQuery: text("searchQuery"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Search = typeof searches.$inferSelect;
export type InsertSearch = typeof searches.$inferInsert;