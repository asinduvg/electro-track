import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    BarChart3, 
    PieChart, 
    Calendar,
    Download,
    RefreshCw,
    Target,
    AlertTriangle
} from 'lucide-react';

interface InventoryMetrics {
    turnoverRate: number;
    averageCost: number;
    totalValue: number;
    profitMargin: number;
    slowMovingItems: number;
    fastMovingItems: number;
    reorderRecommendations: number;
    costSavingsOpportunities: number;
}

interface TopItem {
    name: string;
    turnoverRate: number;
    totalValue: number;
    profitMargin: number;
    trend: 'up' | 'down' | 'stable';
}

const AdvancedAnalyticsPage: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    
    const metrics: InventoryMetrics = {
        turnoverRate: 4.2,
        averageCost: 127.50,
        totalValue: 185420.75,
        profitMargin: 23.8,
        slowMovingItems: 12,
        fastMovingItems: 45,
        reorderRecommendations: 8,
        costSavingsOpportunities: 3
    };

    const topPerformingItems: TopItem[] = [
        { name: 'Arduino Uno R3', turnoverRate: 8.5, totalValue: 15230, profitMargin: 35.2, trend: 'up' },
        { name: 'Raspberry Pi 4', turnoverRate: 7.2, totalValue: 22180, profitMargin: 28.5, trend: 'up' },
        { name: 'ESP32 DevKit', turnoverRate: 6.8, totalValue: 8940, profitMargin: 42.1, trend: 'stable' },
        { name: 'STM32 Blue Pill', turnoverRate: 5.9, totalValue: 4560, profitMargin: 31.8, trend: 'down' },
        { name: 'NodeMCU ESP8266', turnoverRate: 5.3, totalValue: 3420, profitMargin: 38.9, trend: 'up' }
    ];

    const slowMovingItems = [
        { name: 'Vintage 8051 Microcontroller', daysInStock: 245, value: 850, recommendation: 'Consider clearance' },
        { name: 'Legacy RS-232 Interface', daysInStock: 198, value: 340, recommendation: 'Bundle with modern items' },
        { name: 'Parallel Port Adapter', daysInStock: 156, value: 120, recommendation: 'Discontinue' }
    ];

    const reorderRecommendations = [
        { name: 'Arduino Nano', currentStock: 3, recommendedOrder: 25, supplier: 'TechCorp', leadTime: '5-7 days' },
        { name: 'Breadboard 830 tie', currentStock: 2, recommendedOrder: 15, supplier: 'ElectroSupply', leadTime: '3-5 days' },
        { name: 'Jumper Wires M-M', currentStock: 1, recommendedOrder: 50, supplier: 'ComponentWorld', leadTime: '1-3 days' }
    ];

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-[#008489]" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-[#C4141C]" />;
            default:
                return <div className="h-4 w-4 bg-[#717171] rounded-full"></div>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    const generateReport = () => {
        const reportData = {
            period: selectedPeriod,
            generatedAt: new Date().toISOString(),
            metrics,
            topPerformingItems,
            slowMovingItems,
            reorderRecommendations
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] dark:text-white">Advanced Analytics</h1>
                        <p className="mt-2 text-[#717171]">Comprehensive inventory performance analysis and insights</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as any)}
                            className="px-4 py-2 border border-[#DDDDDD] rounded-lg bg-white dark:bg-[#484848] text-[#222222] dark:text-white"
                        >
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                        </select>
                        <Button variant="outline" onClick={generateReport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                        <Button variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Inventory Turnover</p>
                                    <p className="text-2xl font-bold text-[#222222] dark:text-white">{metrics.turnoverRate}x</p>
                                    <p className="text-xs text-[#008489]">+12% from last period</p>
                                </div>
                                <RefreshCw className="h-8 w-8 text-[#FF385C]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Total Inventory Value</p>
                                    <p className="text-2xl font-bold text-[#222222] dark:text-white">{formatCurrency(metrics.totalValue)}</p>
                                    <p className="text-xs text-[#008489]">+8.5% from last period</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-[#008489]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Avg Profit Margin</p>
                                    <p className="text-2xl font-bold text-[#222222] dark:text-white">{formatPercentage(metrics.profitMargin)}</p>
                                    <p className="text-xs text-[#C4141C]">-2.1% from last period</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-[#FC642D]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Reorder Alerts</p>
                                    <p className="text-2xl font-bold text-[#C4141C]">{metrics.reorderRecommendations}</p>
                                    <p className="text-xs text-[#717171]">Items need restocking</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-[#C4141C]" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Performing Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-[#008489]" />
                                Top Performing Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topPerformingItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-[#FF385C] text-white rounded-full text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#222222] dark:text-white">{item.name}</p>
                                                <p className="text-sm text-[#717171]">
                                                    Turnover: {item.turnoverRate}x | Margin: {formatPercentage(item.profitMargin)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-[#222222] dark:text-white">
                                                {formatCurrency(item.totalValue)}
                                            </span>
                                            {getTrendIcon(item.trend)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reorder Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="mr-2 h-5 w-5 text-[#FC642D]" />
                                Reorder Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reorderRecommendations.map((item, index) => (
                                    <div key={index} className="p-3 border border-[#EBEBEB] dark:border-[#484848] rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-[#222222] dark:text-white">{item.name}</span>
                                            <Badge variant="warning">Low Stock</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-[#717171]">
                                            <div>Current: {item.currentStock} units</div>
                                            <div>Recommended: {item.recommendedOrder} units</div>
                                            <div>Supplier: {item.supplier}</div>
                                            <div>Lead Time: {item.leadTime}</div>
                                        </div>
                                        <Button size="sm" className="w-full mt-3">
                                            Create Purchase Order
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Slow Moving Items Analysis */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingDown className="mr-2 h-5 w-5 text-[#C4141C]" />
                            Slow Moving Items Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {slowMovingItems.map((item, index) => (
                                <div key={index} className="p-4 border border-[#EBEBEB] dark:border-[#484848] rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-[#222222] dark:text-white">{item.name}</h4>
                                        <Badge variant="danger">{item.daysInStock} days</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm text-[#717171]">
                                        <div>Current Value: {formatCurrency(item.value)}</div>
                                        <div className="font-medium text-[#FC642D]">{item.recommendation}</div>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Mark for Clearance
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Bundle Deal
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Cost Analysis Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-[#FF385C]" />
                                Cost Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                    <span className="text-[#222222] dark:text-white">Average Unit Cost</span>
                                    <span className="font-bold text-[#222222] dark:text-white">{formatCurrency(metrics.averageCost)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                    <span className="text-[#222222] dark:text-white">Carrying Cost per Month</span>
                                    <span className="font-bold text-[#222222] dark:text-white">{formatCurrency(metrics.totalValue * 0.02)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                    <span className="text-[#222222] dark:text-white">Potential Savings</span>
                                    <span className="font-bold text-[#008489]">{formatCurrency(metrics.totalValue * 0.05)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PieChart className="mr-2 h-5 w-5 text-[#FF385C]" />
                                Performance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#222222] dark:text-white">Fast Moving Items</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-[#EBEBEB] dark:bg-[#484848] rounded-full h-2">
                                            <div className="bg-[#008489] h-2 rounded-full" style={{width: '75%'}}></div>
                                        </div>
                                        <span className="text-sm font-medium text-[#008489]">{metrics.fastMovingItems}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#222222] dark:text-white">Slow Moving Items</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-[#EBEBEB] dark:bg-[#484848] rounded-full h-2">
                                            <div className="bg-[#C4141C] h-2 rounded-full" style={{width: '20%'}}></div>
                                        </div>
                                        <span className="text-sm font-medium text-[#C4141C]">{metrics.slowMovingItems}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#222222] dark:text-white">Optimization Opportunities</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-[#EBEBEB] dark:bg-[#484848] rounded-full h-2">
                                            <div className="bg-[#FC642D] h-2 rounded-full" style={{width: '5%'}}></div>
                                        </div>
                                        <span className="text-sm font-medium text-[#FC642D]">{metrics.costSavingsOpportunities}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalyticsPage;