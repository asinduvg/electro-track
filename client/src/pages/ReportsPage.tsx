import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, Download, TrendingUp, Package, DollarSign } from 'lucide-react';

const ReportsPage: React.FC = () => {
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