import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
} from 'lucide-react';
import useItems from '../hooks/useItems';
import useStocks from '../hooks/useStocks';
import useTransactions from '../hooks/useTransactions';

const InventoryAnalytics: React.FC = () => {
  const { items } = useItems();
  const { stocks } = useStocks();
  const { transactions } = useTransactions();

  const analytics = useMemo(() => {
    const totalItems = items.length;
    const totalStockValue = items.reduce((total, item) => {
      const itemStock = stocks
        .filter((stock) => stock.item_id === item.id)
        .reduce((sum, stock) => sum + stock.quantity, 0);
      return total + itemStock * Number(item.unit_cost || 0);
    }, 0);

    const lowStockItems = items.filter((item) => {
      const currentStock = stocks
        .filter((stock) => stock.item_id === item.id)
        .reduce((sum, stock) => sum + stock.quantity, 0);
      return currentStock <= (item.minimum_stock || 10);
    }).length;

    const outOfStockItems = items.filter((item) => {
      const currentStock = stocks
        .filter((stock) => stock.item_id === item.id)
        .reduce((sum, stock) => sum + stock.quantity, 0);
      return currentStock === 0;
    }).length;

    // Recent transaction analysis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.performed_at || Date.now());
      return transactionDate >= thirtyDaysAgo;
    });

    const transactionsByType = recentTransactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostActiveItems = items
      .map((item) => {
        const itemTransactions = recentTransactions.filter((t) => t.item_id === item.id);
        return {
          item,
          transactionCount: itemTransactions.length,
          totalMovement: itemTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0),
        };
      })
      .filter((data) => data.transactionCount > 0)
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    const categoryDistribution = items.reduce(
      (acc, item) => {
        const category = item.manufacturer || 'Unknown Manufacturer';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const stockTurnover = recentTransactions
      .filter((t) => ['withdraw', 'transfer'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

    return {
      totalItems,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      recentTransactions: recentTransactions.length,
      transactionsByType,
      mostActiveItems,
      categoryDistribution,
      stockTurnover,
      averageItemValue: totalItems > 0 ? totalStockValue / totalItems : 0,
    };
  }, [items, stocks, transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{analytics.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-[#FF385C]" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalStockValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.lowStockItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-600">Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold">{analytics.recentTransactions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaction Types (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.transactionsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Most Active Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.mostActiveItems.map((data, index) => (
                <div key={data.item.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{data.item.name}</div>
                    <div className="text-xs text-gray-500">SKU: {data.item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.transactionCount} transactions</div>
                    <div className="text-xs text-gray-500">{data.totalMovement} units moved</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory by Manufacturer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
              <div key={category} className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-[#FF385C]">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.stockTurnover}</div>
            <div className="text-sm text-gray-600">Units Moved (30 days)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics.averageItemValue)}
            </div>
            <div className="text-sm text-gray-600">Average Item Value</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.outOfStockItems}</div>
            <div className="text-sm text-gray-600">Out of Stock Items</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
