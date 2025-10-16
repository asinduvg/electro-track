import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  numeric,
  timestamp,
  pgEnum,
  bigint,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'inventory_manager',
  'warehouse_staff',
  'department_user',
]);
export const itemStatusEnum = pgEnum('item_status', [
  'in_stock',
  'low_stock',
  'out_of_stock',
  'discontinued',
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'receive',
  'transfer',
  'dispose',
  'withdraw',
  'adjust',
  'reserve',
  'unreserve',
]);
export const itemLocationStatusEnum = pgEnum('item_location_status', [
  'in_stock',
  'ordered',
  'reserved',
]);
export const alertTypeEnum = pgEnum('alert_type', [
  'low_stock',
  'expiring',
  'out_of_stock',
  'overstock',
]);
export const alertStatusEnum = pgEnum('alert_status', ['active', 'acknowledged', 'resolved']);
export const activityTypeEnum = pgEnum('activity_type', [
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'view',
  'export',
  'import',
]);
export const supplierStatusEnum = pgEnum('supplier_status', ['active', 'inactive', 'pending']);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
  name: text('name').notNull(),
  department: text('department'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: uuid('created_by'),
  updated_by: uuid('updated_by'),
  last_login: timestamp('last_login'),
});

export const categories = pgTable('categories', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  category: text('category').notNull(),
  subcategory: text('subcategory').notNull(),
});

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  building: text('building'),
  room: text('room'),
  unit: text('unit').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: uuid('created_by').references(() => users.id),
  updated_by: uuid('updated_by').references(() => users.id),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  manufacturer: text('manufacturer').notNull(),
  model: text('model'),
  serial_number: text('serial_number'),
  minimum_stock: integer('minimum_stock'),
  maximum_stock: integer('maximum_stock'),
  unit_cost: numeric('unit_cost', { precision: 10, scale: 2 }).notNull(),
  status: itemStatusEnum('status').notNull().default('out_of_stock'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: uuid('created_by').references(() => users.id),
  updated_by: uuid('updated_by').references(() => users.id),
  category_id: bigint('category_id', { mode: 'number' }).references(() => categories.id),
  image_url: text('image_url'),
});

export const itemLocations = pgTable('item_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  location_id: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  purchased_date: timestamp('purchased_date'),
  warranty_expiration: timestamp('warranty_expiration'),
  is_paid: boolean('is_paid').default(true),
  status: itemLocationStatusEnum('status').default('in_stock'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: uuid('created_by').references(() => users.id),
  updated_by: uuid('updated_by').references(() => users.id),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: transactionTypeEnum('type').notNull(),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  from_location_id: uuid('from_location_id').references(() => locations.id),
  to_location_id: uuid('to_location_id').references(() => locations.id),
  performed_by: uuid('performed_by')
    .notNull()
    .references(() => users.id),
  performed_at: timestamp('performed_at').defaultNow(),
  notes: text('notes'),
  project_id: text('project_id'),
  purpose: text('purpose'),
});

// New tables for enhanced functionality

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contact_name: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  status: supplierStatusEnum('status').notNull().default('active'),
  rating: integer('rating'), // 1-5 rating
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const supplierItems = pgTable('supplier_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplier_id: uuid('supplier_id')
    .notNull()
    .references(() => suppliers.id, { onDelete: 'cascade' }),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  supplier_sku: text('supplier_sku'),
  unit_cost: numeric('unit_cost', { precision: 10, scale: 2 }),
  minimum_order_quantity: integer('minimum_order_quantity'),
  lead_time_days: integer('lead_time_days'),
  is_preferred: boolean('is_preferred').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

export const stockReservations = pgTable('stock_reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  location_id: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  quantity: integer('quantity').notNull(),
  reserved_by: uuid('reserved_by')
    .notNull()
    .references(() => users.id),
  reason: text('reason'),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: alertTypeEnum('type').notNull(),
  status: alertStatusEnum('status').notNull().default('active'),
  item_id: uuid('item_id').references(() => items.id),
  location_id: uuid('location_id').references(() => locations.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  threshold_value: integer('threshold_value'),
  current_value: integer('current_value'),
  created_at: timestamp('created_at').defaultNow(),
  acknowledged_at: timestamp('acknowledged_at'),
  acknowledged_by: uuid('acknowledged_by').references(() => users.id),
  resolved_at: timestamp('resolved_at'),
});

export const userActivity = pgTable('user_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
  activity_type: activityTypeEnum('activity_type').notNull(),
  resource_type: text('resource_type'), // item, location, user, etc.
  resource_id: text('resource_id'),
  description: text('description').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
});

