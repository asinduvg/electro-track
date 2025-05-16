import {useDatabase} from "../context/DatabaseContext.tsx";
import {supabase} from "../lib/supabase.ts";
import type {Database} from "../lib/database.types.ts";
import {useEffect, useState} from "react";

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

type Item = Database['public']['Tables']['items']['Row'];

const ERR_TXN_INSERT = 'Failed to add transaction';
const ERR_TXN_LOAD = 'Failed to load transactions';

const db_getTransactions = async () => {
    const {data, error: transactionsError} = await supabase
        .from('transactions')
        .select('*');

    if (transactionsError) throw transactionsError;
    return data as Transaction[];
}

const db_createTransaction = async (transaction: TransactionInsert) => {
    // First create the transaction record with metadata
    const {data: transactionData, error: transactionError} = await supabase
        .from('transactions')
        .insert({
            ...transaction,
            metadata: {
                browser: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        })
        .select()
        .single();

    if (transactionError) throw transactionError;
    return transactionData;
}

function useTransactions() {
    const {dbOperation} = useDatabase();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            await dbOperation<Transaction[]>(db_getTransactions, setTransactions, setError, ERR_TXN_LOAD);
        })()
    }, [dbOperation]);

    // WARNING!! refresh or navigation to another page is necessary after a txn to keep the state upto date
    const createTransaction = async (transaction: TransactionInsert): Promise<Transaction | null> => {
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

    return {transactions, createTransaction, getItemDetailsForTransactions, error};
}

export default useTransactions;