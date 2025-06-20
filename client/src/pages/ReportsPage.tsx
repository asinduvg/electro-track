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
import useCategories from '../hooks/useCategories';
import { AnalyticsChartSkeleton, DashboardStatsSkeleton } from '../components/ui/InventorySkeletons';

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { transactions, isLoading: transactionsLoading } = useTransactions();
    const { items, getTotalQuantity, isLoading: itemsLoading } = useItems();
    const { locations, isLoading: locationsLoading } = useLocations();
    const { stocks, isLoading: stocksLoading } = useStocks();
    const { categories, isLoading: categoriesLoading } = useCategories();

    const isLoading = transactionsLoading || itemsLoading || locationsLoading || stocksLoading || categoriesLoading;

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

    const generateInventoryReport = () => {
        const reportData = {
            timestamp: new Date().toLocaleString(),
            totalItems: items.length,
            totalValue: totalValue,
            lowStockItems: lowStockItems,
            categories: Array.from(new Set(items.map(item => {
                const category = categories.find((cat: any) => cat.id === item.category_id);
                return category ? `${category.category} - ${category.subcategory}` : 'Uncategorized';
            }))),
            itemDetails: items.map(item => {
                const category = categories.find((cat: any) => cat.id === item.category_id);
                const totalStock = getTotalQuantity(item.id, stocks);
                return {
                    sku: item.sku,
                    name: item.name,
                    category: category ? `${category.category} - ${category.subcategory}` : 'Uncategorized',
                    stock: totalStock,
                    unitCost: item.unit_cost,
                    totalValue: totalStock * Number(item.unit_cost || 0),
                    status: item.status,
                    minimumStock: item.minimum_stock || 0
                };
            })
        };
        
        downloadCSVReport(reportData, 'inventory_report');
    };

    const generateStockMovementReport = () => {
        const reportData = {
            timestamp: new Date().toLocaleString(),
            totalTransactions: transactions.length,
            transactionDetails: transactions.map(transaction => {
                const item = items.find(i => i.id === transaction.item_id);
                const fromLocation = locations.find(loc => loc.id === transaction.from_location_id);
                const toLocation = locations.find(loc => loc.id === transaction.to_location_id);
                
                return {
                    date: transaction.performed_at || '',
                    type: transaction.type,
                    item: item?.name || 'Unknown',
                    sku: item?.sku || '',
                    quantity: transaction.quantity,
                    fromLocation: fromLocation?.unit || '',
                    toLocation: toLocation?.unit || '',
                    performedBy: transaction.performed_by,
                    notes: transaction.notes || ''
                };
            })
        };
        
        downloadCSVReport(reportData, 'stock_movement_report');
    };

    const generateFinancialReport = () => {
        const categoryValues = categories.map((category: any) => {
            const categoryItems = items.filter(item => item.category_id === category.id);
            const categoryValue = categoryItems.reduce((sum, item) => {
                const totalStock = getTotalQuantity(item.id, stocks);
                return sum + (totalStock * Number(item.unit_cost || 0));
            }, 0);
            
            return {
                category: `${category.category} - ${category.subcategory}`,
                itemCount: categoryItems.length,
                totalValue: categoryValue
            };
        });

        const reportData = {
            timestamp: new Date().toLocaleString(),
            totalInventoryValue: totalValue,
            totalItems: items.length,
            averageItemValue: totalValue / items.length || 0,
            categoryBreakdown: categoryValues,
            topValueItems: items
                .map(item => ({
                    name: item.name,
                    sku: item.sku,
                    stock: getTotalQuantity(item.id, stocks),
                    unitCost: Number(item.unit_cost || 0),
                    totalValue: getTotalQuantity(item.id, stocks) * Number(item.unit_cost || 0)
                }))
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 10)
        };
        
        downloadCSVReport(reportData, 'financial_report');
    };

    const downloadCSVReport = (data: any, filename: string) => {
        let csvContent = '';
        
        if (filename === 'inventory_report') {
            csvContent = `Inventory Report - Generated: ${data.timestamp}\n\n`;
            csvContent += `Summary\n`;
            csvContent += `Total Items,${data.totalItems}\n`;
            csvContent += `Total Value,$${data.totalValue.toFixed(2)}\n`;
            csvContent += `Low Stock Items,${data.lowStockItems}\n\n`;
            
            csvContent += `Item Details\n`;
            csvContent += `SKU,Name,Category,Stock,Unit Cost,Total Value,Status,Minimum Stock\n`;
            data.itemDetails.forEach((item: any) => {
                csvContent += `${item.sku},"${item.name}","${item.category}",${item.stock},$${item.unitCost},$${item.totalValue.toFixed(2)},${item.status},${item.minimumStock}\n`;
            });
        } else if (filename === 'stock_movement_report') {
            csvContent = `Stock Movement Report - Generated: ${data.timestamp}\n\n`;
            csvContent += `Total Transactions,${data.totalTransactions}\n\n`;
            
            csvContent += `Transaction Details\n`;
            csvContent += `Date,Type,Item,SKU,Quantity,From Location,To Location,Performed By,Notes\n`;
            data.transactionDetails.forEach((txn: any) => {
                csvContent += `${txn.date},${txn.type},"${txn.item}",${txn.sku},${txn.quantity},"${txn.fromLocation}","${txn.toLocation}","${txn.performedBy}","${txn.notes}"\n`;
            });
        } else if (filename === 'financial_report') {
            csvContent = `Financial Report - Generated: ${data.timestamp}\n\n`;
            csvContent += `Summary\n`;
            csvContent += `Total Inventory Value,$${data.totalInventoryValue.toFixed(2)}\n`;
            csvContent += `Total Items,${data.totalItems}\n`;
            csvContent += `Average Item Value,$${data.averageItemValue.toFixed(2)}\n\n`;
            
            csvContent += `Category Breakdown\n`;
            csvContent += `Category,Item Count,Total Value\n`;
            data.categoryBreakdown.forEach((cat: any) => {
                csvContent += `"${cat.category}",${cat.itemCount},$${cat.totalValue.toFixed(2)}\n`;
            });
            
            csvContent += `\nTop Value Items\n`;
            csvContent += `Name,SKU,Stock,Unit Cost,Total Value\n`;
            data.topValueItems.forEach((item: any) => {
                csvContent += `"${item.name}",${item.sku},${item.stock},$${item.unitCost},$${item.totalValue.toFixed(2)}\n`;
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <Button className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                </div>
                <DashboardStatsSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnalyticsChartSkeleton />
                    <AnalyticsChartSkeleton />
                </div>
            </div>
        );
    }

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
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => generateInventoryReport()}
                        >
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
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => generateStockMovementReport()}
                        >
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
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => generateFinancialReport()}
                        >
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