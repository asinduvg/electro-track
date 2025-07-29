import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  TrendingDown,
  Eye,
  Check,
  X,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'low_stock' | 'expiring' | 'out_of_stock' | 'overstock';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  message: string;
  item_name?: string;
  location_name?: string;
  threshold_value?: number;
  current_value?: number;
  created_at: Date;
  acknowledged_at?: Date;
  acknowledged_by?: string;
}

const AlertsPage: React.FC = () => {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'low_stock',
      status: 'active',
      title: 'Low Stock Alert',
      message: 'Arduino Uno R3 is running low in Warehouse A',
      item_name: 'Arduino Uno R3',
      location_name: 'Warehouse A - Shelf B2',
      threshold_value: 10,
      current_value: 3,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'out_of_stock',
      status: 'active',
      title: 'Out of Stock',
      message: 'Raspberry Pi 4 is completely out of stock',
      item_name: 'Raspberry Pi 4',
      location_name: 'Warehouse B - Shelf A1',
      threshold_value: 1,
      current_value: 0,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'expiring',
      status: 'acknowledged',
      title: 'Warranty Expiring',
      message: 'Oscilloscope warranty expires in 7 days',
      item_name: 'Digital Oscilloscope DSO-X 2024A',
      location_name: 'Lab Equipment Room',
      acknowledged_at: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged_by: 'Admin User',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <TrendingDown className="h-5 w-5 text-[#FC642D]" />;
      case 'out_of_stock':
        return <Package className="h-5 w-5 text-[#C4141C]" />;
      case 'expiring':
        return <Clock className="h-5 w-5 text-[#FC642D]" />;
      case 'overstock':
        return <AlertTriangle className="h-5 w-5 text-[#FF385C]" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-[#717171]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="danger">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="warning">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="danger">Out of Stock</Badge>;
      case 'expiring':
        return <Badge variant="info">Expiring</Badge>;
      case 'overstock':
        return <Badge variant="primary">Overstock</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(
    (alert) => filterStatus === 'all' || alert.status === filterStatus
  );

  const activeAlertsCount = alerts.filter((alert) => alert.status === 'active').length;
  const acknowledgedAlertsCount = alerts.filter((alert) => alert.status === 'acknowledged').length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222] dark:text-white">
              Alerts & Notifications
            </h1>
            <p className="mt-2 text-[#717171]">
              Monitor and manage system alerts and notifications
            </p>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#717171]">Total Alerts</p>
                  <p className="text-2xl font-bold text-[#222222] dark:text-white">
                    {alerts.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-[#FF385C]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#717171]">Active Alerts</p>
                  <p className="text-2xl font-bold text-[#C4141C]">{activeAlertsCount}</p>
                </div>
                <div className="h-3 w-3 animate-pulse rounded-full bg-[#C4141C]"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#717171]">Acknowledged</p>
                  <p className="text-2xl font-bold text-[#FC642D]">{acknowledgedAlertsCount}</p>
                </div>
                <Eye className="h-8 w-8 text-[#FC642D]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#717171]">Response Time</p>
                  <p className="text-2xl font-bold text-[#008489]">2.5h</p>
                </div>
                <CheckCircle className="h-8 w-8 text-[#008489]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'acknowledged', 'resolved'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Alerts' : status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-[#FF385C]" />
              System Alerts ({filteredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Alert</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="font-medium text-[#222222] dark:text-white">
                              {alert.title}
                            </div>
                            <div className="max-w-md text-sm text-[#717171]">{alert.message}</div>
                            {alert.item_name && (
                              <div className="mt-1 text-xs text-[#717171]">
                                Item: {alert.item_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(alert.type)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(alert.status)}
                          {alert.acknowledged_by && (
                            <div className="text-xs text-[#717171]">by {alert.acknowledged_by}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {alert.location_name && (
                            <div className="text-[#717171]">Location: {alert.location_name}</div>
                          )}
                          {alert.threshold_value !== undefined &&
                            alert.current_value !== undefined && (
                              <div className="text-[#717171]">
                                Current: {alert.current_value} / Threshold: {alert.threshold_value}
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-[#717171]">
                          {formatTimeAgo(alert.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <Button variant="outline" size="sm" title="Acknowledge">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {alert.status !== 'resolved' && (
                            <Button variant="outline" size="sm" title="Resolve">
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" title="Dismiss">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertsPage;
