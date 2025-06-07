import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Package, ArrowLeft, Upload, X } from 'lucide-react';
import useItems from '../hooks/useItems';
import useCategories from '../hooks/useCategories';
import useLocations from '../hooks/useLocations';

const AddItemPage: React.FC = () => {
    const navigate = useNavigate();
    const { addItem } = useItems();
    const { categories } = useCategories();
    const { locations } = useLocations();
    
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
    
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length > 0) {
            setImages(prev => [...prev, ...validFiles]);
            
            // Create preview URLs
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImagePreviews(prev => [...prev, event.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Compress image to reasonable size
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
                
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedDataUrl);
            };
            
            img.onerror = reject;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Convert images to base64 for storage
            const imageDataUrls = await Promise.all(
                images.map(file => convertImageToBase64(file))
            );

            const itemData = {
                ...formData,
                category_id: parseInt(formData.category_id),
                unit_cost: formData.unit_cost,
                minimum_stock: parseInt(formData.minimum_stock),
                image_url: imageDataUrls[0] || null // Store first image as primary
            };

            const newItem = await addItem(itemData);
            
            if (newItem) {
                navigate('/inventory/items');
            }
        } catch (error) {
            console.error('Error creating item:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/inventory/items');
                            }}
                            className="flex items-center bg-white border-slate-200 hover:bg-slate-50"
                            type="button"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Add New Item</h1>
                            <p className="text-slate-500 font-medium">Create a new inventory component</p>
                        </div>
                    </div>
                </div>

                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-900">
                            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-xl mr-3">
                                <Package className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Item Details</h3>
                                <p className="text-sm text-slate-500 font-normal">Enter the component information below</p>
                            </div>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Category
                                    </label>
                                    <select 
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category: any) => (
                                            <option key={category.id} value={category.id}>
                                                {category.category} - {category.subcategory}
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
                            
                            {/* Image Upload Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Item Images
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center relative bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <div className="text-sm text-slate-600 mb-4">
                                        <label className="font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors">
                                            Click to upload
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="sr-only"
                                            />
                                        </label> or drag and drop
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB each</p>
                                </div>
                                
                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Item'}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/inventory/items');
                                    }}
                                    className="bg-white border-slate-200 hover:bg-slate-50 px-8 py-3 rounded-xl font-medium transition-colors"
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

export default AddItemPage;