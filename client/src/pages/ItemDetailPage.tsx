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
    const category = categories.find(cat => cat.id === item?.category_id);
    const itemStocks = stocks.filter(stock => stock.item_id === id);
    const itemTransactions = transactions.filter(txn => txn.item_id === id).slice(0, 10); // Latest 10 transactions

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
                <h2 className="text-2xl font-semibold text-red-700">Item Not Found</h2>
                <p className="mt-2 text-gray-500">The item you are looking for does not exist or has been removed.</p>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/inventory/items">
                        <Button variant="outline" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
                        <p className="text-gray-500">SKU: {item.sku}</p>
                    </div>
                </div>
                {currentUser && (currentUser.role === 'admin' || currentUser.role === 'inventory_manager') && (
                    <Link to={`/inventory/edit/${item.id}`}>
                        <Button className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Item Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Item Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Name</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">SKU</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Description</TableCell>
                                        <TableCell>{item.description || 'No description available'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Category</TableCell>
                                        <TableCell>
                                            {category ? `${category.category} - ${category.subcategory}` : 'No category assigned'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Unit Cost</TableCell>
                                        <TableCell>${Number(item.unit_cost).toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Minimum Stock</TableCell>
                                        <TableCell>{item.minimum_stock}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Status</TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Stock Locations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                Stock Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemStocks.length > 0 ? (
                                <div className="space-y-4">
                                    {itemStocks.map((stock) => {
                                        const location = locations.find(loc => loc.id === stock.location_id);
                                        return (
                                            <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Warehouse className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium">{location?.unit || 'Unknown Location'}</div>
                                                        <div className="text-sm text-gray-500">{location?.building} {location?.room}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-lg">{stock.quantity}</div>
                                                    <div className="text-sm text-gray-500">units</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p>No stock locations found for this item</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                Recent Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemTransactions.length > 0 ? (
                                <div className="space-y-3">
                                    {itemTransactions.map((transaction) => {
                                        const fromLocation = locations.find(loc => loc.id === transaction.from_location_id);
                                        const toLocation = locations.find(loc => loc.id === transaction.to_location_id);
                                        
                                        const getTransactionIcon = (type: string) => {
                                            switch (type) {
                                                case 'receive':
                                                    return <TrendingUp className="h-4 w-4 text-green-600" />;
                                                case 'withdraw':
                                                    return <TrendingDown className="h-4 w-4 text-red-600" />;
                                                case 'transfer':
                                                    return <RefreshCw className="h-4 w-4 text-blue-600" />;
                                                case 'adjust':
                                                    return <Package className="h-4 w-4 text-purple-600" />;
                                                default:
                                                    return <Clock className="h-4 w-4 text-gray-400" />;
                                            }
                                        };

                                        const getTransactionColor = (type: string) => {
                                            switch (type) {
                                                case 'receive':
                                                    return 'text-green-600 bg-green-50';
                                                case 'withdraw':
                                                    return 'text-red-600 bg-red-50';
                                                case 'transfer':
                                                    return 'text-blue-600 bg-blue-50';
                                                case 'adjust':
                                                    return 'text-purple-600 bg-purple-50';
                                                default:
                                                    return 'text-gray-600 bg-gray-50';
                                            }
                                        };

                                        return (
                                            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                                                        {getTransactionIcon(transaction.type)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium capitalize">{transaction.type}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {transaction.type === 'transfer' 
                                                                ? `${fromLocation?.unit || 'Unknown'} → ${toLocation?.unit || 'Unknown'}`
                                                                : transaction.type === 'receive' 
                                                                ? `To: ${toLocation?.unit || 'Unknown'}`
                                                                : `From: ${fromLocation?.unit || 'Unknown'}`
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(transaction.performed_at || '').toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{transaction.quantity}</div>
                                                    <div className="text-sm text-gray-500">units</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p>No recent transactions for this item</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="mr-2 h-5 w-5" />
                                Quick Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{totalQuantity}</div>
                                <div className="text-sm text-gray-500">Total Stock</div>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Unit Cost</span>
                                    <span className="font-medium">${Number(item.unit_cost).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Total Value</span>
                                    <span className="font-medium">${(totalQuantity * Number(item.unit_cost)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Minimum Stock</span>
                                    <span className="font-medium">{item.minimum_stock}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="text-center">
                                    {getStatusBadge(item.status)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;