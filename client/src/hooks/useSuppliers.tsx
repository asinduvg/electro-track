import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export interface Supplier {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface InsertSupplier {
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    status?: 'active' | 'inactive' | 'pending';
    rating?: number;
    notes?: string;
}

const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getAllSuppliers();
            setSuppliers(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setError('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const createSupplier = async (supplierData: InsertSupplier): Promise<Supplier> => {
        try {
            const newSupplier = await apiClient.createSupplier(supplierData);
            setSuppliers(prev => [...prev, newSupplier]);
            return newSupplier;
        } catch (err) {
            console.error('Error creating supplier:', err);
            throw new Error('Failed to create supplier');
        }
    };

    const updateSupplier = async (id: string, updates: Partial<InsertSupplier>): Promise<Supplier> => {
        try {
            const updatedSupplier = await apiClient.updateSupplier(id, updates);
            setSuppliers(prev => prev.map(supplier => 
                supplier.id === id ? updatedSupplier : supplier
            ));
            return updatedSupplier;
        } catch (err) {
            console.error('Error updating supplier:', err);
            throw new Error('Failed to update supplier');
        }
    };

    const deleteSupplier = async (id: string): Promise<void> => {
        try {
            await apiClient.deleteSupplier(id);
            setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
        } catch (err) {
            console.error('Error deleting supplier:', err);
            throw new Error('Failed to delete supplier');
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return {
        suppliers,
        loading,
        error,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        refreshSuppliers: fetchSuppliers
    };
};

export default useSuppliers;