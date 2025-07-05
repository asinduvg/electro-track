import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Package, Plus, Check, Upload, X, Image } from 'lucide-react';
import useItems from '../hooks/useItems';
import useCategories from '../hooks/useCategories';
import { AddItemFormSkeleton } from './ui/InventorySkeletons';
import useLocations from '../hooks/useLocations';

interface AddItemFormProps {
    onSuccess?: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onSuccess }) => {
    const { addItem } = useItems();
    const { categories, isLoading: categoriesLoading } = useCategories();
    const { locations, isLoading: locationsLoading } = useLocations();
    
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        manufacturer: '',
        description: '',
        category_id: '',
        unit_cost: '',
        minimum_stock: '',
        status: 'in_stock'
    });
    
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Group categories by main category
    const mainCategories = categories.reduce((acc: any, cat: any) => {
        if (!acc[cat.category]) {
            acc[cat.category] = [];
        }
        acc[cat.category].push(cat);
        return acc;
    }, {});

    useEffect(() => {
        if (selectedMainCategory && mainCategories[selectedMainCategory]) {
            setAvailableSubcategories(mainCategories[selectedMainCategory]);
        } else {
            setAvailableSubcategories([]);
        }
    }, [selectedMainCategory, categories]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedMainCategory(category);
        setFormData(prev => ({
            ...prev,
            category_id: ''
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setFormErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
                return;
            }
            
            setSelectedImage(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            // Clear any previous image errors
            setFormErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setFormErrors(prev => ({ ...prev, image: '' }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.sku.trim()) errors.sku = 'SKU is required';
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.category_id) errors.category_id = 'Category is required';
        if (!formData.unit_cost) errors.unit_cost = 'Unit cost is required';
        if (formData.unit_cost && parseFloat(formData.unit_cost) < 0) {
            errors.unit_cost = 'Unit cost cannot be negative';
        }
        if (!formData.minimum_stock) errors.minimum_stock = 'Minimum stock is required';
        if (formData.minimum_stock && parseInt(formData.minimum_stock) <= 0) {
            errors.minimum_stock = 'Minimum stock must be greater than 0';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const itemData = {
                ...formData,
                unit_cost: formData.unit_cost,
                minimum_stock: parseInt(formData.minimum_stock),
                category_id: parseInt(formData.category_id)
            };
            
            await addItem(itemData);
            
            // Reset form
            setFormData({
                sku: '',
                name: '',
                manufacturer: '',
                description: '',
                category_id: '',
                unit_cost: '',
                minimum_stock: '',
                status: 'in_stock'
            });
            setSelectedMainCategory('');
            setSelectedImage(null);
            setImagePreview(null);
            setSuccessMessage('Item added successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            console.error('Error adding item:', error);
            setFormErrors({ general: 'Failed to add item. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (categoriesLoading || locationsLoading) {
        return <AddItemFormSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Add New Item</h2>
                <p className="text-slate-500">Create a new inventory component</p>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800">{successMessage}</span>
                </div>
            )}

            <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl">
                        <Package className="mr-2 h-6 w-6 text-[#FF385C]" />
                        Item Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formErrors.general && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <span className="text-red-800">{formErrors.general}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SKU */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    SKU *
                                </label>
                                <Input
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    placeholder="Enter SKU"
                                    className={formErrors.sku ? 'border-red-500' : ''}
                                />
                                {formErrors.sku && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Name *
                                </label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter item name"
                                    className={formErrors.name ? 'border-red-500' : ''}
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Manufacturer */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Manufacturer
                                </label>
                                <Input
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleInputChange}
                                    placeholder="Enter manufacturer"
                                />
                            </div>

                            {/* Unit Cost */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Unit Cost * ($)
                                </label>
                                <Input
                                    name="unit_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.unit_cost}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className={formErrors.unit_cost ? 'border-red-500' : ''}
                                />
                                {formErrors.unit_cost && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.unit_cost}</p>
                                )}
                            </div>

                            {/* Main Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Main Category *
                                </label>
                                <select
                                    value={selectedMainCategory}
                                    onChange={handleMainCategoryChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                                >
                                    <option value="">Select main category</option>
                                    {Object.keys(mainCategories).map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Subcategory *
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    disabled={!selectedMainCategory}
                                    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                                        !selectedMainCategory ? 'bg-slate-100 cursor-not-allowed' : ''
                                    } ${formErrors.category_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select subcategory</option>
                                    {availableSubcategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.subcategory}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.category_id && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>
                                )}
                            </div>

                            {/* Minimum Stock */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Minimum Stock *
                                </label>
                                <Input
                                    name="minimum_stock"
                                    type="number"
                                    min="1"
                                    value={formData.minimum_stock}
                                    onChange={handleInputChange}
                                    placeholder="Enter minimum stock level"
                                    className={formErrors.minimum_stock ? 'border-red-500' : ''}
                                />
                                {formErrors.minimum_stock && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.minimum_stock}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                                >
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Enter item description"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Item Image
                            </label>
                            
                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#FF385C] transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                        <p className="text-slate-600 font-medium mb-2">Click to upload an image</p>
                                        <p className="text-slate-500 text-sm">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full max-w-xs rounded-lg border border-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            
                            {formErrors.image && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-8 py-3 font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Adding Item...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddItemForm;