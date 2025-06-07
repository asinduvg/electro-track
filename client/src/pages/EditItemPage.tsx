import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X, Package } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import useItems from "../hooks/useItems";
import useCategories from "../hooks/useCategories";

const EditItemPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const { items, updateItem } = useItems();
    const { categories } = useCategories();

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        manufacturer: '',
        category_id: '',
        unit_cost: '0',
        minimum_stock: 0,
        status: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued',
        image_url: ''
    });

    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

    // Get unique main categories
    const getMainCategories = () => {
        const uniqueCategories = new Set();
        return categories.filter((category: any) => {
            if (!uniqueCategories.has(category.category)) {
                uniqueCategories.add(category.category);
                return true;
            }
            return false;
        });
    };

    // Get subcategories for selected main category
    const getSubcategoriesForCategory = (mainCategory: string) => {
        return categories.filter((category: any) => category.category === mainCategory);
    };

    const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategory = e.target.value;
        setSelectedMainCategory(selectedCategory);
        
        if (selectedCategory) {
            const subcategories = getSubcategoriesForCategory(selectedCategory);
            setAvailableSubcategories(subcategories);
        } else {
            setAvailableSubcategories([]);
        }
        
        // Reset category_id when main category changes
        setFormData(prev => ({
            ...prev,
            category_id: ''
        }));
    };

    useEffect(() => {
        if (!id) {
            setError('Item ID is required');
            setIsLoading(false);
            return;
        }

        const item = items.find(item => item.id === id);
        if (item) {
            setFormData({
                sku: item.sku || '',
                name: item.name || '',
                description: item.description || '',
                manufacturer: item.manufacturer || '',
                category_id: item.category_id?.toString() || '',
                unit_cost: item.unit_cost || '0',
                minimum_stock: item.minimum_stock || 0,
                status: item.status || 'in_stock',
                image_url: item.image_url || ''
            });
            
            // Initialize category dropdowns with existing item's category
            if (item.category_id && categories.length > 0) {
                const selectedCategory = categories.find((cat: any) => cat.id === item.category_id);
                if (selectedCategory) {
                    setSelectedMainCategory(selectedCategory.category);
                    const subcategories = getSubcategoriesForCategory(selectedCategory.category);
                    setAvailableSubcategories(subcategories);
                }
            }
            
            // Set existing image preview if available
            if (item.image_url) {
                setImagePreviews([item.image_url]);
            }
            
            setIsLoading(false);
        } else if (items.length > 0) {
            setError('Item not found');
            setIsLoading(false);
        }
    }, [id, items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'unit_cost' || name === 'minimum_stock') {
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.7);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            const file = files[0]; // Only take the first file for editing
            const compressedFile = await compressImage(file);
            const base64 = await convertImageToBase64(compressedFile);
            
            setImageFiles([compressedFile]);
            setImagePreviews([base64]);
            
            // Update form data with the new image
            setFormData(prev => ({
                ...prev,
                image_url: base64
            }));
        } catch (error) {
            console.error('Error processing image:', error);
            setError('Failed to process image. Please try again.');
        }
    };

    const removeImage = () => {
        setImageFiles([]);
        setImagePreviews([]);
        setFormData(prev => ({
            ...prev,
            image_url: ''
        }));
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

            await updateItem(id, {
                ...formData,
                category_id: parseInt(formData.category_id) || 1
            });
            navigate('/inventory/items');
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
            </div>
        );
    }

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'inventory_manager')) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-700">Access Denied</h2>
                    <p className="mt-2 text-slate-500">
                        You don't have permission to edit inventory items.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-700">{error}</h2>
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/inventory/items')}
                        className="mt-4 bg-white border-slate-200 hover:bg-slate-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/inventory/items')}
                            className="flex items-center bg-white border-slate-200 hover:bg-slate-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Edit Item</h1>
                            <p className="text-slate-500">Update item information and settings</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-900">
                            <Package className="mr-3 h-6 w-6 text-emerald-600" />
                            Item Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        SKU
                                    </label>
                                    <Input 
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        placeholder="Enter SKU" 
                                        required
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Name
                                    </label>
                                    <Input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter item name" 
                                        required
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Manufacturer
                                    </label>
                                    <Input 
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleInputChange}
                                        placeholder="Enter manufacturer" 
                                        required
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                                    rows={3}
                                    placeholder="Enter item description"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Main Category
                                    </label>
                                    <select 
                                        value={selectedMainCategory}
                                        onChange={handleMainCategoryChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                        required
                                    >
                                        <option value="">Select Main Category</option>
                                        {getMainCategories().map((category: any) => (
                                            <option key={`main-${category.category}`} value={category.category}>
                                                {category.category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Subcategory
                                    </label>
                                    <select 
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                        required
                                        disabled={!selectedMainCategory}
                                    >
                                        <option value="">Select Subcategory</option>
                                        {availableSubcategories.map((category: any) => (
                                            <option key={category.id} value={category.id}>
                                                {category.subcategory}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Unit Cost ($)
                                    </label>
                                    <Input 
                                        name="unit_cost"
                                        value={formData.unit_cost}
                                        onChange={handleInputChange}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00" 
                                        required
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Minimum Stock
                                    </label>
                                    <Input 
                                        name="minimum_stock"
                                        value={formData.minimum_stock}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0" 
                                        required
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Status
                                </label>
                                <select 
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                    required
                                >
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>

                            {/* Image Upload Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Item Image
                                </label>
                                
                                {imagePreviews.length > 0 ? (
                                    <div className="relative">
                                        <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img
                                                src={imagePreviews[0]}
                                                alt="Item preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="mt-4">
                                            <label className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Change Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center relative bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                        <div className="text-sm text-slate-600 mb-4">
                                            <label className="font-medium text-[#FF385C] hover:text-[#E31C5F] cursor-pointer transition-colors">
                                                Click to upload
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="sr-only"
                                                />
                                            </label> or drag and drop
                                        </div>
                                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-3 font-medium transition-colors shadow-lg hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Updating...' : 'Update Item'}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => navigate('/inventory/items')}
                                    className="bg-white border-slate-200 hover:bg-slate-50 px-8 py-3 font-medium transition-colors"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditItemPage;