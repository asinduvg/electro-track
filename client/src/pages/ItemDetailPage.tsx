import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, ArrowLeft, Package, MapPin, DollarSign, Warehouse, Clock, TrendingUp, TrendingDown, RefreshCw, Save, X, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableRow } from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';
import useItems from "../hooks/useItems";
import useLocations from "../hooks/useLocations";
import useStocks from "../hooks/useStocks";
import useCategories from "../hooks/useCategories";
import useTransactions from "../hooks/useTransactions";
import { FormSkeleton } from "../components/ui/InventorySkeletons";

const ItemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedItem, setEditedItem] = useState<any>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { items, getTotalQuantity, updateItem, isLoading: itemsLoading } = useItems();
    const { locations, isLoading: locationsLoading } = useLocations();
    const { stocks, isLoading: stocksLoading } = useStocks();
    const { categories, isLoading: categoriesLoading } = useCategories();
    const { transactions, isLoading: transactionsLoading } = useTransactions();

    const item = items.find(item => item.id === id);
    const category = categories.find((cat: any) => cat.id === item?.category_id);
    const itemStocks = stocks.filter(stock => stock.item_id === id);
    const itemTransactions = transactions.filter(txn => txn.item_id === id).slice(0, 10);

    useEffect(() => {
        if (!id) {
            setError('Item ID is required');
            setIsLoading(false);
            return;
        }

        if (items.length > 0) {
            if (!item) {
                setError('Item not found');
            } else {
                setEditedItem({ ...item });
            }
            setIsLoading(false);
        }
    }, [id, items, item]);

    const handleInputChange = (field: string, value: any) => {
        setEditedItem((prev: any) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            
            // Convert to base64 for preview and storage
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setEditedItem((prev: any) => ({
                    ...prev,
                    image_url: imageUrl
                }));
                setHasChanges(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!item || !hasChanges) return;
        
        setIsSaving(true);
        try {
            await updateItem(item.id, editedItem);
            setIsEditing(false);
            setHasChanges(false);
        } catch (error) {
            console.error('Error updating item:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedItem({ ...item });
        setIsEditing(false);
        setHasChanges(false);
    };

    const dataLoading = itemsLoading || locationsLoading || stocksLoading || categoriesLoading || transactionsLoading || isLoading;

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton />
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {error || 'Item not found'}
                </h2>
                <Link to="/inventory">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_stock':
                return <Badge variant="success">In Stock</Badge>;
            case 'low_stock':
                return <Badge variant="warning">Low Stock</Badge>;
            case 'out_of_stock':
                return <Badge variant="danger">Out of Stock</Badge>;
            case 'discontinued':
                return <Badge variant="secondary">Discontinued</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) : string => {
        switch (status) {
            case 'in_stock':
                return "text-success";
            case 'low_stock':
                return "text-warning";
            case 'out_of_stock':
                return "text-danger";
            default:
                return "text-info";
        }
    }

    // Calculate what the automatic status should be based on stock levels
    const getAutomaticStatus = (itemId: string, minimumStock: number) => {
        const totalStock = getTotalQuantity(itemId, stocks);
        if (totalStock === 0) return 'out_of_stock';
        if (totalStock <= minimumStock) return 'low_stock';
        return 'in_stock';
    };

    // Get valid status options based on current stock levels
    const getValidStatusOptions = (itemId: string, minimumStock: number | null, currentStatus: string) => {
        const automaticStatus = getAutomaticStatus(itemId, minimumStock || 0);
        
        // If current status is discontinued, only allow discontinued or the correct automatic status
        if (currentStatus === 'discontinued') {
            return [
                { value: 'discontinued', label: 'Discontinued', disabled: false },
                { value: automaticStatus, label: getStatusLabel(automaticStatus), disabled: false }
            ];
        }
        
        // For non-discontinued items, only allow discontinued or show automatic status (disabled)
        return [
            { value: automaticStatus, label: `${getStatusLabel(automaticStatus)} (Automatic)`, disabled: true },
            { value: 'discontinued', label: 'Discontinued', disabled: false }
        ];
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'in_stock': return 'In Stock';
            case 'low_stock': return 'Low Stock';
            case 'out_of_stock': return 'Out of Stock';
            case 'discontinued': return 'Discontinued';
            default: return status;
        }
    };

    const totalQuantity = getTotalQuantity(item.id, stocks);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <Link to="/inventory">
                            <Button 
                                variant="outline" 
                                className="flex items-center bg-white border-slate-200 hover:bg-slate-50"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inventory
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
                            <p className="text-slate-500 font-medium">SKU: {item.sku}</p>
                        </div>
                    </div>
                    {currentUser && (currentUser.role === 'admin' || currentUser.role === 'inventory_manager') && (
                        <div className="flex items-center space-x-3">
                            {isEditing ? (
                                <>
                                    <Button 
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="flex items-center bg-white border-slate-200 hover:bg-slate-50"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        disabled={!hasChanges || isSaving}
                                        className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6 py-3 font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSaving ? 'Saving...' : 'Save Item'}
                                    </Button>
                                </>
                            ) : (
                                <Button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6 py-3 font-medium transition-colors shadow-lg hover:shadow-xl"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Item
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Item Image and Basic Info */}
                        <Card className="bg-white border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Item Image */}
                                    <div className="space-y-4">
                                        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                                            {(editedItem.image_url || item.image_url) ? (
                                                <img
                                                    src={editedItem.image_url || item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-300">
                                                    <div className="text-center">
                                                        <Package className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                                                        <p className="text-slate-500 font-medium">No image available</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                                        <Camera className="inline-block mr-2 h-4 w-4" />
                                                        Change Image
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Item Information</h3>
                                            <div className="space-y-4">
                                                {/* Name Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Name
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedItem.name || ''}
                                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">{item.name}</p>
                                                    )}
                                                </div>

                                                {/* SKU Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        SKU
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedItem.sku || ''}
                                                            onChange={(e) => handleInputChange('sku', e.target.value)}
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">{item.sku}</p>
                                                    )}
                                                </div>

                                                {/* Status Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Status
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <select
                                                                value={editedItem.status || ''}
                                                                onChange={(e) => handleInputChange('status', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                                            >
                                                                {getValidStatusOptions(item.id, item.minimum_stock, editedItem.status || item.status).map((option) => (
                                                                    <option
                                                                        key={option.value}
                                                                        value={option.value}
                                                                        disabled={option.disabled}
                                                                        className={option.disabled ? 'text-slate-400' : ''}
                                                                    >
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <p className="text-xs text-slate-500">
                                                                Stock status (In Stock, Low Stock, Out of Stock) updates automatically based on inventory levels. 
                                                                Only "Discontinued" can be set manually.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div>{getStatusBadge(item.status)}</div>
                                                    )}
                                                </div>

                                                {/* Category Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Category
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <select
                                                            value={editedItem.category_id || ''}
                                                            onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map((cat: any) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.category} - {cat.subcategory}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">
                                                            {category ? `${category.category} - ${category.subcategory}` : 'Uncategorized'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Manufacturer Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Manufacturer
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedItem.manufacturer || ''}
                                                            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">{item.manufacturer}</p>
                                                    )}
                                                </div>

                                                {/* Unit Cost Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Unit Cost
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editedItem.unit_cost || ''}
                                                            onChange={(e) => handleInputChange('unit_cost', Math.max(0, parseFloat(e.target.value) || 0))}
                                                            className="w-full"
                                                            placeholder="0.00"
                                                        />
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">${item.unit_cost || '0.00'}</p>
                                                    )}
                                                </div>

                                                {/* Minimum Stock Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Minimum Stock
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={editedItem.minimum_stock || ''}
                                                            onChange={(e) => handleInputChange('minimum_stock', Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="w-full"
                                                            placeholder="0"
                                                        />
                                                    ) : (
                                                        <p className="text-slate-900 font-medium">{item.minimum_stock || 0}</p>
                                                    )}
                                                </div>

                                                {/* Description Field */}
                                                <div>
                                                    <label className="flex items-center text-sm font-medium text-slate-600 mb-1">
                                                        Description
                                                        {isEditing && <Edit className="ml-2 h-3 w-3 text-slate-400" />}
                                                    </label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={editedItem.description || ''}
                                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] min-h-[80px]"
                                                            placeholder="Item description..."
                                                        />
                                                    ) : (
                                                        <p className="text-slate-700">{item.description || 'No description available'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Locations */}
                        <Card className="bg-white border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-900">
                                    <MapPin className="mr-3 h-5 w-5 text-blue-600" />
                                    Stock Locations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {itemStocks.length > 0 ? (
                                    <div className="space-y-3">
                                        {itemStocks.map((stock) => {
                                            const location = locations.find(loc => loc.id === stock.location_id);
                                            return (
                                                <div key={stock.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Warehouse className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{location?.unit || 'Unknown Location'}</p>
                                                            <p className="text-sm text-slate-500">{location?.building || location?.room || 'Storage location'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-bold text-slate-900">{stock.quantity}</span>
                                                        <p className="text-xs text-slate-500">units</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Warehouse className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                        <p className="text-slate-500">No stock locations found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stock Summary */}
                        <Card className="bg-white border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-900">
                                    <Package className={`mr-3 h-5 w-5 text-slate-600`} />
                                    Stock Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${getStatusColor(item.status)}`}>{totalQuantity}</div>
                                    <div className="text-sm text-slate-500">Total Stock</div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">Unit Cost</span>
                                        <span className="font-medium">${Number(item.unit_cost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-slate-500">Total Value</span>
                                        <span className="font-medium">${(totalQuantity * Number(item.unit_cost)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-slate-500">Minimum Stock</span>
                                        <span className="font-medium">{item.minimum_stock}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <div className="text-center">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;