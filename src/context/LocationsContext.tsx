import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {supabase} from "../lib/supabase.ts";
import type {Database} from "../lib/database.types.ts";
import {useAuth} from "./AuthContext.tsx";

type Location = Database['public']['Tables']['locations']['Row'];

interface LocationsContextType {
    locations: Location[];
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

    const {isAuthenticated} = useAuth();

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
    // DB calls end

    // public

    // public

    const value: LocationsContextType = {
        locations,
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