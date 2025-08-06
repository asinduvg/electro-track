import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Package,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  BarChart,
  TrendingUp,
  TrendingDown,
  Zap,
  Microchip,
  Activity,
  Plus,
  PackageCheck,
  PackageMinus,
  ArrowRightLeft,
} from 'lucide-react';
import { UserRole, ItemStatus } from '../types';
import useItems from '../hooks/useItems.tsx';
import useTransactions from '../hooks/useTransactions.tsx';
import useStocks from '../hooks/useStocks.tsx';
import StockAlerts from '../components/StockAlerts';
import InventoryAnalytics from '../components/InventoryAnalytics';
import {
  DashboardStatsSkeleton,
  AnalyticsChartSkeleton,
  TransactionHistorySkeleton,
} from '../components/ui/InventorySkeletons';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { items, getTotalQuantity, isLoading: itemsLoading } = useItems();
  const { stocks, isLoading: stocksLoading } = useStocks();
  const {
    transactions,
    getItemDetailsForTransactions,
    isLoading: transactionsLoading,
  } = useTransactions();

  console.log('Dashboard page', currentUser);

  // Get low stock items
  const lowStockItems = items.filter((item) => item.status === ItemStatus.LOW_STOCK);

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
    const reportData = items.map((item) => {
      const totalStock = getTotalQuantity(item.id, stocks);
      return {
        sku: item.sku,
        name: item.name,
        stock: totalStock,
        unitCost: item.unit_cost,
        totalValue: totalStock * Number(item.unit_cost || 0),
        status: item.status,
        minimumStock: item.minimum_stock || 0,
      };
    });

    let csvContent = `Inventory Quick Report - Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += `Summary\n`;
    csvContent += `Total Items,${items.length}\n`;
    csvContent += `Total Value,$${items.reduce((sum, item) => sum + getTotalQuantity(item.id, stocks) * Number(item.unit_cost), 0).toFixed(2)}\n`;
    csvContent += `Low Stock Items,${lowStockItems.length}\n\n`;

    csvContent += `Item Details\n`;
    csvContent += `SKU,Name,Stock,Unit Cost,Total Value,Status,Minimum Stock\n`;
    reportData.forEach((item: any) => {
      csvContent += `${item.sku},"${item.name}",${item.stock},$${item.unitCost},$${item.totalValue.toFixed(2)},${item.status},${item.minimumStock}\n`;
    });

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if data is still loading
  const isLoading = itemsLoading || stocksLoading || transactionsLoading;

  // Authentication is now handled by routing
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Component Overview</h1>
            <p className="mt-2 text-slate-600">Monitor your electronic inventory at a glance</p>
          </div>
        </div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AnalyticsChartSkeleton />
          <TransactionHistorySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Component Overview</h1>
          <p className="mt-2 text-slate-600">Monitor your electronic inventory at a glance</p>
        </div>
        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm text-slate-600">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Components Card */}
        <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-300">
                  Total Components
                </p>
                <p className="mt-2 text-3xl font-bold">{totalStocks.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-700/50 p-3 backdrop-blur-sm">
                <Microchip className="h-6 w-6 text-sky-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-green-400" />
              <span className="text-slate-300">{items.length} unique types</span>
            </div>
          </CardContent>
        </Card>

        {/* Critical Stock Alert Card */}
        <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-orange-100">
                  Critical Stock
                </p>
                <p className="mt-2 text-3xl font-bold">{lowStockItems.length}</p>
              </div>
              <div className="rounded-xl bg-orange-400/30 p-3 backdrop-blur-sm">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {lowStockItems.length > 0 ? (
                <Link
                  to="/inventory?status=low_stock"
                  className="flex items-center transition-colors hover:text-orange-100"
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  <span>Requires attention</span>
                </Link>
              ) : (
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-4 w-4 text-green-300" />
                  <span className="text-orange-100">All levels optimal</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value Card */}
        <Card className="border-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white shadow-xl shadow-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-green-100">
                  Portfolio Value
                </p>
                <p className="mt-2 text-3xl font-bold">
                  $
                  {items
                    .reduce(
                      (sum, item) =>
                        sum + getTotalQuantity(item.id, stocks) * Number(item.unit_cost),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-green-500/30 p-3 backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Link
                to="/reports"
                className="flex items-center transition-colors hover:text-green-100"
              >
                <BarChart className="mr-2 h-4 w-4" />
                <span>View breakdown</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Activity Card */}
        <Card className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-purple-100">
                  Recent Activity
                </p>
                <p className="mt-2 text-3xl font-bold">{recentTransactions.length}</p>
              </div>
              <div className="rounded-xl bg-purple-500/30 p-3 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Link
                to="/reports?type=activity"
                className="flex items-center transition-colors hover:text-purple-100"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                <span>View timeline</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Critical Stock Alerts */}
        <Card className="border-0 bg-white shadow-lg xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Critical Stock Alerts</h3>
                <p className="text-sm font-normal text-slate-500">
                  Components requiring immediate attention
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <Microchip className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-red-600">
                          {getTotalQuantity(item.id, stocks)}
                        </span>
                        <span className="text-sm text-slate-500">/ {item.minimum_stock || 0}</span>
                      </div>
                      <Link
                        to={`/inventory/items/${item.id}`}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  All Stock Levels Optimal
                </h3>
                <p className="text-slate-500">All components are above their minimum thresholds</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                <p className="text-sm font-normal text-slate-500">Latest component movements</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getItemDetailsForTransactions(recentTransactions, items).map((txnWithItem) => {
                const getTypeConfig = (type: string) => {
                  switch (type) {
                    case 'receive':
                      return {
                        color: 'text-green-700',
                        bg: 'bg-green-100',
                        icon: '↗️',
                        label: 'Received',
                      };
                    case 'transfer':
                      return {
                        color: 'text-blue-700',
                        bg: 'bg-blue-100',
                        icon: '🔄',
                        label: 'Transferred',
                      };
                    case 'withdraw':
                      return {
                        color: 'text-orange-700',
                        bg: 'bg-orange-100',
                        icon: '↙️',
                        label: 'Withdrawn',
                      };
                    case 'adjust':
                      return {
                        color: 'text-purple-700',
                        bg: 'bg-purple-100',
                        icon: '⚙️',
                        label: 'Adjusted',
                      };
                    default:
                      return {
                        color: 'text-gray-700',
                        bg: 'bg-gray-100',
                        icon: '📦',
                        label: 'Updated',
                      };
                  }
                };

                const config = getTypeConfig(txnWithItem.type);

                return (
                  <div
                    key={txnWithItem.id}
                    className="flex items-center space-x-4 rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200"
                  >
                    <div
                      className={`h-10 w-10 ${config.bg} flex items-center justify-center rounded-lg text-sm`}
                    >
                      {config.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {txnWithItem.item ? txnWithItem.item.name : 'Unknown Component'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {config.label} • {txnWithItem.quantity > 0 ? '+' : ''}
                        {txnWithItem.quantity} units
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
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link
                to="/reports?type=activity"
                className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                View full timeline
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.INVENTORY_MANAGER) && (
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                <Zap className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <p className="text-sm font-normal text-slate-500">Common inventory operations</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => generateQuickReport()}
                className="group relative w-full overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-6 text-left transition-all duration-300 hover:from-purple-100 hover:to-violet-100 hover:shadow-lg hover:shadow-purple-100"
              >
                <div className="flex flex-col items-start">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white transition-transform group-hover:scale-110">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">Generate Report</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Download inventory summary as CSV
                  </p>
                </div>
                <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowUpRight className="h-5 w-5 text-purple-600" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Enterprise Features */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <InventoryAnalytics />
        </div>
        <div>
          <StockAlerts />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
