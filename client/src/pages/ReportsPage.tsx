import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { BarChart3, Download, TrendingUp, Package, DollarSign, Clock, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useTransactions from '../hooks/useTransactions';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useStocks from '../hooks/useStocks';

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { transactions } = useTransactions();
    const { items, getTotalQuantity } = useItems();
    const { locations } = useLocations();
    const { stocks } = useStocks();

    // Calculate analytics
    const totalItems = items.length;
    const lowStockItems = items.filter(item => {
        const totalStock = getTotalQuantity(item.id, stocks);
        return totalStock <= (item.minimum_stock || 0);
    }).length;
    const totalValue = items.reduce((sum, item) => {
        const totalStock = getTotalQuantity(item.id, stocks);
        return sum + (totalStock * Number(item.unit_cost || 0));
    }, 0);
    const recentTransactions = transactions.slice(0, 20); // Latest 20 transactions

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'receive':
                return <ArrowDownRight className="h-4 w-4 text-green-600" />;
            case 'withdraw':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            case 'transfer':
                return <RefreshCw className="h-4 w-4 text-blue-600" />;
            case 'adjust':
                return <Package className="h-4 w-4 text-purple-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getTransactionBadge = (type: string) => {
        switch (type) {
            case 'receive':
                return <Badge variant="success">Receive</Badge>;
            case 'withdraw':
                return <Badge variant="danger">Withdraw</Badge>;
            case 'transfer':
                return <Badge variant="info">Transfer</Badge>;
            case 'adjust':
                return <Badge variant="warning">Adjust</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <Button className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2 h-5 w-5 text-blue-500" />
                            Inventory Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Comprehensive overview of all inventory items, stock levels, and valuation.
                        </p>
                        <Button variant="outline" className="w-full">
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                            Stock Movement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Track item movements, transactions, and inventory turnover rates.
                        </p>
                        <Button variant="outline" className="w-full">
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-yellow-500" />
                            Financial Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Financial analysis including total value, costs, and budget tracking.
                        </p>
                        <Button variant="outline" className="w-full">
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Quick Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
                            <p className="text-gray-600">Total Items</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-600">{lowStockItems}</p>
                            <p className="text-gray-600">Low Stock</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
                            <p className="text-gray-600">Total Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-indigo-600">{transactions.length}</p>
                            <p className="text-gray-600">Total Transactions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions for Admin */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'inventory_manager') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Type</TableHeaderCell>
                                    <TableHeaderCell>Item</TableHeaderCell>
                                    <TableHeaderCell>Quantity</TableHeaderCell>
                                    <TableHeaderCell>Location</TableHeaderCell>
                                    <TableHeaderCell>Date</TableHeaderCell>
                                    <TableHeaderCell>Performed By</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentTransactions.map((transaction) => {
                                    const item = items.find(i => i.id === transaction.item_id);
                                    const fromLocation = locations.find(loc => loc.id === transaction.from_location_id);
                                    const toLocation = locations.find(loc => loc.id === transaction.to_location_id);
                                    
                                    return (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getTransactionIcon(transaction.type)}
                                                    {getTransactionBadge(transaction.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                                                    <div className="text-sm text-gray-500">{item?.sku}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{transaction.quantity}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {transaction.type === 'transfer' 
                                                        ? `${fromLocation?.unit || 'Unknown'} → ${toLocation?.unit || 'Unknown'}`
                                                        : transaction.type === 'receive' 
                                                        ? toLocation?.unit || 'Unknown'
                                                        : fromLocation?.unit || 'Unknown'
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(transaction.performed_at || '').toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{transaction.performed_by}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        
                        {recentTransactions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p>No recent transactions found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ReportsPage;