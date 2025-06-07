import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Save, X, Plus} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Modal} from '../components/ui/Modal';
import {useAuth} from '../context/AuthContext';
import useItems from "../hooks/useItems.tsx";
import useCategories from "../hooks/useCategories.tsx";
import {ImageUpload} from "../components/ui/ImageUpload.tsx";
import {uploadItemImage} from "../lib/imageUpload.ts";

const AddItemPage: React.FC = () => {
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Image state
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    // const [imageFile, setImageFile] = useState<File | null>(null);
    // const [uploadProgress, setUploadProgress] = useState(0);

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
        unit_cost: '',
    });

    const {items, addItem, updateItem, error: itemsError} = useItems();
    const {categories, createCategory, getSubcategoriesForCategory, error: categoriesError} = useCategories();

    useEffect(() => {
        if (itemsError) {
            setError(itemsError);
            return;
        }
        if (categoriesError) {
            setError(categoriesError);
            return;
        }
    }, [categoriesError, items, itemsError]);

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

        setNewSubcategory('');
        setIsAddingCategory(false);
    };

    const handleAddSubcategory = () => {
        if (!newSubcategory.trim()) {
            setError('Subcategory name is required');
            return;
        }

        if (categories.some(cat => cat.subcategory === newSubcategory)) {
            setError('Sub category already exists');
            return;
        }

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

            let categoryId: number;

            if (newCategory) {
                const category = await createCategory({category: newCategory, subcategory: newSubcategory});
                if (!category) {
                    setError('Failed to create category');
                    return;
                }
                categoryId = category.id;
            } else {
                const category = categories.find(cat => cat.category === formData.category);
                if (!category) {
                    setError('Category does not exist');
                    return;
                }
                categoryId = category.id;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {category, subcategory, ...itemFields} = formData;

            // Create the item first
            const itemData = {
                ...itemFields,
                minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0,
                unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
                category_id: categoryId,
                created_by: currentUser.id
            };

            const newItem = await addItem(itemData);

            if (!newItem) {
                setError('Failed to create item');
                return;
            }

            // Upload image if one was selected
            let imageUrl: string | null = null;
            if (selectedImageFile) {
                try {
                    imageUrl = await uploadItemImage(selectedImageFile, newItem.id);

                    // Update the item with the image URL
                    // You might want to add an updateItem call here if needed
                    await updateItem(newItem.id, { image_url: imageUrl });
                } catch (imageError) {
                    console.error('Image upload failed:', imageError);
                    // Item was created successfully, but image upload failed
                    // You might want to show a warning instead of an error
                    setError('Item created successfully, but image upload failed. You can edit the item to add an image later.');
                }
            }

            navigate('/inventory/items');
        } catch (err) {
            console.error('Error creating item:', err);
            setError('Failed to create item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate a temporary ID for image upload (you might want to improve this)
    const tempItemId = React.useMemo(() =>
            `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        []
    );

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
                                            value={formData.subcategory}
                                            onChange={handleInputChange}
                                            disabled={!formData.category}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {getSubcategoriesForCategory(formData.category)
                                                .map(subCat => (
                                                    <option key={subCat} value={subCat}>{subCat}</option>
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
                                            disabled={!formData.category}
                                        >
                                            <Plus size={16}/>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            {/*<div className="mt-4">*/}
                            {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
                            {/*        Item Image (Optional)*/}
                            {/*    </label>*/}
                            {/*    <div className="flex items-center space-x-4">*/}
                            {/*        <div*/}
                            {/*            className={`w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${*/}
                            {/*                imageUrl ? 'border-blue-500' : 'border-gray-300'*/}
                            {/*            }`}*/}
                            {/*        >*/}
                            {/*            {imageUrl ? (*/}
                            {/*                <img*/}
                            {/*                    src={imageUrl}*/}
                            {/*                    alt="Preview"*/}
                            {/*                    className="w-full h-full object-cover rounded-lg"*/}
                            {/*                />*/}
                            {/*            ) : (*/}
                            {/*                <ImageIcon className="w-8 h-8 text-gray-400"/>*/}
                            {/*            )}*/}
                            {/*        </div>*/}
                            {/*        <div className="flex-1">*/}
                            {/*            <input*/}
                            {/*                type="file"*/}
                            {/*                accept="image/*"*/}
                            {/*                onChange={handleImageChange}*/}
                            {/*                className="hidden"*/}
                            {/*                id="item-image"*/}
                            {/*            />*/}
                            {/*            <label*/}
                            {/*                htmlFor="item-image"*/}
                            {/*                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"*/}
                            {/*            >*/}
                            {/*                <Upload className="w-4 h-4 mr-2"/>*/}
                            {/*                {imageUrl ? 'Change Image' : 'Upload Image'}*/}
                            {/*            </label>*/}
                            {/*            {imageFile && (*/}
                            {/*                <p className="mt-2 text-sm text-gray-500">*/}
                            {/*                    {imageFile.name}*/}
                            {/*                </p>*/}
                            {/*            )}*/}
                            {/*            {uploadProgress > 0 && uploadProgress < 100 && (*/}
                            {/*                <div className="mt-2">*/}
                            {/*                    <div className="bg-gray-200 rounded-full h-2.5">*/}
                            {/*                        <div*/}
                            {/*                            className="bg-blue-600 h-2.5 rounded-full"*/}
                            {/*                            style={{width: `${uploadProgress}%`}}*/}
                            {/*                        ></div>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            )}*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            <ImageUpload
                                onImageChange={handleImageChange}
                                onError={handleImageError}
                                disabled={isSubmitting}
                            />

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