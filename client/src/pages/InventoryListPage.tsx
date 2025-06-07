import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, Plus, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '../components/ui/Input';
import useItems from '../hooks/useItems';
import useStocks from '../hooks/useStocks';
import useCategories from '../hooks/useCategories';

const InventoryListPage: React.FC = () => {
    const { items, getTotalQuantity } = useItems();
    const { stocks } = useStocks();
    const { categories } = useCategories();
    
    // Filter and sorting state
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
            const itemPrice = Number(item.unit_cost) || 0;
            const matchesPriceMin = !priceRangeMin || itemPrice >= Number(priceRangeMin);
            const matchesPriceMax = !priceRangeMax || itemPrice <= Number(priceRangeMax);
            
            // Stock range filter
            const itemStock = getTotalQuantity(item.id, stocks);
            const matchesStockMin = !stockRangeMin || itemStock >= Number(stockRangeMin);
            const matchesStockMax = !stockRangeMax || itemStock <= Number(stockRangeMax);
            
            return matchesSearch && matchesStatus && matchesCategory && 
                   matchesPriceMin && matchesPriceMax && matchesStockMin && matchesStockMax;
        });
        
        // Sort items
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            switch (sortField) {
                case 'name':
                    aValue = a.name?.toLowerCase() || '';
                    bValue = b.name?.toLowerCase() || '';
                    break;
                case 'sku':
                    aValue = a.sku?.toLowerCase() || '';
                    bValue = b.sku?.toLowerCase() || '';
                    break;
                case 'stock':
                    aValue = getTotalQuantity(a.id, stocks);
                    bValue = getTotalQuantity(b.id, stocks);
                    break;
                case 'cost':
                    aValue = Number(a.unit_cost) || 0;
                    bValue = Number(b.unit_cost) || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [items, searchQuery, statusFilter, categoryFilter, sortField, sortDirection, stocks, getTotalQuantity, 
        priceRangeMin, priceRangeMax, stockRangeMin, stockRangeMax]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setPriceRangeMin('');
        setPriceRangeMax('');
        setStockRangeMin('');
        setStockRangeMax('');
    };
    
    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    const getSortIcon = (field: typeof sortField) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Inventory Items</h1>
                        <p className="mt-2 text-slate-600">Manage your electronic components and equipment</p>
                    </div>
                    <Link to="/inventory/add">
                        <Button className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6 py-3 font-medium transition-colors shadow-lg hover:shadow-xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
                        </Button>
                    </Link>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search items by name, SKU, or description..."
                                    className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
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
                                    className={`flex items-center px-4 py-3 transition-colors ${
                                        showAdvancedFilters 
                                            ? 'bg-[#FFE5E9] border-[#FF385C] text-[#FF385C]' 
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Advanced Filters Panel */}
                        {showAdvancedFilters && (
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Min Price ($)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={priceRangeMin}
                                            onChange={(e) => setPriceRangeMin(e.target.value)}
                                            className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Max Price ($)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="999.99"
                                            value={priceRangeMax}
                                            onChange={(e) => setPriceRangeMax(e.target.value)}
                                            className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Min Stock
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={stockRangeMin}
                                            onChange={(e) => setStockRangeMin(e.target.value)}
                                            className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Max Stock
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="9999"
                                            value={stockRangeMax}
                                            onChange={(e) => setStockRangeMax(e.target.value)}
                                            className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={clearAllFilters}
                                        className="px-4 py-2 text-sm bg-white border-slate-200 hover:bg-slate-50"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 text-sm text-slate-600">
                            Showing {filteredAndSortedItems.length} of {items.length} items
                        </div>
                    </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-900">
                            <Package className="mr-2 h-5 w-5 text-emerald-600" />
                            All Items ({items.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow className="border-slate-200">
                                        <TableHeaderCell className="text-slate-700">
                                            <button 
                                                onClick={() => handleSort('sku')}
                                                className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                                            >
                                                <span>SKU</span>
                                                {getSortIcon('sku')}
                                            </button>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">
                                            <button 
                                                onClick={() => handleSort('name')}
                                                className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                                            >
                                                <span>Name</span>
                                                {getSortIcon('name')}
                                            </button>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden md:table-cell">Category</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">
                                            <button 
                                                onClick={() => handleSort('stock')}
                                                className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                                            >
                                                <span>Stock</span>
                                                {getSortIcon('stock')}
                                            </button>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden lg:table-cell">
                                            <button 
                                                onClick={() => handleSort('cost')}
                                                className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                                            >
                                                <span>Unit Cost</span>
                                                {getSortIcon('cost')}
                                            </button>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Status</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAndSortedItems.length > 0 ? (
                                        filteredAndSortedItems.map((item) => {
                                            const category = categories.find(cat => cat.id === item.category_id);
                                            const totalStock = getTotalQuantity(item.id, stocks);
                                            
                                            return (
                                                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                                    <TableCell className="font-medium text-slate-900">{item.sku}</TableCell>
                                                    <TableCell className="text-slate-900">
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-sm text-slate-500 md:hidden">
                                                                {category ? `${category.category} - ${category.subcategory}` : 'Uncategorized'}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 hidden md:table-cell">
                                                        {category ? `${category.category} - ${category.subcategory}` : 'Uncategorized'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-900 font-semibold">{totalStock}</TableCell>
                                                    <TableCell className="text-slate-900 hidden lg:table-cell">${Number(item.unit_cost).toFixed(2)}</TableCell>
                                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link to={`/inventory/items/${item.id}`}>
                                                                <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 text-xs">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link to={`/inventory/edit/${item.id}`}>
                                                                <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 text-xs">
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <Package className="h-12 w-12 text-slate-400 mb-4" />
                                                    <p className="text-slate-500">No items found</p>
                                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InventoryListPage;