export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  search_criteria: text('search_criteria').notNull(), // JSON string
  created_at: timestamp('created_at').defaultNow(),
});

export const categoryHierarchy = pgTable('category_hierarchy', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  parent_id: uuid('parent_id'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const itemHistory = pgTable('item_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  field_name: text('field_name').notNull(),
  old_value: text('old_value'),
  new_value: text('new_value'),
  changed_by: uuid('changed_by')
    .notNull()
    .references(() => users.id),
  changed_at: timestamp('changed_at').defaultNow(),
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: text('order_number').notNull().unique(),
  supplier_id: uuid('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  status: text('status').notNull().default('draft'), // draft, sent, received, cancelled
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }),
  order_date: timestamp('order_date').defaultNow(),
  expected_delivery: timestamp('expected_delivery'),
  actual_delivery: timestamp('actual_delivery'),
  notes: text('notes'),
  created_by: uuid('created_by')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchase_order_id: uuid('purchase_order_id')
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  item_id: uuid('item_id')
    .notNull()
    .references(() => items.id),
  quantity: integer('quantity').notNull(),
  unit_cost: numeric('unit_cost', { precision: 10, scale: 2 }).notNull(),
  received_quantity: integer('received_quantity').default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    name: true,
    role: true,
    department: true,
    password: true,
  })
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contact_name: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  status: true,
  rating: true,
  notes: true,
});

export const insertSupplierItemSchema = createInsertSchema(supplierItems).pick({
  supplier_id: true,
  item_id: true,
  supplier_sku: true,
  unit_cost: true,
  minimum_order_quantity: true,
  lead_time_days: true,
  is_preferred: true,
});

export const insertStockReservationSchema = createInsertSchema(stockReservations).pick({
  item_id: true,
  location_id: true,
  quantity: true,
  reserved_by: true,
  reason: true,
  expires_at: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  type: true,
  status: true,
  item_id: true,
  location_id: true,
  title: true,
  message: true,
  threshold_value: true,
  current_value: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).pick({
  user_id: true,
  activity_type: true,
  resource_type: true,
  resource_id: true,
  description: true,
  ip_address: true,
  user_agent: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).pick({
  user_id: true,
  name: true,
  search_criteria: true,
});

export const insertCategoryHierarchySchema = createInsertSchema(categoryHierarchy).pick({
  name: true,
  parent_id: true,
  description: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).pick({
  order_number: true,
  supplier_id: true,
  status: true,
  total_amount: true,
  expected_delivery: true,
  notes: true,
  created_by: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).pick({
  purchase_order_id: true,
  item_id: true,
  quantity: true,
  unit_cost: true,
  received_quantity: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;
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
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplierItem = z.infer<typeof insertSupplierItemSchema>;
export type SupplierItem = typeof supplierItems.$inferSelect;
export type InsertStockReservation = z.infer<typeof insertStockReservationSchema>;
export type StockReservation = typeof stockReservations.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertCategoryHierarchy = z.infer<typeof insertCategoryHierarchySchema>;
export type CategoryHierarchy = typeof categoryHierarchy.$inferSelect;
export type InsertItemHistory = typeof itemHistory.$inferSelect;
export type ItemHistory = typeof itemHistory.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
