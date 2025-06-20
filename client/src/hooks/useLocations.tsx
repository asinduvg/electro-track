import {useDatabase} from "../context/DatabaseContext.tsx";
import {useCallback, useEffect, useState} from "react";
import type {Location, InsertLocation, ItemLocation, Item} from "@shared/schema";
import {apiClient} from "../lib/api";

type Stock = ItemLocation;
type LocationInsert = InsertLocation;
type LocationUpdate = Partial<Location>;

const ERR_LOCATION_INSERT = 'Failed to add location';
const ERR_LOCATIONS_LOAD = 'Failed to load locations';
const ERR_LOCATION_LOAD = 'Failed to load location';
const ERR_LOCATION_UPDATE = 'Failed to update location';

const db_getLocations = async () => {
    return await apiClient.getLocations() as Location[];
}

const db_getLocationById = async (id: string) => {
    return await apiClient.getLocation(id) as Location;
}

const db_createLocation = async (location: LocationInsert) => {
    return await apiClient.createLocation(location) as Location;
}

const db_updateLocation = async (id: string, updates: LocationUpdate) => {
    return await apiClient.updateLocation(id, updates) as Location;
}

function useLocations() {
    const {dbOperation} = useDatabase();
    const [locations, setLocations] = useState<Location[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await dbOperation<Location[]>(db_getLocations, setLocations, setError, ERR_LOCATIONS_LOAD);
            setIsLoading(false);
        })()
    }, [dbOperation]);

    const createLocation = async (location: LocationInsert): Promise<Location | null> => {
        return await dbOperation<Location>(
            () => db_createLocation(location),
            (location) => setLocations(prevLocations => [...prevLocations, location]),
            setError,
            ERR_LOCATION_INSERT
        )
    }

    const getLocationById = useCallback(async (id: string): Promise<Location | null> => {
        const existingLocation = locations.find(location => location.id === id);

        if (existingLocation) return existingLocation;

        return await dbOperation<Location>(
            () => db_getLocationById(id),
            (location) => setLocations(prevLocations => [...prevLocations, location]),
            setError,
            ERR_LOCATION_LOAD
        )
    }, [dbOperation, locations]);

    const updateLocation = async (id: string, updates: LocationUpdate): Promise<Location | null> => {
        return await dbOperation<Location>(
            () => db_updateLocation(id, updates),
            (location) => setLocations(prevLocations => prevLocations.map(prevLocation => prevLocation.id === id ? location : prevLocation)),
            setError,
            ERR_LOCATION_UPDATE
        )
    }

    const itemsStoredInLocation = (locationId: string, stocks: Stock[]) => {
        return stocks
            .filter(stock => stock.location_id === locationId)
            .map(stock => stock.quantity)
            .reduce((sum, quantity) => sum + quantity, 0);
    }

    const totalValueInLocation = (locationId: string, stocks: Stock[], items: Item[]) => {
        return stocks
            .filter(stock => stock.location_id === locationId)
            .flatMap(stock =>
                items
                    .filter(item => item.id === stock.item_id)
                    .map(item => ({...stock, item}))
            )
            .map(stock => stock.quantity * Number(stock.item.unit_cost))
            .reduce((sum, quantity) => sum + quantity, 0);
    }

    const totalInventoryValue = (stocks: Stock[], items: Item[]) => locations
        .map(location => totalValueInLocation(location.id, stocks, items))
        .reduce((sum, value) => sum + value, 0);

    return {
        locations,
        createLocation,
        getLocationById,
        updateLocation,
        itemsStoredInLocation,
        totalValueInLocation,
        totalInventoryValue,
        error,
        isLoading
    };
}

export default useLocations;