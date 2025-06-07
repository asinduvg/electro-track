import {useDatabase} from "../context/DatabaseContext.tsx";
import {Database} from "../lib/database.types.ts";
import {supabase} from "../lib/supabase.ts";
import {useCallback, useEffect, useState} from "react";

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

const ERR_CATEGORIES_LOAD = 'Failed to load categories';
const ERR_CATEGORY_INSERT = 'Failed to add category';

const db_getCategories = async () => {
    const {data: categories, error: categoriesError} = await supabase
        .from('categories')
        .select('*');

    if (categoriesError) throw categoriesError;
    return categories as Category[];
}

const db_createCategory = async (category: CategoryInsert) => {
    const {data, error: categoriesError} = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

    if (categoriesError) throw categoriesError;
    return data as Category;
}

function useCategories() {
    const {dbOperation} = useDatabase();
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (category: CategoryInsert): Promise<Category | null> => {
        return await dbOperation<Category>(
            () => db_createCategory(category),
            (category) => setCategories(prevCategories => [...prevCategories, category]),
            setError,
            ERR_CATEGORY_INSERT
        );
    }

    const getSubcategoriesForCategory = (name: string) => {
        return categories
            .filter(category => category.category === name)
            .map(category => category.subcategory)
    }

    const getCategory = useCallback((id: number) => {
        return categories.find(category => category.id === id)?.category;
    }, [categories]);

    const getSubcategory = useCallback((id: number) => {
        return categories.find(category => category.id === id)?.subcategory;
    }, [categories]);

    useEffect(() => {
        (async () => {
            await dbOperation<Category[]>(db_getCategories, setCategories, setError, ERR_CATEGORIES_LOAD);
        })()
    }, [dbOperation]);

    return {categories, getCategory, getSubcategory, createCategory, getSubcategoriesForCategory, error};
}

export default useCategories;