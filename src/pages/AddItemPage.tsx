import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Save, X, Upload, Image as ImageIcon, Plus} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Modal} from '../components/ui/Modal';
import {getCategoriesList, getSubcategoriesForCategory, categories} from '../data/mockData';
import {useAuth} from '../context/AuthContext';
import useItems from "../hooks/useItems.tsx";
import {supabase} from '../lib/supabase';

const AddItemPage: React.FC = () => {
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const allCategories = getCategoriesList();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // New category modal state
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    // New subcategory modal state
    const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
    const [newSubcategory, setNewSubcategory] = useState('');

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        minimum_stock: '',
        unit_cost: ''
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
            // Remove leading zeros and any non-numeric characters except decimal point
            const sanitizedValue = value.replace(/^0+/, '').replace(/[^\d.]/g, '');
            setFormData({
                ...formData,
                [name]: sanitizedValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const uploadImage = async (itemId: string): Promise<string | null> => {
        if (!imageFile) return null;

        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${itemId}.${fileExt}`;
            const filePath = `items/${fileName}`;

            const {error: uploadError, data} = await supabase.storage
                .from('items')
                .upload(filePath, imageFile, {
                    upsert: true,
                    onUploadProgress: (progress) => {
                        setUploadProgress((progress.loaded / progress.total) * 100);
                    }
                });

            if (uploadError) throw uploadError;

            const {data: {publicUrl}} = supabase.storage
                .from('items')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            throw new Error('Failed to upload image');
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.trim()) {
            setError('Category name is required');
            return;
        }

        // Add the new category to the categories array
        categories.push({
            name: newCategory,
            subcategories: []
        });

        // Update form data with the new category
        setFormData({
            ...formData,
            category: newCategory,
            subcategory: '' // Reset subcategory when changing category
        });

        setNewCategory('');
        setIsAddingCategory(false);
    };

    const handleAddSubcategory = () => {
        if (!newSubcategory.trim()) {
            setError('Subcategory name is required');
            return;
        }

        // Find the current category and add the new subcategory
        const category = categories.find(cat => cat.name === formData.category);
        if (category) {
            category.subcategories.push(newSubcategory);

            // Update form data with the new subcategory
            setFormData({
                ...formData,
                subcategory: newSubcategory
            });
        }

        setNewSubcategory('');
        setIsAddingSubcategory(false);
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
                minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0,
                unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
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
                                    <div className="flex space-x-2">
                                        <select
                                            id="category"
                                            name="category"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {allCategories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddingSubcategory(true)}
                                            disabled={!formData.category}
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
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.minimum_stock}
                                    onChange={handleInputChange}
                                    helperText="Alert when quantity falls below this number"
                                />
                                <Input
                                    label="Unit Cost ($)"
                                    id="unit_cost"
                                    name="unit_cost"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
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

export default AddItemPage;