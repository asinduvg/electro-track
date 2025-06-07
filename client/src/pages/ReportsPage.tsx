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
                            <p className="text-3xl font-bold text-blue-600">2,430</p>
                            <p className="text-gray-600">Total Items</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-600">1</p>
                            <p className="text-gray-600">Low Stock</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">$18,567</p>
                            <p className="text-gray-600">Total Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-indigo-600">5</p>
                            <p className="text-gray-600">Recent Transactions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;