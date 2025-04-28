// User related types
export enum UserRole {
  ADMIN = 'admin',
  INVENTORY_MANAGER = 'inventory_manager',
  WAREHOUSE_STAFF = 'warehouse_staff',
  DEPARTMENT_USER = 'department_user'
}

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Item related types
export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  quantity: number;
  minimumStock?: number;
  unitCost: number;
  location: ItemLocation;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  status: ItemStatus;
  customFields?: Record<string, string>;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum ItemStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ORDERED = 'ordered',
  DISCONTINUED = 'discontinued'
}

export interface ItemLocation {
  id: string;
  building?: string;
  room?: string;
  unit: string; // shelf, bin, cabinet
  position?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // manual, receipt, image
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Inventory operation types
export interface InventoryTransaction {
  id: string;
  type: TransactionType;
  itemId: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

export enum TransactionType {
  RECEIVE = 'receive',
  TRANSFER = 'transfer',
  DISPOSE = 'dispose',
  ADJUST = 'adjust'
}

// Report types
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters: Record<string, any>;
  generatedBy: string;
  generatedAt: Date;
  data?: any;
}

export enum ReportType {
  INVENTORY_LEVEL = 'inventory_level',
  VALUATION = 'valuation',
  MOVEMENT = 'movement',
  ACTIVITY = 'activity'
}