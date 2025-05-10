import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {useAuth} from './AuthContext';
import {
    createItem,
    updateItem,
    deleteItem,
    createTransaction,
} from '../lib/api';
import type {Database} from '../lib/database.types';
import {supabase} from "../lib/supabase.ts";

// Type Definitions
// type Item = Database['public']['Tables']['items']['Row'] & {
//     locations?: Array<{
//         location: Database['public']['Tables']['locations']['Row'];
//         quantity: number;
//         status: 'in_stock' | 'ordered';
//     }>;
// };

type Item = Database['public']['Tables']['items']['Row']
type Location = Database['public']['Tables']['locations']['Row'];
type Stocks = Database['public']['Tables']['item_locations']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

type ItemInsert = Database['public']['Tables']['items']['Insert'];

interface TransactionPayload {
    type: 'receive' | 'transfer' | 'dispose' | 'withdraw' | 'adjust';
    item_id: string;
    quantity: number;
    from_location_id?: string | null;
    to_location_id?: string | null;
    performed_by: string;
    project_id?: string;
    purpose?: string;
    notes?: string;
}

interface ItemsContextType {
    items: Item[];
    locations: Location[];
    isLoading: boolean;
    error: string | null;
    refreshItems: () => Promise<void>;
    getItem: (id: string) => Promise<Item | null>;
    addItem: (item: ItemInsert) => Promise<Item | null>;
    updateItem: (id: string, updates: Partial<Item>) => Promise<Item | null>;
    removeItem: (id: string) => Promise<boolean>;
    performTransaction: (transaction: TransactionPayload) => Promise<boolean>;
    isRefreshing: boolean;
    stocks: Stocks[];
    transactions: Transaction[];
}

// Create the context
const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Create the provider component
export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {currentUser, isAuthenticated} = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stocks, setStocks] = useState<Stocks[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to refresh items and locations
    const refreshItemsWithStocksAndLocations = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            const [itemsData, locationsData, stocksData, transactionData] = await Promise.all([
                getItems(),
                getLocations(),
                getStocks(),
                getTransactions()
            ]);

            setItems(itemsData);
            setLocations(locationsData);
            setStocks(stocksData);
            setTransactions(transactionData);
        } catch (err) {
            console.error('Error loading items, stocks and locations:', err);
            setError('Failed to load inventory data');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Load items and locations when the component mounts and user is authenticated
    useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                await refreshItemsWithStocksAndLocations();
            }
        })()
    }, [isAuthenticated, refreshItemsWithStocksAndLocations]);

    // DB calls start

    const getItems = async () => {
        const {data: items, error: itemsError} = await supabase
            .from('items')
            .select('*');

        if (itemsError) throw itemsError;
        return items as Item[];
    }

    const getLocations = async () => {
        const {data, error} = await supabase
            .from('locations')
            .select('*');

        if (error) throw error;
        return data as Location[];
    }

    const getStocks = async () => {
        const {data, error} = await supabase
            .from('item_locations')
            .select('*');

        if (error) throw error;
        return data as Stocks[];
    }

    const getItemById = async (id: string) => {
        const {data: item, error: itemError} = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

        if (itemError) throw itemError;

        return item as Item;
    }

    const getTransactions = async () => {
        const {data, error} = await supabase
            .from('transactions')
            .select('*');

        if (error) throw error;
        return data as Transaction[];
    }

    // DB calls end

    // Function to get a single item by ID
    const getItem = async (id: string): Promise<Item | null> => {
        try {
            setError(null);

            // First try to find the item in the existing items array
            const existingItem = items.find(item => item.id === id);
            if (existingItem) return existingItem;

            // If not found, fetch it from the API
            const item = await getItemById(id);
            setItems(prevItems => [...prevItems, item]);
            return item;
        } catch (err) {
            console.error('Error getting item:', err);
            // Check if it's a permission error
            if (err instanceof Error) {
                // PostgreSQL permission errors typically contain messages with "permission denied"
                // or have specific codes in the Supabase error object structure
                if (
                    err.message?.toLowerCase().includes('permission denied') ||
                    (err as any)?.code === '42501' || // PostgreSQL permission denied code
                    (err as any)?.details?.includes('policy')
                ) {
                    setError('You do not have permission to access this item');
                } else {
                    setError('Failed to get item details');
                }
            } else {
                setError('Failed to get item details');
            }

            return null;
        }
    };

    // Function to add a new item
    const addItem = async (item: ItemInsert): Promise<Item | null> => {
        if (!isAuthenticated || !currentUser) {
            setError('You must be logged in to add items');
            return null;
        }

        try {
            setError(null);
            const newItem = await createItem(item);

            // Refresh the items list to include the new item
            await refreshItemsWithStocksAndLocations();

            return newItem;
        } catch (err) {
            console.error('Error adding item:', err);
            setError('Failed to add item');
            return null;
        }
    };

    // Function to update an existing item
    const updateItemData = async (id: string, updates: Partial<Item>): Promise<Item | null> => {
        if (!isAuthenticated || !currentUser) {
            setError('You must be logged in to update items');
            return null;
        }

        try {
            setError(null);
            const updatedItem = await updateItem(id, updates);

            // Update the items array with the updated item
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === id ? {...item, ...updatedItem} : item
                )
            );

            return updatedItem;
        } catch (err) {
            console.error('Error updating item:', err);
            setError('Failed to update item');
            return null;
        }
    };

    // Function to remove an item
    const removeItem = async (id: string): Promise<boolean> => {
        if (!isAuthenticated || !currentUser) {
            setError('You must be logged in to delete items');
            return false;
        }

        try {
            setError(null);
            await deleteItem(id);

            // Remove the item from the items array
            setItems(prevItems => prevItems.filter(item => item.id !== id));

            return true;
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Failed to delete item');
            return false;
        }
    };

    // Function to perform a transaction (receive, transfer, dispose, etc.)
    const performTransaction = async (transaction: TransactionPayload): Promise<boolean> => {
        if (!isAuthenticated || !currentUser) {
            setError('You must be logged in to perform transactions');
            return false;
        }

        try {
            setError(null);
            await createTransaction(transaction);

            // Refresh the items to reflect the updated quantities
            await refreshItemsWithStocksAndLocations();

            return true;
        } catch (err) {
            console.error('Error performing transaction:', err);
            setError('Failed to process transaction');
            return false;
        }
    };

    // Memoize the refreshItems function to prevent unnecessary re-renders
    const refreshItems = useCallback(async () => {
        return refreshItemsWithStocksAndLocations();
    }, []);

    // Context value
    const value: ItemsContextType = {
        items,
        locations,
        isLoading,
        error,
        refreshItems,
        getItem,
        addItem,
        updateItem: updateItemData,
        removeItem,
        performTransaction,
        isRefreshing,
        stocks,
        transactions
    };

    return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

// Custom hook to use the context
export const useItems = () => {
    const context = useContext(ItemsContext);
    if (context === undefined) {
        throw new Error('useItems must be used within an ItemsProvider');
    }
    return context;
};