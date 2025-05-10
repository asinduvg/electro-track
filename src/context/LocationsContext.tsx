import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {supabase} from "../lib/supabase.ts";
import type {Database} from "../lib/database.types.ts";
import {useAuth} from "./AuthContext.tsx";

type Location = Database['public']['Tables']['locations']['Row'];

interface LocationsContextType {
    locations: Location[];
    createLocation: (location: Database['public']['Tables']['locations']['Insert']) => Promise<Location | null>;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
}

const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

export const LocationsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const {isAuthenticated, currentUser} = useAuth();

    const refreshLocations = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            const locationsData = await apiGetLocations();
            setLocations(locationsData);

        } catch (err) {
            console.error('Error loading locations:', err);
            setError('Failed to load locations');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [])

    useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                await refreshLocations();
            }
        })()
    }, [isAuthenticated, refreshLocations]);

    // DB calls start
    const apiGetLocations = async () => {
        const {data, error} = await supabase
            .from('locations')
            .select('*');

        if (error) throw error;
        return data as Location[];
    }

    const apiCreateLocation = async (location: Database['public']['Tables']['locations']['Insert']) => {
        const {data, error} = await supabase
            .from('locations')
            .insert(location)
            .select()
            .single();

        if (error) throw error;
        return data as Location;
    }

    // DB calls end

    // public
    const createLocation = async (location: Database['public']['Tables']['locations']['Insert']) => {
        if (!isAuthenticated || !currentUser) {
            setError('You must be logged in to add items');
            return null;
        }

        try {
            setError(null);
            const newLocation = await apiCreateLocation(location);

            // Refresh the items list to include the new item
            await refreshLocations();

            return newLocation;
        } catch (err) {
            console.error('Error creating location', err);
            setError('Failed to create location');
            return null;
        }
    }
    // public

    const value: LocationsContextType = {
        locations,
        createLocation,
        isLoading,
        isRefreshing,
        error,
    }

    return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
}

export const useLocations = () => {
    const context = useContext(LocationsContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationsProvider');
    }
    return context;
};