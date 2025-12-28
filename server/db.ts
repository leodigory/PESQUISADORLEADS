import { eq, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, searches, InsertLead, InsertSearch, Lead, Search } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getLeadsByLocationAndDate(
  state: string,
  city: string,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leads: database not available");
    return [];
  }

  try {
    const conditions = [
      eq(leads.state, state),
      eq(leads.city, city),
    ];

    if (startDate && endDate) {
      conditions.push(gte(leads.postDate, startDate));
      conditions.push(lte(leads.postDate, endDate));
    }

    return await db
      .select()
      .from(leads)
      .where(and(...conditions))
      .orderBy(leads.postDate);
  } catch (error) {
    console.error("[Database] Failed to get leads:", error);
    return [];
  }
}

export async function createLead(lead: InsertLead): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }

  try {
    const result = await db.insert(leads).values(lead);
    const leadId = result[0].insertId;
    const created = await db
      .select()
      .from(leads)
      .where(eq(leads.id, Number(leadId)))
      .limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    return null;
  }
}

export async function createSearch(search: InsertSearch): Promise<Search | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create search: database not available");
    return null;
  }

  try {
    const result = await db.insert(searches).values(search);
    const searchId = result[0].insertId;
    const created = await db
      .select()
      .from(searches)
      .where(eq(searches.id, Number(searchId)))
      .limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create search:", error);
    return null;
  }
}

export async function getSearchHistory(state: string, city: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get search history: database not available");
    return [];
  }

  return await db
    .select()
    .from(searches)
    .where(and(eq(searches.state, state), eq(searches.city, city)))
    .orderBy(searches.createdAt);
}
