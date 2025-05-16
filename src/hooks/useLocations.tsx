import {useDatabase} from "../context/DatabaseContext.tsx";
import {supabase} from "../lib/supabase.ts";
import {useCallback, useEffect, useState} from "react";
import type {Database} from "../lib/database.types.ts";

type Location = Database['public']['Tables']['locations']['Row'];
type Stock = Database['public']['Tables']['item_locations']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type LocationUpdate = Database['public']['Tables']['locations']['Update'];

const ERR_LOCATION_INSERT = 'Failed to add location';
const ERR_LOCATIONS_LOAD = 'Failed to load locations';
const ERR_LOCATION_LOAD = 'Failed to load location';
const ERR_LOCATION_UPDATE = 'Failed to update location';

const db_getLocations = async () => {
    const {data, error} = await supabase
        .from('locations')
        .select('*');

    if (error) throw error;
    return data as Location[];
}

const db_getLocationById = async (id: string) => {
    const {data: location, error: locationError} = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

    if (locationError) throw locationError;

    return location as Location;
}

const db_createLocation = async (location: LocationInsert) => {
    const {data, error} = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();

    if (error) throw error;
    return data as Location;
}

const db_updateLocation = async (id: string, updates: LocationUpdate) => {
    const {data, error} = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Location;
}

function useLocations() {
    const {dbOperation} = useDatabase();
    const [locations, setLocations] = useState<Location[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            await dbOperation<Location[]>(db_getLocations, setLocations, setError, ERR_LOCATIONS_LOAD);
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
            .map(stock => stock.quantity * stock.item.unit_cost)
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
        error
    };
}

export default useLocations;