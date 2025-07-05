import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertLocationSchema, insertItemSchema, insertItemLocationSchema, insertTransactionSchema, insertSupplierSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Simple authentication - in production, use proper password hashing
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // For demo purposes, accept any password - in production implement proper auth
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const updates = req.body;
      const category = await storage.updateCategory(parseInt(req.params.id), updates);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Locations routes
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Get location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Create location error:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const location = await storage.updateLocation(req.params.id, updates);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Update location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Items routes
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Get items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create item error:", error);
      res.status(400).json({ error: "Invalid item data" });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const updates = req.body;
      console.log("Updating item with data:", updates);
      
      // Remove timestamp fields that should not be updated manually
      const { created_at, updated_at, id, ...updateData } = updates;
      
      // Validate numeric fields
      if (updateData.unit_cost !== undefined) {
        updateData.unit_cost = parseFloat(updateData.unit_cost) || 0;
      }
      if (updateData.minimum_stock !== undefined) {
        updateData.minimum_stock = parseInt(updateData.minimum_stock) || 0;
      }
      if (updateData.maximum_stock !== undefined) {
        updateData.maximum_stock = parseInt(updateData.maximum_stock) || null;
      }
      if (updateData.category_id !== undefined) {
        updateData.category_id = parseInt(updateData.category_id) || null;
      }
      
      const item = await storage.updateItem(req.params.id, updateData);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const success = await storage.deleteItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Item locations routes
  app.get("/api/item-locations", async (req, res) => {
    try {
      // Add cache-busting headers to ensure fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const itemLocations = await storage.getAllItemLocations();
      res.json(itemLocations);
    } catch (error) {
      console.error("Get item locations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/items/:itemId/locations", async (req, res) => {
    try {
      const itemLocations = await storage.getItemLocations(req.params.itemId);
      res.json(itemLocations);
    } catch (error) {
      console.error("Get item locations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/item-locations", async (req, res) => {
    try {
      const itemLocationData = insertItemLocationSchema.parse(req.body);
      const itemLocation = await storage.createItemLocation(itemLocationData);
      res.status(201).json(itemLocation);
    } catch (error) {
      console.error("Create item location error:", error);
      res.status(400).json({ error: "Invalid item location data" });
    }
  });

  app.patch("/api/item-locations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const itemLocation = await storage.updateItemLocation(req.params.id, updates);
      if (!itemLocation) {
        return res.status(404).json({ error: "Item location not found" });
      }
      res.json(itemLocation);
    } catch (error) {
      console.error("Update item location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Handle stock updates based on transaction type
      if (transaction.type === 'receive' && transaction.to_location_id) {
        // For receive transactions, create or update item location
        const existingItemLocations = await storage.getItemLocations(transaction.item_id);
        const existingLocation = existingItemLocations.find(il => il.location_id === transaction.to_location_id);
        
        if (existingLocation) {
          // Update existing item location
          await storage.updateItemLocation(existingLocation.id, {
            quantity: existingLocation.quantity + transaction.quantity
          });
        } else {
          // Create new item location
          await storage.createItemLocation({
            item_id: transaction.item_id,
            location_id: transaction.to_location_id,
            quantity: transaction.quantity,
            status: 'in_stock'
          });
        }
      } else if (transaction.type === 'withdraw' && transaction.from_location_id) {
        // For withdraw transactions, update item location
        const existingItemLocations = await storage.getItemLocations(transaction.item_id);
        const existingLocation = existingItemLocations.find(il => il.location_id === transaction.from_location_id);
        
        if (existingLocation) {
          await storage.updateItemLocation(existingLocation.id, {
            quantity: Math.max(0, existingLocation.quantity - transaction.quantity)
          });
        }
      } else if (transaction.type === 'transfer' && transaction.from_location_id && transaction.to_location_id) {
        // For transfer transactions, update both locations
        const existingItemLocations = await storage.getItemLocations(transaction.item_id);
        
        // Update from location
        const fromLocation = existingItemLocations.find(il => il.location_id === transaction.from_location_id);
        if (fromLocation) {
          await storage.updateItemLocation(fromLocation.id, {
            quantity: Math.max(0, fromLocation.quantity - transaction.quantity)
          });
        }
        
        // Update to location
        const toLocation = existingItemLocations.find(il => il.location_id === transaction.to_location_id);
        if (toLocation) {
          await storage.updateItemLocation(toLocation.id, {
            quantity: toLocation.quantity + transaction.quantity
          });
        } else {
          // Create new item location if it doesn't exist
          await storage.createItemLocation({
            item_id: transaction.item_id,
            location_id: transaction.to_location_id,
            quantity: transaction.quantity,
            status: 'in_stock'
          });
        }
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Get suppliers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Get supplier error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Create supplier error:", error);
      res.status(400).json({ error: "Invalid supplier data" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const supplier = await storage.updateSupplier(req.params.id, updates);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Update supplier error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete supplier error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
