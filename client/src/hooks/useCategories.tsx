import {useDatabase} from "../context/DatabaseContext.tsx";
import {apiClient} from "../lib/api";
import type {Category, InsertCategory} from "@shared/schema";
import {useCallback, useEffect, useState} from "react";

type CategoryInsert = InsertCategory;

const ERR_CATEGORIES_LOAD = 'Failed to load categories';
const ERR_CATEGORY_INSERT = 'Failed to add category';

const db_getCategories = async () => {
    return await apiClient.getCategories() as Category[];
}

const db_createCategory = async (category: CategoryInsert) => {
    return await apiClient.createCategory(category) as Category;
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