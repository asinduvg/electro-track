import {useDatabase} from "../context/DatabaseContext.tsx";
import type {Database} from "../lib/database.types.ts";
import {useEffect, useState} from "react";
import {supabase} from "../lib/supabase.ts";

type Item = Database['public']['Tables']['items']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];
type Stock = Database['public']['Tables']['item_locations']['Row'];

type ItemInsert = Database['public']['Tables']['items']['Insert'];

const ERR_ITEM_INSERT = 'Failed to add item';
const ERR_ITEMS_LOAD = 'Failed to load items';
const ERR_ITEM_LOAD = 'Failed to load item';
const ERR_ITEM_UPDATE = 'Failed to update item';
const ERR_ITEM_DELETE = 'Failed to delete item';

const db_getItems = async () => {
    const {data: items, error: itemsError} = await supabase
        .from('items')
        .select('*');

    if (itemsError) throw itemsError;
    return items as Item[];
}

const db_getItemById = async (id: string) => {
    const {data: item, error: itemError} = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

    if (itemError) throw itemError;

    return item as Item;
}

const db_createItem = async (item: ItemInsert) => {
    const {data, error} = await supabase
        .from('items')
        .insert(item)
        .select()
        .single();

    if (error) throw error;
    return data as Item;
}

const db_updateItem = async (id: string, updates: Partial<Database['public']['Tables']['items']['Update']>) => {
    const {data, error} = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

const db_deleteItem = async (id: string) => {
    const {error} = await supabase
        .from('items')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

function useItems() {
    const {dbOperation} = useDatabase();
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getItemById = async (id: string): Promise<Item | null> => {
        const existingItem = items.find(item => item.id === id);
        if (existingItem) return existingItem;

        return await dbOperation<Item>(
            () => db_getItemById(id),
            (item) => setItems(prevItems => [...prevItems, item]),
            setError,
            ERR_ITEM_LOAD
        );
    };

    const addItem = async (item: ItemInsert): Promise<Item | null> => {
        return await dbOperation<Item>(
            () => db_createItem(item),
            (item) => setItems(prevItems => [...prevItems, item]),
            setError,
            ERR_ITEM_INSERT
        )
    };

    const updateItem = async (id: string, updates: Partial<Item>): Promise<Item | null> => {
        return await dbOperation<Item>(
            () => db_updateItem(id, updates),
            (item) => setItems(prevItems => prevItems.map(prevItem => prevItem.id === id ? item : prevItem)),
            setError,
            ERR_ITEM_UPDATE
        )
    }

    const removeItem = async (id: string): Promise<boolean | null> => {
        return await dbOperation<boolean>(
            () => db_deleteItem(id),
            () => setItems(prevItems => prevItems.filter(item => item.id !== id)),
            setError,
            ERR_ITEM_DELETE
        )
    }

    const getTotalQuantity = (itemId: string, stocks: Stock[]) => {
        return stocks
            .filter(stock => stock.item_id === itemId)
            .reduce((sum, stock) => sum + stock.quantity, 0);
    }

    const getQtyInLocation = (itemId: string, locationId: string, stocks: Stock[]): number => {
        return stocks
            .filter(stock => (stock.item_id === itemId) && (stock.location_id === locationId))
            .reduce((sum, stock) => sum + stock.quantity, 0);
    }

    const availableLocations = (itemId: string, locations: Location[], stocks: Stock[]): Location[] => {
        return stocks
            .filter(stock => stock.item_id === itemId && stock.quantity > 0)
            .flatMap(stock => locations
                .filter(location => location.id === stock.location_id)
            )
    }

    // items with stock location details
    const stocksWithLocation = (itemId: string, locations: Location[], stocks: Stock[]) => {
        return (
            stocks
                .filter(stock => stock.item_id === itemId)
                .flatMap(stock => locations
                    .filter(location => location.id === stock.location_id)
                    .map(location => ({...stock, location}))
                ));
    }

    const hasStock = (itemId: string, stocks: Stock[]) => {
        return stocks.some(stock => stock.item_id === itemId);
    }

    const refreshItems = async () => {
        await dbOperation<Item[]>(db_getItems, setItems, setError, ERR_ITEMS_LOAD);
    }

    useEffect(() => {
        (async () => {
            await dbOperation<Item[]>(db_getItems, setItems, setError, ERR_ITEMS_LOAD);
        })()
    }, [dbOperation]);

    return {
        items,
        getItem: getItemById,
        addItem,
        updateItem,
        removeItem,
        getTotalQuantity,
        getQtyInLocation,
        availableLocations,
        stocksWithLocation,
        hasStock,
        error,
        refreshItems
    };

}

export default useItems;