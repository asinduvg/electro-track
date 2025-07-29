// API client to replace Supabase functionality
const API_BASE_URL = '';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: number, updates: any) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations
  async getLocations() {
    return this.request('/locations');
  }

  async getLocation(id: string) {
    return this.request(`/locations/${id}`);
  }

  async createLocation(locationData: any) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updateLocation(id: string, updates: any) {
    return this.request(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Items
  async getItems() {
    return this.request('/items');
  }

  async getItem(id: string) {
    return this.request(`/items/${id}`);
  }

  async createItem(itemData: any) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id: string, updates: any) {
    return this.request(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Item Locations
  async getItemLocations() {
    return this.request('/item-locations');
  }

  async getItemLocationsByItem(itemId: string) {
    return this.request(`/items/${itemId}/locations`);
  }

  async createItemLocation(itemLocationData: any) {
    return this.request('/item-locations', {
      method: 'POST',
      body: JSON.stringify(itemLocationData),
    });
  }

  async updateItemLocation(id: string, updates: any) {
    return this.request(`/item-locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Transactions
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transactionData: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Suppliers
  async getAllSuppliers() {
    return this.request('/suppliers');
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(supplierData: any) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id: string, updates: any) {
    return this.request(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
