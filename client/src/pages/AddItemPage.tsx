import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Package, ArrowLeft, Upload, X } from 'lucide-react';
import useItems from '../hooks/useItems';
import useCategories from '../hooks/useCategories';
import { FormSkeleton } from '../components/ui/InventorySkeletons';
import useLocations from '../hooks/useLocations';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
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
    status: 'in_stock',
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormData((prev) => ({
      ...prev,
      category_id: '',
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);

      // Create preview URLs
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviews((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
      const imageDataUrls = await Promise.all(images.map((file) => convertImageToBase64(file)));

      const itemData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        unit_cost: formData.unit_cost,
        minimum_stock: Math.max(1, parseInt(formData.minimum_stock) || 1),
        image_url: imageDataUrls[0] || null, // Store first image as primary
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
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/inventory/items');
              }}
              className="inventory-back-button flex items-center border-slate-200 bg-white hover:bg-slate-50"
              type="button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add New Item</h1>
              <p className="font-medium text-slate-500">Create a new inventory component</p>
            </div>
          </div>
        </div>

        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Item Details</h3>
                <p className="text-sm font-normal text-slate-500">
                  Enter the component information below
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Main Category
                  </label>
                  <select
                    value={selectedMainCategory}
                    onChange={handleMainCategoryChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Subcategory
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Unit Cost ($)
                  </label>
                  <Input
                    name="unit_cost"
                    value={formData.unit_cost}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Minimum Stock
                  </label>
                  <Input
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    placeholder="0"
                    required
                    className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-slate-700">Item Images</label>
                <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:bg-slate-100">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <div className="mb-4 text-sm text-slate-600">
                    <label className="cursor-pointer font-medium text-[#FF385C] transition-colors hover:text-[#E31C5F]">
                      Click to upload
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB each</p>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF385C] px-8 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
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
                  className="border-slate-200 bg-white px-8 py-3 font-medium transition-colors hover:bg-slate-50"
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
