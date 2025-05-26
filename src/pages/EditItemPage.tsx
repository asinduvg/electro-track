import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Save, X, Plus} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Modal} from '../components/ui/Modal';
import {useAuth} from '../context/AuthContext';
import type {Database} from '../lib/database.types';
import useItems from "../hooks/useItems.tsx";
import useCategories from "../hooks/useCategories.tsx";
import {ImageUpload} from "../components/ui/ImageUpload";
import {uploadItemImage, deleteItemImage} from "../lib/imageUpload";

type ItemUpdate = Database['public']['Tables']['items']['Update'];

const EditItemPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Image state
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    // New category modal state
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    // New subcategory modal state
    const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
    const [newSubcategory, setNewSubcategory] = useState('');

    const {getItem, updateItem, error: itemsError} = useItems();
    const {categories, createCategory, getCategory, getSubcategoriesForCategory, getSubcategory, error: categoriesError} = useCategories();

    const [formData, setFormData] = useState<ItemUpdate | null>(null);

    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');

    useEffect(() => {
        (async () => {
            try {
                if (!id) throw new Error('Item ID is required');

                if (itemsError) {
                    setError(itemsError);
                    return;
                }
                if (categoriesError) {
                    setError(categoriesError);
                    return;
                }

                const item = await getItem(id);

                if (!item) throw new Error('Item not found');

                const category = getCategory(item.category_id);
                const subcategory = getSubcategory(item.category_id);

                setCategory(category || '');
                setSubcategory(subcategory || '');
                setFormData(item);
                
                // Set initial image preview if item has an image
                if (item.image_url) {
                    setImagePreviewUrl(item.image_url);
                }
            } catch (err) {
                console.error('Error loading item:', err);
                setError('Failed to load item details');
            } finally {
                setIsLoading(false);
            }
        })()
    }, [categoriesError, getCategory, getSubcategory, id, itemsError]);

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

    const handleImageChange = (file: File | null, previewUrl: string | null) => {
        setSelectedImageFile(file);
        setImagePreviewUrl(previewUrl);
    };

    const handleImageError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setError('Category name is required');
            return;
        }

        if (categories.some(cat => cat.category === newCategory)) {
            setError('Category already exists');
            return;
        }

        setCategory(newCategory);
        setNewSubcategory('');
        setIsAddingCategory(false);
    };

    const handleAddSubcategory = async () => {
        if (!newSubcategory.trim()) {
            setError('Subcategory name is required');
            return;
        }

        if (categories.some(cat => cat.subcategory === newSubcategory)) {
            setError('Sub category already exists');
            return;
        }

        setSubcategory(newSubcategory);
        setIsAddingSubcategory(false);
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

            const alreadyExistingCategory = categories.find(cat => cat.category === category)

            if (alreadyExistingCategory) {
                formData.category_id = alreadyExistingCategory.id;
            } else {
                const categoryData = await createCategory({category: newCategory, subcategory: newSubcategory});
                if (!categoryData) return;
                formData.category_id = categoryData.id;
            }

            // Handle image update
            let imageUrl = formData.image_url;
            if (selectedImageFile) {
                // Delete old image if it exists
                if (formData.image_url) {
                    try {
                        await deleteItemImage(formData.image_url);
                    } catch (error) {
                        console.error('Error deleting old image:', error);
                    }
                }
                
                // Upload new image
                imageUrl = await uploadItemImage(selectedImageFile, id);
            }

            // Update item with new data including image URL
            await updateItem(id, {
                ...formData,
                image_url: imageUrl
            });

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
                                {/* Image Upload */}
                                <ImageUpload
                                    currentImageUrl={formData?.image_url}
                                    onImageChange={handleImageChange}
                                    onError={handleImageError}
                                    disabled={isSubmitting}
                                />

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
                                        <div className="flex space-x-2">
                                            <select
                                                id="category"
                                                name="category"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category.category} value={category.category}>
                                                        {category.category}
                                                    </option>
                                                ))}
                                                {newCategory && (
                                                    <option value={newCategory}>{newCategory}</option>
                                                )}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAddingCategory(true)}
                                            >
                                                <Plus size={16}/>
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="subcategory"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Subcategory
                                        </label>
                                        <div className="flex space-x-2">
                                            <select
                                                id="subcategory"
                                                name="subcategory"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={subcategory}
                                                onChange={(e) => setSubcategory(e.target.value)}
                                                disabled={!formData?.category_id}
                                            >
                                                <option value="">Select Subcategory</option>
                                                {category && getSubcategoriesForCategory(category).map((subcategory) => (
                                                    <option key={subcategory} value={subcategory}>
                                                        {subcategory}
                                                    </option>
                                                ))}
                                                {newSubcategory && (
                                                    <option value={newSubcategory}>{newSubcategory}</option>
                                                )}
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAddingSubcategory(true)}
                                                disabled={!formData?.category_id}
                                            >
                                                <Plus size={16}/>
                                            </Button>
                                        </div>
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

            {/* Add Category Modal */}
            <Modal
                isOpen={isAddingCategory}
                onClose={() => setIsAddingCategory(false)}
                title="Add New Category"
            >
                <div className="space-y-4">
                    <Input
                        label="Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                        required
                    />

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddingCategory(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddCategory}
                        >
                            Add Category
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Subcategory Modal */}
            <Modal
                isOpen={isAddingSubcategory}
                onClose={() => setIsAddingSubcategory(false)}
                title="Add New Subcategory"
            >
                <div className="space-y-4">
                    <Input
                        label="Subcategory Name"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Enter new subcategory name"
                        required
                    />

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddingSubcategory(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddSubcategory}
                        >
                            Add Subcategory
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EditItemPage;