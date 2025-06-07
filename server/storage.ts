import { 
  users, items, locations, categories, itemLocations, transactions,
  suppliers, supplierItems, stockReservations, alerts, userActivity,
  savedSearches, categoryHierarchy, itemHistory, purchaseOrders, purchaseOrderItems,
  type User, type InsertUser, type Item, type InsertItem, 
  type Location, type InsertLocation, type Category, type InsertCategory,
  type ItemLocation, type InsertItemLocation, type Transaction, type InsertTransaction,
  type Supplier, type InsertSupplier, type SupplierItem, type InsertSupplierItem,
  type StockReservation, type InsertStockReservation, type Alert, type InsertAlert,
  type UserActivity, type InsertUserActivity, type SavedSearch, type InsertSavedSearch,
  type CategoryHierarchy, type InsertCategoryHierarchy, type ItemHistory,
  type PurchaseOrder, type InsertPurchaseOrder, type PurchaseOrderItem, type InsertPurchaseOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, ilike } from "drizzle-orm";

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
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Category Hierarchy
  getAllCategoryHierarchy(): Promise<CategoryHierarchy[]>;
  createCategoryHierarchy(category: InsertCategoryHierarchy): Promise<CategoryHierarchy>;
  updateCategoryHierarchy(id: string, updates: Partial<InsertCategoryHierarchy>): Promise<CategoryHierarchy | undefined>;
  deleteCategoryHierarchy(id: string): Promise<boolean>;
  
  // Locations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;
  
  // Items
  getAllItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  bulkCreateItems(items: InsertItem[]): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  
  // Item Locations
  getAllItemLocations(): Promise<ItemLocation[]>;
  getItemLocations(itemId: string): Promise<ItemLocation[]>;
  createItemLocation(itemLocation: InsertItemLocation): Promise<ItemLocation>;
  updateItemLocation(id: string, updates: Partial<InsertItemLocation>): Promise<ItemLocation | undefined>;
  deleteItemLocation(id: string): Promise<boolean>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByItem(itemId: string): Promise<Transaction[]>;
  
  // Suppliers
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Supplier Items
  getAllSupplierItems(): Promise<SupplierItem[]>;
  getSupplierItemsBySupplier(supplierId: string): Promise<SupplierItem[]>;
  getSupplierItemsByItem(itemId: string): Promise<SupplierItem[]>;
  createSupplierItem(supplierItem: InsertSupplierItem): Promise<SupplierItem>;
  updateSupplierItem(id: string, updates: Partial<InsertSupplierItem>): Promise<SupplierItem | undefined>;
  deleteSupplierItem(id: string): Promise<boolean>;
  
  // Stock Reservations
  getAllStockReservations(): Promise<StockReservation[]>;
  getActiveReservations(): Promise<StockReservation[]>;
  createStockReservation(reservation: InsertStockReservation): Promise<StockReservation>;
  updateStockReservation(id: string, updates: Partial<InsertStockReservation>): Promise<StockReservation | undefined>;
  deleteStockReservation(id: string): Promise<boolean>;
  
  // Alerts
  getAllAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<InsertAlert>): Promise<Alert | undefined>;
  acknowledgeAlert(id: string, userId: string): Promise<Alert | undefined>;
  resolveAlert(id: string): Promise<Alert | undefined>;
  
  // User Activity
  getAllUserActivity(): Promise<UserActivity[]>;
  getUserActivity(userId: string): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Saved Searches
  getSavedSearches(userId: string): Promise<SavedSearch[]>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: string): Promise<boolean>;
  
  // Item History
  getItemHistory(itemId: string): Promise<ItemHistory[]>;
  createItemHistory(history: Partial<ItemHistory>): Promise<ItemHistory>;
  
  // Purchase Orders
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  
  // Purchase Order Items
  getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: string, updates: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
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

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Category Hierarchy
  async getAllCategoryHierarchy(): Promise<CategoryHierarchy[]> {
    return await db.select().from(categoryHierarchy);
  }

  async createCategoryHierarchy(category: InsertCategoryHierarchy): Promise<CategoryHierarchy> {
    const result = await db.insert(categoryHierarchy).values(category).returning();
    return result[0];
  }

  async updateCategoryHierarchy(id: string, updates: Partial<InsertCategoryHierarchy>): Promise<CategoryHierarchy | undefined> {
    const result = await db.update(categoryHierarchy).set(updates).where(eq(categoryHierarchy.id, id)).returning();
    return result[0];
  }

  async deleteCategoryHierarchy(id: string): Promise<boolean> {
    const result = await db.delete(categoryHierarchy).where(eq(categoryHierarchy.id, id)).returning();
    return result.length > 0;
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

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id)).returning();
    return result.length > 0;
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

  async bulkCreateItems(itemsList: InsertItem[]): Promise<Item[]> {
    const result = await db.insert(items).values(itemsList).returning();
    return result;
  }

  async searchItems(query: string): Promise<Item[]> {
    return await db.select().from(items).where(
      or(
        ilike(items.name, `%${query}%`),
        ilike(items.description, `%${query}%`),
        ilike(items.sku, `%${query}%`)
      )
    );
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

  async deleteItemLocation(id: string): Promise<boolean> {
    const result = await db.delete(itemLocations).where(eq(itemLocations.id, id)).returning();
    return result.length > 0;
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.performed_at));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async getTransactionsByItem(itemId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.item_id, itemId)).orderBy(desc(transactions.performed_at));
  }

  // Suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(asc(suppliers.name));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(suppliers).values(supplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(suppliers).set(updates).where(eq(suppliers.id, id)).returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  // Supplier Items
  async getAllSupplierItems(): Promise<SupplierItem[]> {
    return await db.select().from(supplierItems);
  }

  async getSupplierItemsBySupplier(supplierId: string): Promise<SupplierItem[]> {
    return await db.select().from(supplierItems).where(eq(supplierItems.supplier_id, supplierId));
  }

  async getSupplierItemsByItem(itemId: string): Promise<SupplierItem[]> {
    return await db.select().from(supplierItems).where(eq(supplierItems.item_id, itemId));
  }

  async createSupplierItem(supplierItem: InsertSupplierItem): Promise<SupplierItem> {
    const result = await db.insert(supplierItems).values(supplierItem).returning();
    return result[0];
  }

  async updateSupplierItem(id: string, updates: Partial<InsertSupplierItem>): Promise<SupplierItem | undefined> {
    const result = await db.update(supplierItems).set(updates).where(eq(supplierItems.id, id)).returning();
    return result[0];
  }

  async deleteSupplierItem(id: string): Promise<boolean> {
    const result = await db.delete(supplierItems).where(eq(supplierItems.id, id)).returning();
    return result.length > 0;
  }

  // Stock Reservations
  async getAllStockReservations(): Promise<StockReservation[]> {
    return await db.select().from(stockReservations);
  }

  async getActiveReservations(): Promise<StockReservation[]> {
    return await db.select().from(stockReservations).where(eq(stockReservations.status, 'active'));
  }

  async createStockReservation(reservation: InsertStockReservation): Promise<StockReservation> {
    const result = await db.insert(stockReservations).values(reservation).returning();
    return result[0];
  }

  async updateStockReservation(id: string, updates: Partial<InsertStockReservation>): Promise<StockReservation | undefined> {
    const result = await db.update(stockReservations).set(updates).where(eq(stockReservations.id, id)).returning();
    return result[0];
  }

  async deleteStockReservation(id: string): Promise<boolean> {
    const result = await db.delete(stockReservations).where(eq(stockReservations.id, id)).returning();
    return result.length > 0;
  }

  // Alerts
  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.created_at));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.status, 'active')).orderBy(desc(alerts.created_at));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(alert).returning();
    return result[0];
  }

  async updateAlert(id: string, updates: Partial<InsertAlert>): Promise<Alert | undefined> {
    const result = await db.update(alerts).set(updates).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  async acknowledgeAlert(id: string, userId: string): Promise<Alert | undefined> {
    const result = await db.update(alerts).set({ 
      status: 'acknowledged', 
      acknowledged_by: userId, 
      acknowledged_at: new Date() 
    }).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  async resolveAlert(id: string): Promise<Alert | undefined> {
    const result = await db.update(alerts).set({ 
      status: 'resolved', 
      resolved_at: new Date() 
    }).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  // User Activity
  async getAllUserActivity(): Promise<UserActivity[]> {
    return await db.select().from(userActivity).orderBy(desc(userActivity.timestamp));
  }

  async getUserActivity(userId: string): Promise<UserActivity[]> {
    return await db.select().from(userActivity).where(eq(userActivity.user_id, userId)).orderBy(desc(userActivity.timestamp));
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const result = await db.insert(userActivity).values(activity).returning();
    return result[0];
  }

  // Saved Searches
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches).where(eq(savedSearches.user_id, userId));
  }

  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const result = await db.insert(savedSearches).values(search).returning();
    return result[0];
  }

  async deleteSavedSearch(id: string): Promise<boolean> {
    const result = await db.delete(savedSearches).where(eq(savedSearches.id, id)).returning();
    return result.length > 0;
  }

  // Item History
  async getItemHistory(itemId: string): Promise<ItemHistory[]> {
    return await db.select().from(itemHistory).where(eq(itemHistory.item_id, itemId)).orderBy(desc(itemHistory.changed_at));
  }

  async createItemHistory(history: Partial<ItemHistory>): Promise<ItemHistory> {
    const result = await db.insert(itemHistory).values(history as any).returning();
    return result[0];
  }

  // Purchase Orders
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.created_at));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
    return result[0];
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const result = await db.insert(purchaseOrders).values(order).returning();
    return result[0];
  }

  async updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const result = await db.update(purchaseOrders).set(updates).where(eq(purchaseOrders.id, id)).returning();
    return result[0];
  }

  // Purchase Order Items
  async getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchase_order_id, orderId));
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const result = await db.insert(purchaseOrderItems).values(item).returning();
    return result[0];
  }

  async updatePurchaseOrderItem(id: string, updates: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const result = await db.update(purchaseOrderItems).set(updates).where(eq(purchaseOrderItems.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
