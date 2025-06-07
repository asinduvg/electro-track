import { 
  users, items, locations, categories, itemLocations, transactions,
  type User, type InsertUser, type Item, type InsertItem, 
  type Location, type InsertLocation, type Category, type InsertCategory,
  type ItemLocation, type InsertItemLocation, type Transaction, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Locations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location | undefined>;
  
  // Items
  getAllItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  
  // Item Locations
  getAllItemLocations(): Promise<ItemLocation[]>;
  getItemLocations(itemId: string): Promise<ItemLocation[]>;
  createItemLocation(itemLocation: InsertItemLocation): Promise<ItemLocation>;
  updateItemLocation(id: string, updates: Partial<InsertItemLocation>): Promise<ItemLocation | undefined>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.category), asc(categories.subcategory));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Locations
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(asc(locations.building), asc(locations.room), asc(locations.unit));
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    return result[0];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations).set(updates).where(eq(locations.id, id)).returning();
    return result[0];
  }

  // Items
  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(asc(items.name));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return result[0];
  }

  async createItem(item: InsertItem): Promise<Item> {
    const result = await db.insert(items).values(item).returning();
    return result[0];
  }

  async updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const result = await db.update(items).set(updates).where(eq(items.id, id)).returning();
    return result[0];
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }

  // Item Locations
  async getAllItemLocations(): Promise<ItemLocation[]> {
    return await db.select().from(itemLocations);
  }

  async getItemLocations(itemId: string): Promise<ItemLocation[]> {
    return await db.select().from(itemLocations).where(eq(itemLocations.item_id, itemId));
  }

  async createItemLocation(itemLocation: InsertItemLocation): Promise<ItemLocation> {
    const result = await db.insert(itemLocations).values(itemLocation).returning();
    return result[0];
  }

  async updateItemLocation(id: string, updates: Partial<InsertItemLocation>): Promise<ItemLocation | undefined> {
    const result = await db.update(itemLocations).set(updates).where(eq(itemLocations.id, id)).returning();
    return result[0];
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.performed_at));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
