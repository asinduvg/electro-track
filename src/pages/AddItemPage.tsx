import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, Plus } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { getCategoriesList, getSubcategoriesForCategory } from '../data/mockData';
import { ItemStatus } from '../types';
import { createItem, addItemLocation } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { getLocations } from '../lib/api';
import type { Database } from '../lib/database.types';

type Location = Database['public']['Tables']['locations']['Row'];

interface ItemLocation {
  locationId: string;
  quantity: number;
}

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const categories = getCategoriesList();
  const [locations, setLocations] = useState<Location[]>([]);
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
    unit_cost: 0,
    status: ItemStatus.IN_STOCK
  });

  const [itemLocations, setItemLocations] = useState<ItemLocation[]>([]);
  const [customFields, setCustomFields] = useState<Array<{ name: string; value: string }>>([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load storage locations');
    }
  };

  // Get subcategories based on selected category
  const subcategories = formData.category
      ? getSubcategoriesForCategory(formData.category)
      : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle numeric fields
    if (name === 'minimum_stock' || name === 'unit_cost') {
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

  const handleCustomFieldChange = (index: number, field: 'name' | 'value', value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index][field] = value;
    setCustomFields(updatedFields);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const addLocation = () => {
    setItemLocations([...itemLocations, { locationId: '', quantity: 0 }]);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = [...itemLocations];
    updatedLocations.splice(index, 1);
    setItemLocations(updatedLocations);
  };

  const handleLocationChange = (index: number, field: keyof ItemLocation, value: string | number) => {
    const updatedLocations = [...itemLocations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value
    };
    setItemLocations(updatedLocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in to add items');
      return;
    }

    if (itemLocations.length === 0) {
      setError('Please add at least one location and quantity');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Calculate total quantity from all locations
      const totalQuantity = itemLocations.reduce((sum, loc) => sum + loc.quantity, 0);

      // Create the item first
      const itemData = {
        ...formData,
        quantity: totalQuantity,
        created_by: currentUser.id
      };

      const newItem = await createItem(itemData);

      // Create item locations
      for (const location of itemLocations) {
        await addItemLocation({
          item_id: newItem.id,
          location_id: location.locationId,
          quantity: location.quantity
        });
      }

      navigate('/inventory/items');
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div>
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
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

              {/* Locations */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Storage Locations</CardTitle>
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={16} />}
                      onClick={addLocation}
                  >
                    Add Location
                  </Button>
                </CardHeader>
                <CardContent>
                  {itemLocations.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>No locations added yet.</p>
                        <p className="text-sm mt-1">
                          Click "Add Location" to specify where this item will be stored.
                        </p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {itemLocations.map((loc, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Location
                                </label>
                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={loc.locationId}
                                    onChange={(e) => handleLocationChange(index, 'locationId', e.target.value)}
                                    required
                                >
                                  <option value="">Select Location</option>
                                  {locations.map((location) => (
                                      <option key={location.id} value={location.id}>
                                        {location.building} &gt; {location.room} &gt; {location.unit}
                                      </option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={loc.quantity}
                                    onChange={(e) => handleLocationChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                    required
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<X size={16} />}
                                    onClick={() => removeLocation(index)}
                                />
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Custom Fields</CardTitle>
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={16} />}
                      onClick={addCustomField}
                  >
                    Add Field
                  </Button>
                </CardHeader>
                <CardContent>
                  {customFields.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>No custom fields added yet.</p>
                        <p className="text-sm mt-1">
                          Click "Add Field" to create custom properties for this item.
                        </p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                        {customFields.map((field, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Input
                                  placeholder="Field Name"
                                  value={field.name}
                                  onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                                  className="flex-1"
                              />
                              <Input
                                  placeholder="Value"
                                  value={field.value}
                                  onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                  className="flex-1"
                              />
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<X size={16} />}
                                  onClick={() => removeCustomField(index)}
                              />
                            </div>
                        ))}
                      </div>
                  )}
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
                        value={formData.minimum_stock.toString()}
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
                        value={formData.unit_cost.toString()}
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
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                    >
                      {Object.values(ItemStatus).map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Drag and drop files here, or click to select files
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Support for datasheets, images, and other documents
                      </p>
                    </div>
                    <div className="mt-3">
                      <Button
                          type="button"
                          variant="outline"
                          size="sm"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                leftIcon={<Save size={16} />}
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