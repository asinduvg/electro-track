import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {
    Package, AlertTriangle, DollarSign, ArrowUpRight,
    Clock, BarChart, TrendingUp, TrendingDown,
    Truck, BoxesIcon
} from 'lucide-react';
import {dashboardStats} from '../data/mockData';
import {UserRole, ItemStatus} from '../types';
import useItems from "../hooks/useItems.tsx";
import useTransactions from "../hooks/useTransactions.tsx";
import useStocks from "../hooks/useStocks.tsx";

const DashboardPage: React.FC = () => {
    const {currentUser} = useAuth();
    const {items, getTotalQuantity} = useItems();
    const {stocks} = useStocks();
    const {transactions, getItemDetailsForTransactions} = useTransactions();

    console.log('Dashboard page', currentUser)

    // Get low stock items
    const lowStockItems = items.filter(item => item.status === ItemStatus.LOW_STOCK);

    // Get recent transactions (last 5)
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())
        .slice(0, 5);

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Inventory Overview Card */}
                <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 font-medium">Total Inventory</p>
                                <p className="text-3xl font-bold mt-1">{dashboardStats.totalItems}</p>
                            </div>
                            <div className="bg-blue-700 p-3 rounded-full">
                                <Package size={24}/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp size={16} className="mr-1"/>
                            <span>6 categories, {items.length} unique items</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alert Card */}
                <Card className="bg-gradient-to-br from-yellow-600 to-yellow-500 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 font-medium">Low Stock Items</p>
                                <p className="text-3xl font-bold mt-1">{lowStockItems.length}</p>
                            </div>
                            <div className="bg-yellow-500 p-3 rounded-full">
                                <AlertTriangle size={24}/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            {lowStockItems.length > 0 ? (
                                <Link to="/inventory/items?filter=low_stock"
                                      className="flex items-center hover:underline">
                                    <ArrowUpRight size={16} className="mr-1"/>
                                    <span>View all low stock items</span>
                                </Link>
                            ) : (
                                <div className="flex items-center">
                                    <TrendingDown size={16} className="mr-1"/>
                                    <span>No items below threshold</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Total Value Card */}
                <Card className="bg-gradient-to-br from-green-700 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 font-medium">Total Value</p>
                                <p className="text-3xl font-bold mt-1">${dashboardStats.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-600 p-3 rounded-full">
                                <DollarSign size={24}/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <Link to="/reports" className="flex items-center hover:underline">
                                <BarChart size={16} className="mr-1"/>
                                <span>View financial reports</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="bg-gradient-to-br from-indigo-800 to-indigo-700 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-200 font-medium">Recent Activity</p>
                                <p className="text-3xl font-bold mt-1">{recentTransactions.length}</p>
                            </div>
                            <div className="bg-indigo-700 p-3 rounded-full">
                                <Clock size={24}/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <Link to="/reports?type=activity" className="flex items-center hover:underline">
                                <ArrowUpRight size={16} className="mr-1"/>
                                <span>View all activity</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle size={18} className="mr-2 text-yellow-500"/>
                            Low Stock Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.length > 0 ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>SKU</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Quantity</TableHeaderCell>
                                        <TableHeaderCell>Min. Stock</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lowStockItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.sku}</TableCell>
                                            <TableCell>
                                                <Link
                                                    to={`/inventory/view/${item.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {item.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell
                                                className="text-red-600 font-medium">{getTotalQuantity(item.id, stocks)}</TableCell>
                                            <TableCell>{item.minimum_stock}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BoxesIcon size={48} className="mx-auto mb-4 text-gray-300"/>
                                <p>No low stock items to display</p>
                                <p className="text-sm text-gray-400 mt-2">All items are above their minimum stock
                                    levels</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Truck size={18} className="mr-2 text-blue-500"/>
                            Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Date</TableHeaderCell>
                                    <TableHeaderCell>Type</TableHeaderCell>
                                    <TableHeaderCell>Item</TableHeaderCell>
                                    <TableHeaderCell>Quantity</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getItemDetailsForTransactions(recentTransactions, items).map((txnWithItem) => {
                                    let badgeVariant: 'primary' | 'success' | 'danger' | 'warning';

                                    switch (txnWithItem.type) {
                                        case 'receive':
                                            badgeVariant = 'success';
                                            break;
                                        case 'transfer':
                                            badgeVariant = 'primary';
                                            break;
                                        case 'dispose':
                                            badgeVariant = 'danger';
                                            break;
                                        default:
                                            badgeVariant = 'warning';
                                    }

                                    return (
                                        <TableRow key={txnWithItem.id}>
                                            <TableCell>
                                                {new Date(txnWithItem.performed_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badgeVariant} className="capitalize">
                                                    {txnWithItem.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {txnWithItem.item ? txnWithItem.item.name : 'Unknown Item'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {txnWithItem.type === 'receive' ? '+' : ''}
                                                {txnWithItem.quantity}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Role-specific content */}
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.INVENTORY_MANAGER) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link
                                to="/inventory/add"
                                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <div className="p-3 mr-3 bg-blue-800 text-white rounded-full">
                                    <Package size={20}/>
                                </div>
                                <div>
                                    <h3 className="font-medium">Add New Item</h3>
                                    <p className="text-sm text-gray-500">Create a new inventory item</p>
                                </div>
                            </Link>

                            <Link
                                to="/inventory/receive"
                                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <div className="p-3 mr-3 bg-green-600 text-white rounded-full">
                                    <Truck size={20}/>
                                </div>
                                <div>
                                    <h3 className="font-medium">Receive Inventory</h3>
                                    <p className="text-sm text-gray-500">Record new shipments</p>
                                </div>
                            </Link>

                            <Link
                                to="/reports"
                                className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                                <div className="p-3 mr-3 bg-indigo-700 text-white rounded-full">
                                    <BarChart size={20}/>
                                </div>
                                <div>
                                    <h3 className="font-medium">Generate Report</h3>
                                    <p className="text-sm text-gray-500">Analyze inventory data</p>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;