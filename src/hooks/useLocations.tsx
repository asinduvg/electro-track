import {useDatabase} from "../context/DatabaseContext.tsx";
import {supabase} from "../lib/supabase.ts";
import {useEffect, useState} from "react";
import type {Database} from "../lib/database.types.ts";

type Location = Database['public']['Tables']['locations']['Row'];
type Stock = Database['public']['Tables']['item_locations']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

type LocationInsert = Database['public']['Tables']['locations']['Insert'];

const ERR_LOCATION_INSERT = 'Failed to add location';
const ERR_LOCATIONS_LOAD = 'Failed to load locations';

const db_getLocations = async () => {
    const {data, error} = await supabase
        .from('locations')
        .select('*');

    if (error) throw error;
    return data as Location[];
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

    return {locations, createLocation, itemsStoredInLocation, totalValueInLocation, totalInventoryValue, error};
}

export default useLocations;