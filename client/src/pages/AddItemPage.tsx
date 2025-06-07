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
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/inventory/items')}
                        className="flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            Item Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SKU
                                    </label>
                                    <Input 
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        placeholder="Enter SKU" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <Input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter item name" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manufacturer
                                    </label>
                                    <Input 
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleInputChange}
                                        placeholder="Enter manufacturer" 
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Enter item description"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select 
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Stock
                                    </label>
                                    <Input 
                                        name="minimum_stock"
                                        value={formData.minimum_stock}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0" 
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Image Upload Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Images
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <div className="text-sm text-gray-600 mb-4">
                                        <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                            Click to upload
                                        </span> or drag and drop
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
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
                            
                            <div className="flex space-x-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Item'}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => navigate('/inventory/items')}
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