import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, ArrowLeft, Package, MapPin, DollarSign, Warehouse, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableRow } from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';
import useItems from "../hooks/useItems";
import useLocations from "../hooks/useLocations";
import useStocks from "../hooks/useStocks";
import useCategories from "../hooks/useCategories";
import useTransactions from "../hooks/useTransactions";

const ItemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { items, getTotalQuantity } = useItems();
    const { locations } = useLocations();
    const { stocks } = useStocks();
    const { categories } = useCategories();
    const { transactions } = useTransactions();

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
            }
            setIsLoading(false);
        }
    }, [id, items, item]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {error || 'Item not found'}
                </h2>
                <Link to="/inventory/items">
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

    const totalQuantity = getTotalQuantity(item.id, stocks);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                        <Link to="/inventory/items">
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
                        <Link to={`/inventory/edit/${item.id}`}>
                            <Button className="flex items-center bg-slate-900 hover:bg-slate-800 text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Item
                            </Button>
                        </Link>
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
                                        {item.image_url ? (
                                            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-square rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Package className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                                                    <p className="text-slate-500 font-medium">No image available</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Item Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                                    <div>{getStatusBadge(item.status)}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                                                    <p className="text-slate-900 font-medium">
                                                        {category ? `${category.category} - ${category.subcategory}` : 'Uncategorized'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 mb-1">Manufacturer</label>
                                                    <p className="text-slate-900 font-medium">{item.manufacturer}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                                                    <p className="text-slate-700">{item.description || 'No description available'}</p>
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
                                    <Package className="mr-3 h-5 w-5 text-emerald-600" />
                                    Stock Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-emerald-600">{totalQuantity}</div>
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