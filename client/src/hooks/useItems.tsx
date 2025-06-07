import {useDatabase} from "../context/DatabaseContext.tsx";
import {apiClient} from "../lib/api";
import type {Item, Location, ItemLocation, InsertItem} from "@shared/schema";
import {useEffect, useState} from "react";

type Stock = ItemLocation;
type ItemInsert = InsertItem;

const ERR_ITEM_INSERT = 'Failed to add item';
const ERR_ITEMS_LOAD = 'Failed to load items';
const ERR_ITEM_LOAD = 'Failed to load item';
const ERR_ITEM_UPDATE = 'Failed to update item';
const ERR_ITEM_DELETE = 'Failed to delete item';

const db_getItems = async () => {
    return await apiClient.getItems() as Item[];
}

const db_getItemById = async (id: string) => {
    return await apiClient.getItem(id) as Item;
}

const db_createItem = async (item: ItemInsert) => {
    return await apiClient.createItem(item) as Item;
}

const db_updateItem = async (id: string, updates: Partial<Item>) => {
    return await apiClient.updateItem(id, updates) as Item;
}

const db_deleteItem = async (id: string) => {
    await apiClient.deleteItem(id);
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