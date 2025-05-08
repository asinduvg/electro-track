import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {
    Edit, ArrowLeft, Package, ShoppingCart, Truck,
    Calendar, DollarSign, MapPin, Info, Clipboard, BarChart
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {Badge} from '../components/ui/Badge';
import {Button} from '../components/ui/Button';
import {Table, TableBody, TableCell, TableRow} from '../components/ui/Table';
import {useAuth} from '../context/AuthContext';
import {getItemById, getTransactions} from '../lib/api';
import type {Database} from '../lib/database.types';

type Item = Database['public']['Tables']['items']['Row'] & {
    locations: Array<{
        location: Database['public']['Tables']['locations']['Row'];
        quantity: number;
    }>;
};
type Transaction = Database['public']['Tables']['transactions']['Row'];

const ItemDetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const {currentUser} = useAuth();
    const [item, setItem] = useState<Item | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (!id) throw new Error('Item ID is required');

            const [itemData, transactionsData] = await Promise.all([
                getItemById(id),
                getTransactions()
            ]);

            setItem(itemData);
            // Filter transactions for this item
            setTransactions(transactionsData.filter(t => t.item_id === id));
        } catch (err) {
            console.error('Error loading item details:', err);
            setError('Failed to load item details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-700">Item Not Found</h2>
                <p className="mt-2 text-gray-500">The item you are looking for does not exist or has been removed.</p>
                <Link to="/inventory/items">
                    <Button variant="primary" className="mt-4">
                        Back to Inventory
                    </Button>
                </Link>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        let variant: 'success' | 'danger' | 'warning' | 'info' | 'primary';

        switch (status) {
            case 'in_stock':
                variant = 'success';
                break;
            case 'low_stock':
                variant = 'warning';
                break;
            case 'out_of_stock':
                variant = 'danger';
                break;
            case 'ordered':
                variant = 'info';
                break;
            default:
                variant = 'primary';
        }

        return (
            <Badge variant={variant} className="capitalize text-sm">
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center">
                    <Link to="/inventory/items" className="mr-4">
                        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16}/>}>
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{item.name}</h1>
                    {getStatusBadge(item.status)}
                </div>

                {(currentUser?.role === 'admin' || currentUser?.role === 'inventory_manager') && (
                    <div className="mt-4 sm:mt-0">
                        <Link to={`/inventory/edit/${item.id}`}>
                            <Button variant="primary" leftIcon={<Edit size={16}/>}>
                                Edit Item
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Info size={18} className="mr-2 text-blue-600"/>
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium w-1/3">SKU</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Name</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Description</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Category</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                    </TableRow>
                                    {item.subcategory && (
                                        <TableRow>
                                            <TableCell className="font-medium">Subcategory</TableCell>
                                            <TableCell>{item.subcategory}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Manufacturing Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package size={18} className="mr-2 text-blue-600"/>
                                Manufacturing Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium w-1/3">Manufacturer</TableCell>
                                        <TableCell>{item.manufacturer}</TableCell>
                                    </TableRow>
                                    {item.model && (
                                        <TableRow>
                                            <TableCell className="font-medium">Model</TableCell>
                                            <TableCell>{item.model}</TableCell>
                                        </TableRow>
                                    )}
                                    {item.serial_number && (
                                        <TableRow>
                                            <TableCell className="font-medium">Serial Number</TableCell>
                                            <TableCell>{item.serial_number}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Transaction History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clipboard size={18} className="mr-2 text-blue-600"/>
                                Transaction History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {transactions.map((transaction) => {
                                        let icon;
                                        let bgColor;
                                        let title;

                                        switch (transaction.type) {
                                            case 'receive':
                                                icon = <Truck className="h-5 w-5 text-green-500"/>;
                                                bgColor = 'bg-green-50';
                                                title = 'Received';
                                                break;
                                            case 'transfer':
                                                icon = <ArrowLeft className="h-5 w-5 text-blue-500"/>;
                                                bgColor = 'bg-blue-50';
                                                title = 'Transferred';
                                                break;
                                            case 'dispose':
                                                icon = <Truck className="h-5 w-5 text-red-500"/>;
                                                bgColor = 'bg-red-50';
                                                title = 'Disposed';
                                                break;
                                            case 'withdraw':
                                                icon = <ShoppingCart className="h-5 w-5 text-orange-500"/>;
                                                bgColor = 'bg-orange-50';
                                                title = 'Withdrawn';
                                                break;
                                            default:
                                                icon = <BarChart className="h-5 w-5 text-yellow-500"/>;
                                                bgColor = 'bg-yellow-50';
                                                title = 'Adjusted';
                                        }

                                        return (
                                            <div key={transaction.id} className={`p-4 rounded-lg ${bgColor}`}>
                                                <div className="flex items-start">
                                                    <div className="mr-3">{icon}</div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <p className="font-medium">{title}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(transaction.performed_at || '').toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm">
                                                            {transaction.type === 'receive' && 'Received '}
                                                            {transaction.type === 'transfer' && 'Transferred '}
                                                            {transaction.type === 'dispose' && 'Disposed of '}
                                                            {transaction.type === 'withdraw' && 'Withdrawn '}
                                                            {transaction.type === 'adjust' && 'Adjusted '}
                                                            <span className="font-medium">{transaction.quantity}</span>
                                                            {' units'}
                                                            {transaction.from_location_id && transaction.to_location_id && (
                                                                <span> from {transaction.from_location_id} to {transaction.to_location_id}</span>
                                                            )}
                                                            {!transaction.from_location_id && transaction.to_location_id && (
                                                                <span> to {transaction.to_location_id}</span>
                                                            )}
                                                            {transaction.from_location_id && !transaction.to_location_id && (
                                                                <span> from {transaction.from_location_id}</span>
                                                            )}
                                                        </p>
                                                        {transaction.project_id && (
                                                            <p className="mt-1 text-sm">
                                                                <span className="font-medium">Project: </span>
                                                                {transaction.project_id}
                                                            </p>
                                                        )}
                                                        {transaction.purpose && (
                                                            <p className="mt-1 text-sm">
                                                                <span className="font-medium">Purpose: </span>
                                                                {transaction.purpose}
                                                            </p>
                                                        )}
                                                        {transaction.notes && (
                                                            <p className="mt-1 text-xs text-gray-500">{transaction.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No transaction history available for this item.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Inventory Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ShoppingCart size={18} className="mr-2 text-blue-600"/>
                                Inventory Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Current Quantity</p>
                                    <p className={`text-2xl font-bold ${
                                        item.minimum_stock && item.quantity < item.minimum_stock
                                            ? 'text-red-600'
                                            : 'text-gray-900'
                                    }`}>
                                        {item.quantity}
                                    </p>
                                    {item.minimum_stock && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum stock: {item.minimum_stock}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Unit Cost</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${item.unit_cost.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Total value: ${(item.quantity * item.unit_cost).toFixed(2)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Locations</p>
                                    {item.locations && item.locations.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {item.locations.map((loc, index) => (
                                                <div key={index}
                                                     className="border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {loc.location.building}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        {loc.location.room} &gt; {loc.location.unit}
                                                    </p>
                                                    <p className="text-sm font-medium text-blue-600 mt-1">
                                                        Quantity: {loc.quantity}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-lg font-medium text-gray-900 mt-1">
                                            No Location Assigned
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates & Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar size={18} className="mr-2 text-blue-600"/>
                                Dates & Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Added On</TableCell>
                                        <TableCell>{new Date(item.created_at || '').toLocaleDateString()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Last Updated</TableCell>
                                        <TableCell>{new Date(item.updated_at || '').toLocaleDateString()}</TableCell>
                                    </TableRow>
                                    {item.purchase_date && (
                                        <TableRow>
                                            <TableCell className="font-medium">Purchase Date</TableCell>
                                            <TableCell>{new Date(item.purchase_date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    )}
                                    {item.warranty_expiration && (
                                        <TableRow>
                                            <TableCell className="font-medium">Warranty Until</TableCell>
                                            <TableCell>{new Date(item.warranty_expiration).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link to={`/inventory/receive?itemId=${item.id}`} className="block">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        leftIcon={<Truck size={16}/>}
                                    >
                                        Receive Stock
                                    </Button>
                                </Link>
                                <Link to={`/inventory/transfer?itemId=${item.id}`} className="block">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        leftIcon={<ArrowLeft size={16}/>}
                                    >
                                        Transfer Stock
                                    </Button>
                                </Link>
                                <Link to={`/inventory/withdraw?itemId=${item.id}`} className="block">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        leftIcon={<ShoppingCart size={16}/>}
                                    >
                                        Withdraw Stock
                                    </Button>
                                </Link>
                                <Link to={`/reports?itemId=${item.id}`} className="block">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        leftIcon={<BarChart size={16}/>}
                                    >
                                        View Reports
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;