import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Save, X} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {getCategoriesList, getSubcategoriesForCategory} from '../data/mockData';
import {useAuth} from '../context/AuthContext';
import useItems from "../hooks/useItems.tsx";

const AddItemPage: React.FC = () => {
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const categories = getCategoriesList();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        minimum_stock: 0,
        unit_cost: 0
    });

    const {items, addItem, error: itemsError} = useItems();

    useEffect(() => {
        if (itemsError) {
            setError(itemsError);
            return;
        }
    }, [items, itemsError]);

    // Get subcategories based on selected category
    const subcategories = formData.category
        ? getSubcategoriesForCategory(formData.category)
        : [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        // Handle numeric fields
        if (name === 'minimum_stock' || name === 'unit_cost') {
            setFormData({
                ...formData,
                [name]: Math.max(0, parseFloat(value) || 0)
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
            setError('You must be logged in to add items');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Create the item first
            const itemData = {
                ...formData,
                created_by: currentUser.id
            };

            await addItem(itemData);

            navigate('/inventory/items');
        } catch (err) {
            console.error('Error creating item:', err);
            setError('Failed to create item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
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
                <div className="grid grid-cols-1 gap-6">
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
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    required
                                    helperText="Unique identifier for this item"
                                />
                                <Input
                                    label="Name"
                                    id="name"
                                    name="name"
                                    value={formData.name}
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
                                    value={formData.description}
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
                                        value={formData.category}
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
                                        value={formData.subcategory}
                                        onChange={handleInputChange}
                                        disabled={!formData.category}
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
                                    value={formData.manufacturer}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    label="Model"
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Serial Number"
                                    id="serial_number"
                                    name="serial_number"
                                    value={formData.serial_number}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Minimum Stock"
                                    id="minimum_stock"
                                    name="minimum_stock"
                                    type="number"
                                    min="0"
                                    value={formData.minimum_stock}
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
                                    value={formData.unit_cost}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/inventory/items')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save size={16}/>}
                        isLoading={isSubmitting}
                    >
                        Save Item
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddItemPage;