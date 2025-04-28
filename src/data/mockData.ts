import { User, UserRole, Item, ItemStatus, ItemLocation, Attachment, InventoryTransaction, TransactionType } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    username: 'vegain',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date('2023-01-01'),
    lastLogin: new Date('2023-05-10')
  },
  {
    id: '2',
    username: 'inventory1',
    name: 'Inventory Manager',
    email: 'inventory@example.com',
    role: UserRole.INVENTORY_MANAGER,
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date('2023-05-09')
  },
  {
    id: '3',
    username: 'warehouse1',
    name: 'Warehouse Staff',
    email: 'warehouse@example.com',
    role: UserRole.WAREHOUSE_STAFF,
    createdAt: new Date('2023-02-01'),
    lastLogin: new Date('2023-05-10')
  },
  {
    id: '4',
    username: 'department1',
    name: 'Department User',
    email: 'department@example.com',
    role: UserRole.DEPARTMENT_USER,
    department: 'Engineering',
    createdAt: new Date('2023-02-15'),
    lastLogin: new Date('2023-05-08')
  }
];

// Mock Locations
export const locations: ItemLocation[] = [
  {
    id: '1',
    building: 'Main Warehouse',
    room: 'Storage Room A',
    unit: 'Shelf A1'
  },
  {
    id: '2',
    building: 'Main Warehouse',
    room: 'Storage Room A',
    unit: 'Shelf A2'
  },
  {
    id: '3',
    building: 'Main Warehouse',
    room: 'Storage Room B',
    unit: 'Bin B1'
  },
  {
    id: '4',
    building: 'Engineering Department',
    room: 'Lab 1',
    unit: 'Cabinet C1'
  }
];

// Mock Items
export const items: Item[] = [
  {
    id: '1',
    sku: 'IC-001',
    name: 'ATmega328P Microcontroller',
    description: '8-bit AVR microcontroller with 32KB flash memory',
    category: 'Integrated Circuits',
    subcategory: 'Microcontrollers',
    manufacturer: 'Microchip',
    model: 'ATmega328P-PU',
    serialNumber: '2340987ABC',
    quantity: 150,
    minimumStock: 50,
    unitCost: 2.95,
    location: locations[0],
    purchaseDate: new Date('2023-03-15'),
    warrantyExpiration: new Date('2024-03-15'),
    status: ItemStatus.IN_STOCK,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
    createdBy: '2'
  },
  {
    id: '2',
    sku: 'RES-001',
    name: '10K Ohm Resistor',
    description: '1/4W 5% tolerance through-hole resistor',
    category: 'Passive Components',
    subcategory: 'Resistors',
    manufacturer: 'Yageo',
    quantity: 2500,
    minimumStock: 500,
    unitCost: 0.02,
    location: locations[1],
    purchaseDate: new Date('2023-02-10'),
    status: ItemStatus.IN_STOCK,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-05'),
    createdBy: '2'
  },
  {
    id: '3',
    sku: 'CAP-001',
    name: '10uF Electrolytic Capacitor',
    description: '10uF 25V radial electrolytic capacitor',
    category: 'Passive Components',
    subcategory: 'Capacitors',
    manufacturer: 'Nichicon',
    quantity: 1200,
    minimumStock: 300,
    unitCost: 0.15,
    location: locations[1],
    purchaseDate: new Date('2023-01-20'),
    status: ItemStatus.IN_STOCK,
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    createdBy: '2'
  },
  {
    id: '4',
    sku: 'LED-001',
    name: '5mm Red LED',
    description: '5mm red LED, 20mA forward current',
    category: 'Optoelectronics',
    subcategory: 'LEDs',
    manufacturer: 'Lite-On',
    quantity: 3000,
    minimumStock: 500,
    unitCost: 0.05,
    location: locations[2],
    purchaseDate: new Date('2023-02-05'),
    status: ItemStatus.IN_STOCK,
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05'),
    createdBy: '2'
  },
  {
    id: '5',
    sku: 'TRAN-001',
    name: '2N2222 Transistor',
    description: 'NPN general purpose transistor',
    category: 'Semiconductors',
    subcategory: 'Transistors',
    manufacturer: 'ON Semiconductor',
    model: '2N2222A',
    quantity: 800,
    minimumStock: 200,
    unitCost: 0.18,
    location: locations[2],
    purchaseDate: new Date('2023-03-01'),
    status: ItemStatus.IN_STOCK,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01'),
    createdBy: '2'
  },
  {
    id: '6',
    sku: 'IC-002',
    name: 'LM324 Op-Amp',
    description: 'Quad operational amplifier IC',
    category: 'Integrated Circuits',
    subcategory: 'Operational Amplifiers',
    manufacturer: 'Texas Instruments',
    model: 'LM324N',
    quantity: 25,
    minimumStock: 50,
    unitCost: 0.45,
    location: locations[3],
    purchaseDate: new Date('2023-01-15'),
    status: ItemStatus.LOW_STOCK,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-04-10'),
    createdBy: '2'
  }
];

