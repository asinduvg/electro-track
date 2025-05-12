import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Save, X} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {getCategoriesList, getSubcategoriesForCategory} from '../data/mockData';
import {useAuth} from '../context/AuthContext';
import type {Database} from '../lib/database.types';
import {useDatabase} from "../context/DatabaseContext.tsx";

// type Item = Database['public']['Tables']['items']['Row'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

const EditItemPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const categories = getCategoriesList();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const {getItem, updateItem, itemsError} = useDatabase();

    const [formData, setFormData] = useState<ItemUpdate | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!id) throw new Error('Item ID is required');

                if (itemsError) {
                    setError(itemsError);
                    return;
                }
                const item = await getItem(id);
                if (!item) throw new Error('Item not found');
                setFormData(item);
            } catch (err) {
                console.error('Error loading item:', err);
                setError('Failed to load item details');
            } finally {
                setIsLoading(false);
            }
        })()
    }, [getItem, id, itemsError]);

    // Get subcategories based on selected category
    const subcategories = formData?.category
        ? getSubcategoriesForCategory(formData.category)
        : [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        // Handle numeric fields
        if (name === 'quantity' || name === 'minimum_stock' || name === 'unit_cost') {
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to edit items');
            return;
        }

        if (!id) {
            setError('Item ID is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            if (!formData) return;

            console.log('formData', formData)

            await updateItem(id, formData);
            navigate(`/inventory/view/${id}`);
        } catch (err) {
            console.error('Error updating item:', err);
            setError('Failed to update item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'inventory_manager')) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-700">Access Denied</h2>
                <p className="mt-2 text-gray-500">
                    You don't have permission to edit inventory items.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Item</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="SKU"
                                        id="sku"
                                        name="sku"
                                        value={formData?.sku}
                                        onChange={handleInputChange}
                                        required
                                        helperText="Unique identifier for this item"
                                    />
                                    <Input
                                        label="Name"
                                        id="name"
                                        name="name"
                                        value={formData?.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={formData?.description || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={formData?.category}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="subcategory"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Subcategory
                                        </label>
                                        <select
                                            id="subcategory"
                                            name="subcategory"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={formData?.subcategory || ''}
                                            onChange={handleInputChange}
                                            disabled={!formData?.category}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {subcategories.map((subcategory) => (
                                                <option key={subcategory} value={subcategory}>
                                                    {subcategory}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Manufacturing Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Manufacturing Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Manufacturer"
                                        id="manufacturer"
                                        name="manufacturer"
                                        value={formData?.manufacturer}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input
                                        label="Model"
                                        id="model"
                                        name="model"
                                        value={formData?.model || ''}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Serial Number"
                                        id="serial_number"
                                        name="serial_number"
                                        value={formData?.serial_number || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Inventory Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/*<Input*/}
                                    {/*    label="Quantity"*/}
                                    {/*    id="quantity"*/}
                                    {/*    name="quantity"*/}
                                    {/*    type="number"*/}
                                    {/*    min="0"*/}
                                    {/*    value={formData.quantity?.toString()}*/}
                                    {/*    onChange={handleInputChange}*/}
                                    {/*    required*/}
                                    {/*/>*/}
                                    <Input
                                        label="Minimum Stock"
                                        id="minimum_stock"
                                        name="minimum_stock"
                                        type="number"
                                        min="0"
                                        value={formData?.minimum_stock?.toString()}
                                        onChange={handleInputChange}
                                        helperText="Alert when quantity falls below this number"
                                    />
                                    <Input
                                        label="Unit Cost ($)"
                                        id="unit_cost"
                                        name="unit_cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData?.unit_cost?.toString()}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    {/*<label*/}
                                    {/*    htmlFor="location_id"*/}
                                    {/*    className="block text-sm font-medium text-gray-700 mb-1"*/}
                                    {/*>*/}
                                    {/*    Storage Location*/}
                                    {/*</label>*/}
                                    {/*<select*/}
                                    {/*    id="location_id"*/}
                                    {/*    name="location_id"*/}
                                    {/*    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"*/}
                                    {/*    value={formData.location_id || ''}*/}
                                    {/*    onChange={handleInputChange}*/}
                                    {/*    required*/}
                                    {/*>*/}
                                    {/*    <option value="">Select Location</option>*/}
                                    {/*    {locations.map((location) => (*/}
                                    {/*        <option key={location.id} value={location.id}>*/}
                                    {/*            {location.building} &gt; {location.room} &gt; {location.unit}*/}
                                    {/*        </option>*/}
                                    {/*    ))}*/}
                                    {/*</select>*/}
                                </div>

                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={formData?.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="discontinued">Discontinued</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/inventory/view/${id}`)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save size={16}/>}
                        isLoading={isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditItemPage;