import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/Card';
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {
    Package, AlertTriangle, DollarSign, ArrowUpRight,
    Clock, BarChart, TrendingUp, TrendingDown,
    Truck, BoxesIcon, Cpu, Zap, Microchip, Activity,
    Plus, PackageCheck, PackageMinus, ArrowRightLeft
} from 'lucide-react';
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
        .sort((a, b) => {
            const dateA = a.performed_at ? new Date(a.performed_at).getTime() : 0;
            const dateB = b.performed_at ? new Date(b.performed_at).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);

    const totalStocks = stocks.reduce((acc, stock) => acc + stock.quantity, 0);

    const generateQuickReport = () => {
        const reportData = items.map(item => {
            const totalStock = getTotalQuantity(item.id, stocks);
            return {
                sku: item.sku,
                name: item.name,
                stock: totalStock,
                unitCost: item.unit_cost,
                totalValue: totalStock * Number(item.unit_cost || 0),
                status: item.status,
                minimumStock: item.minimum_stock || 0
            };
        });

        let csvContent = `Inventory Quick Report - Generated: ${new Date().toLocaleString()}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Total Items,${items.length}\n`;
        csvContent += `Total Value,$${items.reduce((sum, item) => sum + (getTotalQuantity(item.id, stocks) * Number(item.unit_cost)), 0).toFixed(2)}\n`;
        csvContent += `Low Stock Items,${lowStockItems.length}\n\n`;
        
        csvContent += `Item Details\n`;
        csvContent += `SKU,Name,Stock,Unit Cost,Total Value,Status,Minimum Stock\n`;
        reportData.forEach((item: any) => {
            csvContent += `${item.sku},"${item.name}",${item.stock},$${item.unitCost},$${item.totalValue.toFixed(2)},${item.status},${item.minimumStock}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Authentication is now handled by routing
    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Component Overview</h1>
                    <p className="text-slate-600 mt-2">Monitor your electronic inventory at a glance</p>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-600">Live Data</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Components Card */}
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-0 shadow-xl shadow-slate-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 font-medium text-sm uppercase tracking-wide">Total Components</p>
                                <p className="text-3xl font-bold mt-2">{totalStocks.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-700/50 p-3 rounded-xl backdrop-blur-sm">
                                <Microchip className="h-6 w-6 text-sky-400"/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-400"/>
                            <span className="text-slate-300">{items.length} unique types</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Stock Alert Card */}
                <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-xl shadow-orange-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 font-medium text-sm uppercase tracking-wide">Critical Stock</p>
                                <p className="text-3xl font-bold mt-2">{lowStockItems.length}</p>
                            </div>
                            <div className="bg-orange-400/30 p-3 rounded-xl backdrop-blur-sm">
                                <AlertTriangle className="h-6 w-6 text-white"/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            {lowStockItems.length > 0 ? (
                                <Link to="/inventory/items?filter=low_stock"
                                      className="flex items-center hover:text-orange-100 transition-colors">
                                    <ArrowUpRight className="h-4 w-4 mr-2"/>
                                    <span>Requires attention</span>
                                </Link>
                            ) : (
                                <div className="flex items-center">
                                    <TrendingDown className="h-4 w-4 mr-2 text-green-300"/>
                                    <span className="text-orange-100">All levels optimal</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Portfolio Value Card */}
                <Card className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white border-0 shadow-xl shadow-green-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 font-medium text-sm uppercase tracking-wide">Portfolio Value</p>
                                <p className="text-3xl font-bold mt-2">${items.reduce((sum, item) => sum + (getTotalQuantity(item.id, stocks) * Number(item.unit_cost)), 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-green-500/30 p-3 rounded-xl backdrop-blur-sm">
                                <DollarSign className="h-6 w-6 text-white"/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <Link to="/reports" className="flex items-center hover:text-green-100 transition-colors">
                                <BarChart className="h-4 w-4 mr-2"/>
                                <span>View breakdown</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* System Activity Card */}
                <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white border-0 shadow-xl shadow-purple-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 font-medium text-sm uppercase tracking-wide">Recent Activity</p>
                                <p className="text-3xl font-bold mt-2">{recentTransactions.length}</p>
                            </div>
                            <div className="bg-purple-500/30 p-3 rounded-xl backdrop-blur-sm">
                                <Zap className="h-6 w-6 text-white"/>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <Link to="/reports?type=activity" className="flex items-center hover:text-purple-100 transition-colors">
                                <ArrowUpRight className="h-4 w-4 mr-2"/>
                                <span>View timeline</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Critical Stock Alerts */}
                <Card className="xl:col-span-2 bg-white border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-slate-900">
                            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-xl mr-3">
                                <AlertTriangle className="h-5 w-5 text-orange-600"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Critical Stock Alerts</h3>
                                <p className="text-sm text-slate-500 font-normal">Components requiring immediate attention</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.length > 0 ? (
                            <div className="space-y-3">
                                {lowStockItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Microchip className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl font-bold text-red-600">{getTotalQuantity(item.id, stocks)}</span>
                                                <span className="text-sm text-slate-500">/ {item.minimum_stock || 0}</span>
                                            </div>
                                            <Link
                                                to={`/inventory/items`}
                                                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-8 w-8 text-green-600"/>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">All Stock Levels Optimal</h3>
                                <p className="text-slate-500">All components are above their minimum thresholds</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-slate-900">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl mr-3">
                                <Activity className="h-5 w-5 text-purple-600"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                                <p className="text-sm text-slate-500 font-normal">Latest component movements</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {getItemDetailsForTransactions(recentTransactions, items).map((txnWithItem) => {
                                const getTypeConfig = (type: string) => {
                                    switch (type) {
                                        case 'receive':
                                            return { color: 'text-green-700', bg: 'bg-green-100', icon: '↗️', label: 'Received' };
                                        case 'transfer':
                                            return { color: 'text-blue-700', bg: 'bg-blue-100', icon: '🔄', label: 'Transferred' };
                                        case 'withdraw':
                                            return { color: 'text-orange-700', bg: 'bg-orange-100', icon: '↙️', label: 'Withdrawn' };
                                        case 'adjust':
                                            return { color: 'text-purple-700', bg: 'bg-purple-100', icon: '⚙️', label: 'Adjusted' };
                                        default:
                                            return { color: 'text-gray-700', bg: 'bg-gray-100', icon: '📦', label: 'Updated' };
                                    }
                                };

                                const config = getTypeConfig(txnWithItem.type);

                                return (
                                    <div key={txnWithItem.id} className="flex items-center space-x-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center text-sm`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">
                                                {txnWithItem.item ? txnWithItem.item.name : 'Unknown Component'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {config.label} • {txnWithItem.quantity > 0 ? '+' : ''}{txnWithItem.quantity} units
                                            </p>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {txnWithItem.performed_at && typeof txnWithItem.performed_at === 'string' 
                                                ? new Date(txnWithItem.performed_at).toLocaleDateString() 
                                                : 'Today'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Link 
                                to="/reports?type=activity" 
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center"
                            >
                                View full timeline
                                <ArrowUpRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.INVENTORY_MANAGER) && (
                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-900">
                            <div className="flex items-center justify-center w-10 h-10 bg-sky-100 rounded-xl mr-3">
                                <Zap className="h-5 w-5 text-sky-600"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Quick Actions</h3>
                                <p className="text-sm text-slate-500 font-normal">Common inventory operations</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link
                                to="/inventory/add"
                                className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="w-12 h-12 bg-[#FF385C] text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Plus className="h-6 w-6"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Add Component</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Register new electronic components</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-[#FF385C]" />
                                </div>
                            </Link>

                            <Link
                                to="/inventory/receive"
                                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 border border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <PackageCheck className="h-6 w-6"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Receive Items</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Process incoming shipments</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-blue-600" />
                                </div>
                            </Link>

                            <Link
                                to="/inventory/withdraw"
                                className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <PackageMinus className="h-6 w-6"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Withdraw Items</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Remove items from inventory</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-orange-600" />
                                </div>
                            </Link>

                            <Link
                                to="/inventory/transfer"
                                className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border border-violet-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ArrowRightLeft className="h-6 w-6"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Transfer Items</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Move items between locations</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-violet-600" />
                                </div>
                            </Link>

                            <button
                                onClick={() => generateQuickReport()}
                                className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 w-full text-left"
                            >
                                <div className="flex flex-col items-start">
                                    <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <BarChart className="h-6 w-6"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Generate Report</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">Download inventory summary as CSV</p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-purple-600" />
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;