// Mock Transactions
export const transactions: InventoryTransaction[] = [
  {
    id: '1',
    type: TransactionType.RECEIVE,
    itemId: '1',
    quantity: 200,
    toLocation: '1',
    performedBy: '3',
    performedAt: new Date('2023-03-15'),
    notes: 'Initial stock receipt'
  },
  {
    id: '2',
    type: TransactionType.TRANSFER,
    itemId: '1',
    quantity: 50,
    fromLocation: '1',
    toLocation: '4',
    performedBy: '3',
    performedAt: new Date('2023-04-10'),
    notes: 'Transferred to Engineering for project X'
  },
  {
    id: '3',
    type: TransactionType.RECEIVE,
    itemId: '2',
    quantity: 3000,
    toLocation: '2',
    performedBy: '3',
    performedAt: new Date('2023-02-10'),
    notes: 'Bulk order received'
  },
  {
    id: '4',
    type: TransactionType.ADJUST,
    itemId: '2',
    quantity: -500,
    fromLocation: '2',
    performedBy: '2',
    performedAt: new Date('2023-04-05'),
    notes: 'Inventory count adjustment'
  },
  {
    id: '5',
    type: TransactionType.TRANSFER,
    itemId: '6',
    quantity: 25,
    fromLocation: '3',
    toLocation: '4',
    performedBy: '3',
    performedAt: new Date('2023-04-10'),
    notes: 'Transferred to Engineering Lab'
  }
];

// Categories and Subcategories
export const categories = [
  { 
    name: 'Integrated Circuits',
    subcategories: ['Microcontrollers', 'Logic Gates', 'Operational Amplifiers', 'Voltage Regulators', 'Memory ICs']
  },
  { 
    name: 'Passive Components',
    subcategories: ['Resistors', 'Capacitors', 'Inductors', 'Transformers', 'Crystals & Oscillators']
  },
  {
    name: 'Semiconductors',
    subcategories: ['Diodes', 'Transistors', 'Thyristors', 'MOSFETs']
  },
  {
    name: 'Optoelectronics',
    subcategories: ['LEDs', 'Displays', 'Optocouplers', 'Photodetectors']
  },
  {
    name: 'Connectors',
    subcategories: ['Headers', 'Terminal Blocks', 'D-Sub', 'USB', 'Audio/Video']
  },
  {
    name: 'Mechanical Components',
    subcategories: ['Enclosures', 'Heatsinks', 'Switches', 'Relays']
  }
];

// Dashboard stats
export const dashboardStats = {
  totalItems: 7650,
  totalCategories: 6,
  lowStockItems: 2,
  totalValue: 15420.75,
  recentTransactions: 12,
  pendingOrders: 3
};

// Get categories as flat list
export const getCategoriesList = () => {
  return categories.map(cat => cat.name);
};

// Get subcategories for a category
export const getSubcategoriesForCategory = (category: string) => {
  const found = categories.find(cat => cat.name === category);
  return found ? found.subcategories : [];
};