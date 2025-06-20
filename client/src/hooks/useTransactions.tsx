import {useDatabase} from "../context/DatabaseContext.tsx";
import {useEffect, useState} from "react";
import type {Transaction, InsertTransaction, Item} from "@shared/schema";
import {apiClient} from "../lib/api";

const ERR_TXN_INSERT = 'Failed to add transaction';
const ERR_TXN_LOAD = 'Failed to load transactions';

const db_getTransactions = async () => {
    return await apiClient.getTransactions() as Transaction[];
}

const db_createTransaction = async (transaction: InsertTransaction) => {
    return await apiClient.createTransaction({
        ...transaction,
        metadata: {
            browser: navigator.userAgent,
            timestamp: new Date().toISOString()
        }
    }) as Transaction;
}

function useTransactions() {
    const {dbOperation} = useDatabase();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await dbOperation<Transaction[]>(db_getTransactions, setTransactions, setError, ERR_TXN_LOAD);
            setIsLoading(false);
        })()
    }, [dbOperation]);

    // WARNING!! refresh or navigation to another page is necessary after a txn to keep the state upto date
    const createTransaction = async (transaction: InsertTransaction): Promise<Transaction | null> => {
        return await dbOperation<Transaction>(
            () => db_createTransaction(transaction),
            (transaction) => setTransactions(prevTransactions => [...prevTransactions, transaction]),
            setError,
            ERR_TXN_INSERT
        )
    }

    const getItemDetailsForTransactions = (transactions: Transaction[], items: Item[]) => {
        return transactions.flatMap(transaction => {
            return items
                .filter(item => item.id === transaction.item_id)
                .map(item => ({...transaction, item}))
        })
    }

    return {transactions, createTransaction, getItemDetailsForTransactions, error, isLoading};
}

export default useTransactions;