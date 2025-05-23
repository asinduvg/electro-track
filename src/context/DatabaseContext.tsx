import React, {createContext, useCallback, useContext, useEffect, useState} from "react";

interface DatabaseContextType {
    isLoading: boolean;
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

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {

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
    }, [])

    // load data from database
    useEffect(() => {
        (async () => {
            await Promise.all([])
        })()
    }, [dbOperation]);

    const value: DatabaseContextType = {
        isLoading,
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
