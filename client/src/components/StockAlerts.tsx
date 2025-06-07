import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { AlertTriangle, Package, Clock, TrendingDown } from 'lucide-react';
import useItems from '../hooks/useItems';
import useStocks from '../hooks/useStocks';

interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'overstock';
  item: any;
  currentStock: number;
  threshold: number;
  urgency: 'low' | 'medium' | 'high';
}

const StockAlerts: React.FC = () => {
  const { items } = useItems();
  const { stocks } = useStocks();

  const generateStockAlerts = (): StockAlert[] => {
    const alerts: StockAlert[] = [];

    items.forEach(item => {
      const currentStock = stocks
        .filter(stock => stock.item_id === item.id)
        .reduce((total, stock) => total + stock.quantity, 0);

      const minStock = item.minimum_stock || 10;
      const maxStock = item.maximum_stock || 1000;

      // Low stock alert
      if (currentStock <= minStock && currentStock > 0) {
        alerts.push({
          id: `low_${item.id}`,
          type: 'low_stock',
          item,
          currentStock,
          threshold: minStock,
          urgency: currentStock <= minStock * 0.5 ? 'high' : 'medium'
        });
      }

      // Out of stock alert
      if (currentStock === 0) {
        alerts.push({
          id: `out_${item.id}`,
          type: 'out_of_stock',
          item,
          currentStock,
          threshold: 0,
          urgency: 'high'
        });
      }

      // Overstock alert
      if (currentStock > maxStock) {
        alerts.push({
          id: `over_${item.id}`,
          type: 'overstock',
          item,
          currentStock,
          threshold: maxStock,
          urgency: 'low'
        });
      }
    });

    return alerts.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  };

  const alerts = generateStockAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <TrendingDown className="h-4 w-4" />;
      case 'out_of_stock':
        return <Package className="h-4 w-4" />;
      case 'expiring':
        return <Clock className="h-4 w-4" />;
      case 'overstock':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'expiring':
        return 'Expiring Soon';
      case 'overstock':
        return 'Overstock';
      default:
        return 'Alert';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#FF385C]" />
          Stock Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stock alerts at this time</p>
            <p className="text-sm text-gray-400">All inventory levels are within normal ranges</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 border rounded-lg ${getAlertColor(alert.urgency)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {alert.item.name}
                      </div>
                      <div className="text-xs opacity-75">
                        SKU: {alert.item.sku}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {getAlertTitle(alert.type)}
                    </Badge>
                    <div className="text-xs">
                      Stock: {alert.currentStock}
                      {alert.type !== 'out_of_stock' && (
                        <span className="opacity-75"> / {alert.threshold}</span>
                      )}
                    </div>
                  </div>
                </div>
                {alert.type === 'low_stock' && (
                  <div className="mt-2 text-xs">
                    Reorder recommended: {Math.max(alert.threshold * 2 - alert.currentStock, alert.threshold)} units
                  </div>
                )}
              </div>
            ))}
            {alerts.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm">
                  View all {alerts.length} alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAlerts;