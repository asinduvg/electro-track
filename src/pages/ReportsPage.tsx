import React, {useState, useEffect} from 'react';
import {
    BarChart as BarChartIcon, PieChart as PieChartIcon,
    LineChart as LineChartIcon, Download, Filter, ClipboardList,
    Package, ArrowRightLeft, Trash2, ShoppingCart, Search
} from 'lucide-react';
import {format, subDays, startOfDay, endOfDay} from 'date-fns';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Badge} from '../components/ui/Badge';
import {Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell} from '../components/ui/Table';
import {getItems, getTransactions} from '../lib/api';
import type {Database} from '../lib/database.types';

type Item = Database['public']['Tables']['items']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'logs'>('analytics');
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Transaction logs filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [itemsData, transactionsData] = await Promise.all([
                getItems(),
                getTransactions()
            ]);
            setItems(itemsData);
            setTransactions(transactionsData);
        } catch (err) {
            console.error('Error loading report data:', err);
            setError('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate inventory value by category
    const inventoryByCategory = items.reduce((acc, item) => {
        const category = item.category;
        const value = item.quantity * item.unit_cost;
        acc[category] = (acc[category] || 0) + value;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(inventoryByCategory).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
    }));

    // Calculate daily transaction counts
    const startDate = startOfDay(new Date(dateRange.start));
    const endDate = endOfDay(new Date(dateRange.end));

    const transactionsByDate = transactions
        .filter(t => {
            const date = new Date(t.performed_at || '');
            return date >= startDate && date <= endDate;
        })
        .reduce((acc, transaction) => {
            const date = format(new Date(transaction.performed_at || ''), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const transactionData = Object.entries(transactionsByDate)
        .map(([date, count]) => ({
            date: format(new Date(date), 'MMM dd'),
            count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate transaction types distribution
    const transactionTypes = transactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const transactionTypeData = Object.entries(transactionTypes).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count
    }));

    // Filter and sort transactions for logs
    const filteredTransactions = transactions
        .filter(transaction => {
            const matchesSearch = searchTerm.toLowerCase().split(' ').every(term =>
                transaction.type.toLowerCase().includes(term) ||
                transaction.project_id?.toLowerCase().includes(term) ||
                transaction.purpose?.toLowerCase().includes(term) ||
                transaction.notes?.toLowerCase().includes(term)
            );

            const matchesType = !typeFilter || transaction.type === typeFilter;

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const dateA = new Date(a.performed_at || '').getTime();
            const dateB = new Date(b.performed_at || '').getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'receive':
                return <Package className="h-5 w-5 text-green-500"/>;
            case 'transfer':
                return <ArrowRightLeft className="h-5 w-5 text-blue-500"/>;
            case 'dispose':
                return <Trash2 className="h-5 w-5 text-red-500"/>;
            case 'withdraw':
                return <ShoppingCart className="h-5 w-5 text-orange-500"/>;
            default:
                return <Package className="h-5 w-5 text-gray-500"/>;
        }
    };

    const getTransactionBadgeColor = (type: string): 'success' | 'primary' | 'danger' | 'warning' => {
        switch (type) {
            case 'receive':
                return 'success';
            case 'transfer':
                return 'primary';
            case 'dispose':
                return 'danger';
            case 'withdraw':
                return 'warning';
            default:
                return 'primary';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button
                    variant="primary"
                    className="mt-4"
                    onClick={loadData}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <div className="flex space-x-2">
                    <Button
                        variant={activeTab === 'analytics' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('analytics')}
                        leftIcon={<BarChartIcon size={16}/>}
                    >
                        Analytics
                    </Button>
                    <Button
                        variant={activeTab === 'logs' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('logs')}
                        leftIcon={<ClipboardList size={16}/>}
                    >
                        Transaction Logs
                    </Button>
                    <Button
                        variant="outline"
                        leftIcon={<Download size={16}/>}
                    >
                        Export Data
                    </Button>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-200 font-medium">Total Items</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-700 p-3 rounded-full">
                                        <BarChartIcon size={24}/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-700 to-green-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-200 font-medium">Total Value</p>
                                        <p className="text-3xl font-bold mt-1">
                                            ${items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-green-600 p-3 rounded-full">
                                        <LineChartIcon size={24}/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-800 to-purple-700 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 font-medium">Categories</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {Object.keys(inventoryByCategory).length}
                                        </p>
                                    </div>
                                    <div className="bg-purple-700 p-3 rounded-full">
                                        <PieChartIcon size={24}/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-600 to-orange-500 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-200 font-medium">Transactions</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {transactions.length}
                                        </p>
                                    </div>
                                    <div className="bg-orange-500 p-3 rounded-full">
                                        <BarChartIcon size={24}/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Inventory Value by Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Value by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData}>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                            />
                                            <Legend/>
                                            <Bar dataKey="value" fill="#3B82F6" name="Value ($)"/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={transactionTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({name, percent}) =>
                                                    `${name} ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {transactionTypeData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Activity */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>Transaction Activity</CardTitle>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                        />
                                        <span>to</span>
                                        <Input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<Filter size={16}/>}
                                    >
                                        Filter
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={transactionData}>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="date"/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Legend/>
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3B82F6"
                                                name="Transactions"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                /* Transaction Logs Tab */
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        leftAddon={<Search className="h-5 w-5"/>}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="receive">Receive</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="dispose">Dispose</option>
                                        <option value="withdraw">Withdraw</option>
                                    </select>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                    >
                                        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                                    </Button>
                                </div>
                            </div>

                            {/* Transactions Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Date & Time</TableHeaderCell>
                                            <TableHeaderCell>Type</TableHeaderCell>
                                            <TableHeaderCell>Item</TableHeaderCell>
                                            <TableHeaderCell>Quantity</TableHeaderCell>
                                            <TableHeaderCell>Project ID</TableHeaderCell>
                                            <TableHeaderCell>Purpose</TableHeaderCell>
                                            <TableHeaderCell>Notes</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTransactions.map((transaction) => {
                                            const item = items.find(i => i.id === transaction.item_id);
                                            return (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>
                                                        {format(new Date(transaction.performed_at), 'MMM dd, yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {getTransactionIcon(transaction.type)}
                                                            <Badge
                                                                variant={getTransactionBadgeColor(transaction.type)}
                                                                className="capitalize"
                                                            >
                                                                {transaction.type}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{item?.name}</p>
                                                            <p className="text-sm text-gray-500">SKU: {item?.sku}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {transaction.quantity}
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.project_id || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {transaction.purpose || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="max-w-xs truncate">
                                                            {transaction.notes || '-'}
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ReportsPage;