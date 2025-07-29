import { useDatabase } from '../context/DatabaseContext.tsx';
import { apiClient } from '../lib/api';
import type { Category, InsertCategory } from '@shared/schema';
import { useCallback, useEffect, useState } from 'react';

type CategoryInsert = InsertCategory;

const ERR_CATEGORIES_LOAD = 'Failed to load categories';
const ERR_CATEGORY_INSERT = 'Failed to add category';

const db_getCategories = async () => {
  return (await apiClient.getCategories()) as Category[];
};

const db_createCategory = async (category: CategoryInsert) => {
  return (await apiClient.createCategory(category)) as Category;
};

function useCategories() {
  const { dbOperation } = useDatabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createCategory = async (category: CategoryInsert): Promise<Category | null> => {
    return await dbOperation<Category>(
      () => db_createCategory(category),
      (category) => setCategories((prevCategories) => [...prevCategories, category]),
      setError,
      ERR_CATEGORY_INSERT
    );
  };

  const getSubcategoriesForCategory = (name: string) => {
    return categories
      .filter((category) => category.category === name)
      .map((category) => category.subcategory);
  };

  const getCategory = useCallback(
    (id: number) => {
      return categories.find((category) => category.id === id)?.category;
    },
    [categories]
  );

  const getSubcategory = useCallback(
    (id: number) => {
      return categories.find((category) => category.id === id)?.subcategory;
    },
    [categories]
  );

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dbOperation<Category[]>(db_getCategories, setCategories, setError, ERR_CATEGORIES_LOAD);
      setIsLoading(false);
    })();
  }, [dbOperation]);

  const updateCategory = async (
    id: number,
    updates: Partial<CategoryInsert>
  ): Promise<Category | null> => {
    try {
      const updatedCategory = await apiClient.updateCategory(id, updates);
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)));
      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category:', error);
      setError('Failed to update category');
      return null;
    }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      await apiClient.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category');
      return false;
    }
  };

  return {
    categories,
    getCategory,
    getSubcategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategoriesForCategory,
    error,
    isLoading,
  };
}

export default useCategories;
