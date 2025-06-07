import { pgTable, text, uuid, integer, boolean, numeric, timestamp, pgEnum, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'inventory_manager', 'warehouse_staff', 'department_user']);
export const itemStatusEnum = pgEnum('item_status', ['in_stock', 'low_stock', 'out_of_stock', 'discontinued']);
export const transactionTypeEnum = pgEnum('transaction_type', ['receive', 'transfer', 'dispose', 'withdraw', 'adjust']);
export const itemLocationStatusEnum = pgEnum('item_location_status', ['in_stock', 'ordered']);

// Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  name: text("name").notNull(),
  department: text("department"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: uuid("created_by"),
  updated_by: uuid("updated_by"),
  last_login: timestamp("last_login"),
});

export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  building: text("building"),
  room: text("room"),
  unit: text("unit").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: uuid("created_by").references(() => users.id),
  updated_by: uuid("updated_by").references(() => users.id),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  manufacturer: text("manufacturer").notNull(),
  model: text("model"),
  serial_number: text("serial_number"),
  minimum_stock: integer("minimum_stock"),
  unit_cost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  status: itemStatusEnum("status").notNull().default('out_of_stock'),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: uuid("created_by").references(() => users.id),
  updated_by: uuid("updated_by").references(() => users.id),
  category_id: bigint("category_id", { mode: "number" }).references(() => categories.id),
  image_url: text("image_url"),
});

export const itemLocations = pgTable("item_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  item_id: uuid("item_id").notNull().references(() => items.id, { onDelete: 'cascade' }),
  location_id: uuid("location_id").notNull().references(() => locations.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull().default(0),
  purchased_date: timestamp("purchased_date"),
  warranty_expiration: timestamp("warranty_expiration"),
  is_paid: boolean("is_paid").default(true),
  status: itemLocationStatusEnum("status").default('in_stock'),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: uuid("created_by").references(() => users.id),
  updated_by: uuid("updated_by").references(() => users.id),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  item_id: uuid("item_id").notNull().references(() => items.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull(),
  from_location_id: uuid("from_location_id").references(() => locations.id),
  to_location_id: uuid("to_location_id").references(() => locations.id),
  performed_by: uuid("performed_by").notNull().references(() => users.id),
  performed_at: timestamp("performed_at").defaultNow(),
  notes: text("notes"),
  project_id: text("project_id"),
  purpose: text("purpose"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  role: true,
  department: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  category: true,
  subcategory: true,
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  building: true,
  room: true,
  unit: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  sku: true,
  name: true,
  description: true,
  manufacturer: true,
  model: true,
  serial_number: true,
  minimum_stock: true,
  unit_cost: true,
  category_id: true,
  image_url: true,
});

export const insertItemLocationSchema = createInsertSchema(itemLocations).pick({
  item_id: true,
  location_id: true,
  quantity: true,
  purchased_date: true,
  warranty_expiration: true,
  is_paid: true,
  status: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  item_id: true,
  quantity: true,
  from_location_id: true,
  to_location_id: true,
  performed_by: true,
  notes: true,
  project_id: true,
  purpose: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItemLocation = z.infer<typeof insertItemLocationSchema>;
export type ItemLocation = typeof itemLocations.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
