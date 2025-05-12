import {supabase} from "../lib/supabase.ts";
import type {Database} from "../lib/database.types.ts";
import {useEffect, useState} from "react";
import {useDatabase} from "../context/DatabaseContext.tsx";

type Stock = Database['public']['Tables']['item_locations']['Row'];

const ERR_STOCKS_LOAD = 'Failed to load locations';

const db_getStocks = async () => {
    const {data, error} = await supabase
        .from('item_locations')
        .select('*');

    if (error) throw error;
    return data as Stock[];
}

function useStocks() {
    const {dbOperation} = useDatabase();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            await dbOperation<Stock[]>(db_getStocks, setStocks, setError, ERR_STOCKS_LOAD);
        })()
    }, [dbOperation]);

    return {stocks, error};
}

export default useStocks;