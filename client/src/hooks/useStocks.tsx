import {apiClient} from "../lib/api";
import type {ItemLocation} from "@shared/schema";
import {useEffect, useState} from "react";
import {useDatabase} from "../context/DatabaseContext.tsx";

type Stock = ItemLocation;

const ERR_STOCKS_LOAD = 'Failed to load item locations';

const db_getStocks = async () => {
    return await apiClient.getItemLocations() as Stock[];
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