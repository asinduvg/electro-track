import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PackageMinus, Minus, Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useTransactions from '../hooks/useTransactions';
import useStocks from '../hooks/useStocks';
import useCategories from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import { WithdrawItemsSkeleton } from '../components/ui/InventorySkeletons';

interface WithdrawItem {
    itemId: string;
    locationId: string;
    quantity: number;
    notes?: string;
}

const WithdrawItemsPage: React.FC = () => {
    const { items, getTotalQuantity, refreshItems, isLoading: itemsLoading } = useItems();
    const { locations, isLoading: locationsLoading } = useLocations();
    const { createTransaction } = useTransactions();
    const { stocks, refreshStocks, isLoading: stocksLoading } = useStocks();
    const { categories, isLoading: categoriesLoading } = useCategories();
    const { currentUser } = useAuth();
    const [withdrawItems, setWithdrawItems] = useState<WithdrawItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortField, setSortField] = useState<'name' | 'sku' | 'stock' | 'cost'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceRangeMin, setPriceRangeMin] = useState('');
    const [priceRangeMax, setPriceRangeMax] = useState('');
    const [stockRangeMin, setStockRangeMin] = useState('');
    const [stockRangeMax, setStockRangeMax] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = itemsLoading || locationsLoading || stocksLoading || categoriesLoading;

    // Filtered and sorted items
    const filteredAndSortedItems = useMemo(() => {
        let filtered = items.filter(item => {
            // Search filter
            const matchesSearch = !searchQuery ||
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            // Category filter
            const matchesCategory = categoryFilter === 'all' || item.category_id?.toString() === categoryFilter;

            // Price range filter
            const matchesPriceRange = (!priceRangeMin || parseFloat(item.unit_cost) >= parseFloat(priceRangeMin)) &&
                (!priceRangeMax || parseFloat(item.unit_cost) <= parseFloat(priceRangeMax));

            // Stock range filter
            const totalStock = getTotalQuantity(item.id, stocks);
            const matchesStockRange = (!stockRangeMin || totalStock >= parseInt(stockRangeMin)) &&
                (!stockRangeMax || totalStock <= parseInt(stockRangeMax));

            return matchesSearch && matchesStatus && matchesCategory && matchesPriceRange && matchesStockRange;
        });

        // Sort items
        return filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'sku':
                    comparison = (a.sku || '').localeCompare(b.sku || '');
                    break;
                case 'stock':
                    const stockA = getTotalQuantity(a.id, stocks);
                    const stockB = getTotalQuantity(b.id, stocks);
                    comparison = stockA - stockB;
                    break;
                case 'cost':
                    comparison = parseFloat(a.unit_cost) - parseFloat(b.unit_cost);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [items, stocks, searchQuery, statusFilter, categoryFilter, priceRangeMin, priceRangeMax, stockRangeMin, stockRangeMax, sortField, sortDirection, getTotalQuantity]);

    const handleSort = (field: 'name' | 'sku' | 'stock' | 'cost') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setPriceRangeMin('');
        setPriceRangeMax('');
        setStockRangeMin('');
        setStockRangeMax('');
    };

    const getSortIcon = (field: 'name' | 'sku' | 'stock' | 'cost') => {
        if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />;
        return sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_stock':
                return <Badge variant="success">In Stock</Badge>;
            case 'low_stock':
                return <Badge variant="warning">Low Stock</Badge>;
            case 'out_of_stock':
                return <Badge variant="danger">Out of Stock</Badge>;
            case 'discontinued':
                return <Badge variant="secondary">Discontinued</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStockFromLocation = (itemId: string, locationId: string) => {
        const stock = stocks.find(s => s.item_id === itemId && s.location_id === locationId);
        return stock?.quantity || 0;
    };

    const addItemToWithdraw = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        // Find the location with the most stock for this item
        const itemStocks = stocks.filter(s => s.item_id === itemId && s.quantity > 0);
        const maxStockLocation = itemStocks.reduce((max, current) =>
            current.quantity > max.quantity ? current : max, itemStocks[0]);

        const existingIndex = withdrawItems.findIndex(wi => wi.itemId === itemId);
        if (existingIndex >= 0) {
            const updated = [...withdrawItems];
            updated[existingIndex].quantity += 1;
            setWithdrawItems(updated);
        } else {
            setWithdrawItems([...withdrawItems, {
                itemId,
                locationId: maxStockLocation?.location_id || locations[0]?.id || '',
                quantity: 1,
                notes: ''
            }]);
        }
    };

    const updateWithdrawItem = (index: number, field: keyof WithdrawItem, value: any) => {
        const updated = [...withdrawItems];
        updated[index] = { ...updated[index], [field]: value };
        setWithdrawItems(updated);
    };

    const removeWithdrawItem = (index: number) => {
        setWithdrawItems(withdrawItems.filter((_, i) => i !== index));
    };

    const canWithdraw = (itemId: string, locationId: string, quantity: number) => {
        const availableStock = getStockFromLocation(itemId, locationId);
        return availableStock >= quantity;
    };

    const handleSubmitWithdraw = async () => {
        if (withdrawItems.length === 0) return;
        if (!currentUser?.id) {
            alert('User not authenticated. Please log in.');
            return;
        }

        // Validate all withdrawals
        for (const withdrawItem of withdrawItems) {
            if (!canWithdraw(withdrawItem.itemId, withdrawItem.locationId, withdrawItem.quantity)) {
                alert('Insufficient stock for one or more items.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            for (const withdrawItem of withdrawItems) {
                await createTransaction({
                    item_id: withdrawItem.itemId,
                    type: 'withdraw',
                    quantity: withdrawItem.quantity,
                    from_location_id: withdrawItem.locationId,
                    notes: withdrawItem.notes || `Withdrew ${withdrawItem.quantity} units`,
                    performed_by: currentUser.id
                });
            }

            await refreshItems();
            await refreshStocks();

            setWithdrawItems([]);
            alert('Items withdrawn successfully!');
        } catch (error) {
            console.error('Error withdrawing items:', error);
            alert('Failed to withdraw items. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="space-y-2">
                            <div className="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
                            <div className="h-5 bg-slate-200 rounded w-96 animate-pulse"></div>
                        </div>
                    </div>
                    <WithdrawItemsSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Withdraw Items</h1>
                        <p className="mt-2 text-slate-600">Remove items from your inventory</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute right-4 top-[20px] z-10 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search items by name, SKU, or description..."
                                    className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.category} - {category.subcategory}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="px-4 py-3 border-slate-200 hover:bg-slate-50"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Advanced
                                </Button>
                            </div>
                        </div>

                        {showAdvancedFilters && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="Min $"
                                                value={priceRangeMin}
                                                onChange={(e) => setPriceRangeMin(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Max $"
                                                value={priceRangeMax}
                                                onChange={(e) => setPriceRangeMax(e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Stock Range</label>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="Min stock"
                                                value={stockRangeMin}
                                                onChange={(e) => setStockRangeMin(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Max stock"
                                                value={stockRangeMax}
                                                onChange={(e) => setStockRangeMax(e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={clearAllFilters}
                                        className="text-slate-600 hover:text-slate-800"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-600">
                            Showing {filteredAndSortedItems.length} of {items.length} items
                        </p>

                        {/* Sort Controls */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">Sort by:</span>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as 'name' | 'sku' | 'stock' | 'cost')}
                                className="px-3 py-2 border border-slate-200 rounded text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="sku">SKU</option>
                                <option value="stock">Stock</option>
                                <option value="cost">Cost</option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2"
                            >
                                {sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <Card className="bg-white border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            Select Items to Withdraw
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead className="bg-slate-50">
                                    <TableRow>
                                        <TableHeaderCell
                                            className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                                            onClick={() => handleSort('sku')}
                                        >
                                            <div className="flex items-center">
                                                SKU {getSortIcon('sku')}
                                            </div>
                                        </TableHeaderCell>
                                        <TableHeaderCell
                                            className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Name {getSortIcon('name')}
                                            </div>
                                        </TableHeaderCell>
                                        <TableHeaderCell
                                            className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                                            onClick={() => handleSort('stock')}
                                        >
                                            <div className="flex items-center">
                                                Available Stock {getSortIcon('stock')}
                                            </div>
                                        </TableHeaderCell>
                                        <TableHeaderCell
                                            className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                                            onClick={() => handleSort('cost')}
                                        >
                                            <div className="flex items-center">
                                                Unit Cost {getSortIcon('cost')}
                                            </div>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Status</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Locations</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAndSortedItems.map((item) => {
                                        const totalStock = getTotalQuantity(item.id, stocks);
                                        const itemStocks = stocks.filter(s => s.item_id === item.id && s.quantity > 0);

                                        return (
                                            <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium text-slate-900">{item.sku}</TableCell>
                                                <TableCell className="text-slate-900">
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-slate-500">{item.description}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-medium ${totalStock === 0 ? 'text-red-600' :
                                                            totalStock <= (item.minimum_stock || 0) ? 'text-orange-600' :
                                                                'text-green-600'
                                                        }`}>
                                                        {totalStock}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    ${parseFloat(item.unit_cost).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(item.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {itemStocks.slice(0, 3).map((stock) => {
                                                            const location = locations.find(l => l.id === stock.location_id);
                                                            return (
                                                                <Badge key={stock.id} variant="secondary" className="text-xs">
                                                                    {location?.unit}: {stock.quantity}
                                                                </Badge>
                                                            );
                                                        })}
                                                        {itemStocks.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{itemStocks.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addItemToWithdraw(item.id)}
                                                        disabled={totalStock === 0}
                                                        className="bg-white border-slate-200 hover:bg-slate-50 text-xs"
                                                    >
                                                        <Minus className="h-4 w-4 mr-1" />
                                                        Withdraw
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Items to Withdraw */}
                {withdrawItems.length > 0 && (
                    <Card className="bg-white border-0 shadow-lg mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PackageMinus className="mr-2 h-5 w-5" />
                                Items to Withdraw ({withdrawItems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHead className="bg-slate-50">
                                        <TableRow>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Item</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Quantity</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">From Location</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Available</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Notes</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {withdrawItems.map((withdrawItem, index) => {
                                            const item = items.find(i => i.id === withdrawItem.itemId);
                                            const availableStock = getStockFromLocation(withdrawItem.itemId, withdrawItem.locationId);
                                            const isValidQuantity = canWithdraw(withdrawItem.itemId, withdrawItem.locationId, withdrawItem.quantity);

                                            return (
                                                <TableRow key={index} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                                    <TableCell className="text-slate-900">
                                                        <div>
                                                            <div className="font-medium">{item?.name}</div>
                                                            <div className="text-sm text-slate-500">{item?.sku}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={withdrawItem.quantity}
                                                            onChange={(e) => updateWithdrawItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            className={`w-20 ${!isValidQuantity ? 'border-red-500' : ''}`}
                                                            min="1"
                                                            max={availableStock}
                                                        />
                                                        {!isValidQuantity && (
                                                            <div className="flex items-center text-red-500 text-xs mt-1">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Exceeds stock
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            value={withdrawItem.locationId}
                                                            onChange={(e) => updateWithdrawItem(index, 'locationId', e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-md"
                                                        >
                                                            {locations.map((location) => (
                                                                <option key={location.id} value={location.id}>
                                                                    {location.unit}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`font-medium ${availableStock === 0 ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {availableStock}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            placeholder="Optional notes..."
                                                            value={withdrawItem.notes || ''}
                                                            onChange={(e) => updateWithdrawItem(index, 'notes', e.target.value)}
                                                            className="w-40"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeWithdrawItem(index)}
                                                            className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 text-gray-500"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Floating Withdraw Button */}
                {withdrawItems.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Button
                            onClick={handleSubmitWithdraw}
                            disabled={isSubmitting}
                            className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-lg px-6 py-3 text-lg font-semibold rounded-lg"
                            size="lg"
                        >
                            <PackageMinus className="h-5 w-5 mr-2" />
                            {isSubmitting ? 'Processing...' : `Withdraw ${withdrawItems.length} Items`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawItemsPage;