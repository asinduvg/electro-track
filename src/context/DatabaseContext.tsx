import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
// import {supabase} from "../lib/supabase.ts";
// import type {Database} from "../lib/database.types.ts";
import {useAuth} from "./AuthContext.tsx";

// type Item = Database['public']['Tables']['items']['Row'];
// type Stock = Database['public']['Tables']['item_locations']['Row'];
// type Transaction = Database['public']['Tables']['transactions']['Row'];
// type Location = Database['public']['Tables']['locations']['Row'];

// type ItemInsert = Database['public']['Tables']['items']['Insert'];
// type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
// type LocationInsert = Database['public']['Tables']['locations']['Insert'];

interface DatabaseContextType {
    // items: Item[];
    // stocks: Stock[];
    // transactions: Transaction[];
    // locations: Location[];
    // getItem: (id: string) => Promise<Item | null>;
    // addItem: (item: ItemInsert) => Promise<Item | null>;
    // updateItem: (id: string, updates: Partial<Item>) => Promise<Item | null>;
    // removeItem: (id: string) => Promise<boolean | null>;
    // createTransaction: (transaction: TransactionInsert) => Promise<Transaction | null>;
    // createLocation: (location: LocationInsert) => Promise<Location | null>;
    isLoading: boolean;
    // itemsError: string | null;
    // stocksError: string | null;
    // transactionsError: string | null;
    // locationsError: string | null;
    // refreshData: (type:'stocks' | '*') => Promise<void>;
    dbOperation: <T>(
        dbCall: () => Promise<T>,
        setter: (result: T) => void,
        errorCb: React.Dispatch<React.SetStateAction<string | null>>,
        errorMsg: string
    ) => Promise<T | null>;
}

interface PostgreSQLError extends Error {
    code?: string;
    details?: string;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// enum LoadError {
//     ITEM = 'Failed to load item',
//     ITEMS = 'Failed to load items',
//     STOCKS = 'Failed to load stocks',
//     TRANSACTIONS = 'Failed to load transactions',
//     LOCATIONS = 'Failed to load locations',
// }

// enum InsertError {
//     ITEM = 'Failed to add item',
//     TRANSACTION = 'Failed to add transaction',
//     LOCATION = 'Failed to add location',
// }
//
// enum UpdateError {
//     ITEM = 'Failed to update item',
// }
//
// enum DeleteError {
//     ITEM = 'Failed to delete item',
// }

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {isAuthenticated} = useAuth();

    // const [items, setItems] = useState<Item[]>([]);
    // const [itemsError, setItemsError] = useState<string | null>(null);

    // const [stocks, setStocks] = useState<Stock[]>([]);
    // const [stocksError, setStocksError] = useState<string | null>(null);

    // const [transactions, setTransactions] = useState<Transaction[]>([]);
    // const [transactionsError, setTransactionsError] = useState<string | null>(null);

    // const [locations, setLocations] = useState<Location[]>([]);
    // const [locationsError, setLocationsError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const checkPermissionError = (err: Error) => {
        return err.message?.toLowerCase().includes('permission denied') ||
            (err as PostgreSQLError)?.code === '42501' || // PostgreSQL permission denied code
            (err as PostgreSQLError)?.details?.includes('policy')
    }

    const dbOperation = useCallback(async function <T>(
        dbCall: () => Promise<T>,
        setter: (result: T) => void,
        errorCb: React.Dispatch<React.SetStateAction<string | null>>,
        errorMsg: string): Promise<T | null> {
        try {
            if (!isAuthenticated) return null;

            errorCb(null);
            setIsLoading(true);

            const results = await dbCall();
            setter(results);
            return results;
        } catch (err) {
            console.error(errorMsg, err);
            if (err instanceof Error && checkPermissionError(err)) return null; // don't want to show error if user doesn't have permission to access results'
            errorCb(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated])

    // load data from database
    useEffect(() => {
        (async () => {
            await Promise.all([
                // dbOperation<Item[]>(db_getItems, setItems, setItemsError, LoadError.ITEMS),
                // dbOperation<Stock[]>(db_getStocks, setStocks, setStocksError, LoadError.STOCKS),
                // dbOperation<Transaction[]>(db_getTransactions, setTransactions, setTransactionsError, LoadError.TRANSACTIONS),
                // dbOperation<Location[]>(db_getLocations, setLocations, setLocationsError, LoadError.LOCATIONS)
            ])
        })()
    }, [dbOperation]);

    // DB calls start
    // ITEMS //
    // const db_getItems = async () => {
    //     const {data: items, error: itemsError} = await supabase
    //         .from('items')
    //         .select('*');
    //
    //     if (itemsError) throw itemsError;
    //     return items as Item[];
    // }

    // const db_getItemById = async (id: string) => {
    //     const {data: item, error: itemError} = await supabase
    //         .from('items')
    //         .select('*')
    //         .eq('id', id)
    //         .single();
    //
    //     if (itemError) throw itemError;
    //
    //     return item as Item;
    // }

    // const db_createItem = async (item: ItemInsert) => {
    //     const {data, error} = await supabase
    //         .from('items')
    //         .insert(item)
    //         .select()
    //         .single();
    //
    //     if (error) throw error;
    //     return data as Item;
    // }

    // const db_updateItem = async (id: string, updates: Partial<Database['public']['Tables']['items']['Update']>) => {
    //     const {data, error} = await supabase
    //         .from('items')
    //         .update(updates)
    //         .eq('id', id)
    //         .select()
    //         .single();
    //
    //     if (error) throw error;
    //     return data;
    // }

    // const db_deleteItem = async (id: string) => {
    //     const {error} = await supabase
    //         .from('items')
    //         .delete()
    //         .eq('id', id);
    //
    //     if (error) throw error;
    //     return true;
    // }
    // ITEMS //

    // STOCKS //
    // const db_getStocks = async () => {
    //     const {data, error} = await supabase
    //         .from('item_locations')
    //         .select('*');
    //
    //     if (error) throw error;
    //     return data as Stock[];
    // }
    // STOCKS //

    // TRANSACTIONS //
    // const db_getTransactions = async () => {
    //     const {data, error: transactionsError} = await supabase
    //         .from('transactions')
    //         .select('*');
    //
    //     if (transactionsError) throw transactionsError;
    //     return data as Transaction[];
    // }

    // const db_createTransaction = async (transaction: TransactionInsert) => {
    //     // First create the transaction record with metadata
    //     const {data: transactionData, error: transactionError} = await supabase
    //         .from('transactions')
    //         .insert({
    //             ...transaction,
    //             metadata: {
    //                 browser: navigator.userAgent,
    //                 timestamp: new Date().toISOString()
    //             }
    //         })
    //         .select()
    //         .single();
    //
    //     if (transactionError) throw transactionError;
    //     return transactionData;
    // }

    // TRANSACTIONS //

    // LOCATIONS //
    // const db_getLocations = async () => {
    //     const {data, error} = await supabase
    //         .from('locations')
    //         .select('*');
    //
    //     if (error) throw error;
    //     return data as Location[];
    // }

    // const db_createLocation = async (location: LocationInsert) => {
    //     const {data, error} = await supabase
    //         .from('locations')
    //         .insert(location)
    //         .select()
    //         .single();
    //
    //     if (error) throw error;
    //     return data as Location;
    // }

    // LOCATIONS //

    // DB calls end

    // PUBLIC API //
    // const getItemById = async (id: string): Promise<Item | null> => {
    //     const existingItem = items.find(item => item.id === id);
    //     if (existingItem) return existingItem;
    //
    //     return await dbOperation<Item>(
    //         () => db_getItemById(id),
    //         (item) => setItems(prevItems => [...prevItems, item]),
    //         setItemsError,
    //         LoadError.ITEM
    //     );
    //
    // };

    // const addItem = async (item: ItemInsert): Promise<Item | null> => {
    //     return await dbOperation<Item>(
    //         () => db_createItem(item),
    //         (item) => setItems(prevItems => [...prevItems, item]),
    //         setItemsError,
    //         InsertError.ITEM
    //     )
    // };

    // const updateItem = async (id: string, updates: Partial<Item>): Promise<Item | null> => {
    //     return await dbOperation<Item>(
    //         () => db_updateItem(id, updates),
    //         (item) => setItems(prevItems => prevItems.map(prevItem => prevItem.id === id ? item : prevItem)),
    //         setItemsError,
    //         UpdateError.ITEM
    //     )
    // }
    //
    // const removeItem = async (id: string): Promise<boolean | null> => {
    //     return await dbOperation<boolean>(
    //         () => db_deleteItem(id),
    //         () => setItems(prevItems => prevItems.filter(item => item.id !== id)),
    //         setItemsError,
    //         DeleteError.ITEM
    //     )
    // }

    // const createTransaction = async (transaction: TransactionInsert): Promise<Transaction | null> => {
    //     return await dbOperation<Transaction>(
    //         () => db_createTransaction(transaction),
    //         (transaction) => setTransactions(prevTransactions => [...prevTransactions, transaction]),
    //         setTransactionsError,
    //         InsertError.TRANSACTION
    //     )
    // }

    // const createLocation = async (location: LocationInsert): Promise<Location | null> => {
    //     return await dbOperation<Location>(
    //         () => db_createLocation(location),
    //         (location) => setLocations(prevLocations => [...prevLocations, location]),
    //         setLocationsError,
    //         InsertError.LOCATION
    //     )
    // }

    // const refreshData = async (type:'stocks' | '*') => {
    //     switch (type) {
    //         // case 'items':
    //         //     await dbOperation<Item[]>(db_getItems, setItems, setItemsError, LoadError.ITEMS);
    //         //     break;
    //         case 'stocks':
    //             await dbOperation<Stock[]>(db_getStocks, setStocks, setStocksError, LoadError.STOCKS);
    //             break;
    //         // case 'transactions':
    //         //     await dbOperation<Transaction[]>(db_getTransactions, setTransactions, setTransactionsError, LoadError.TRANSACTIONS);
    //         //     break;
    //         // case 'locations':
    //         //     await dbOperation<Location[]>(db_getLocations, setLocations, setLocationsError, LoadError.LOCATIONS);
    //         //     break;
    //         case '*':
    //             await Promise.all([
    //                 // dbOperation<Item[]>(db_getItems, setItems, setItemsError, LoadError.ITEMS),
    //                 dbOperation<Stock[]>(db_getStocks, setStocks, setStocksError, LoadError.STOCKS),
    //                 // dbOperation<Transaction[]>(db_getTransactions, setTransactions, setTransactionsError, LoadError.TRANSACTIONS),
    //                 // dbOperation<Location[]>(db_getLocations, setLocations, setLocationsError, LoadError.LOCATIONS)
    //             ])
    //             break;
    //         default:
    //             break;
    //     }
    // }

    // PUBLIC API //


    const value: DatabaseContextType = {
        // items,
        // stocks,
        // transactions,
        // locations,
        // getItem: getItemById,
        // addItem,
        // updateItem,
        // removeItem,
        // createTransaction,
        // createLocation,
        isLoading,
        // itemsError,
        // stocksError,
        // transactionsError,
        // locationsError,
        // refreshData,
        dbOperation,
    }

    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};