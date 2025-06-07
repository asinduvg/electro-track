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
            
            return matchesSearch && matchesStatus && matchesCategory;
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
    }, [items, searchQuery, statusFilter, categoryFilter, sortField, sortDirection, stocks, getTotalQuantity]);
    
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Items</h1>
                <Link to="/inventory/add">
                    <Button className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Item
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search items by name, SKU, or description..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex space-x-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.category} - {category.subcategory}
                                    </option>
                                ))}
                            </select>
                            
                            <Button variant="outline" className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredAndSortedItems.length} of {items.length} items
                    </div>
                </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        All Items ({items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>
                                    <button 
                                        onClick={() => handleSort('sku')}
                                        className="flex items-center space-x-1 hover:text-blue-600"
                                    >
                                        <span>SKU</span>
                                        {getSortIcon('sku')}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <button 
                                        onClick={() => handleSort('name')}
                                        className="flex items-center space-x-1 hover:text-blue-600"
                                    >
                                        <span>Name</span>
                                        {getSortIcon('name')}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>Category</TableHeaderCell>
                                <TableHeaderCell>
                                    <button 
                                        onClick={() => handleSort('stock')}
                                        className="flex items-center space-x-1 hover:text-blue-600"
                                    >
                                        <span>Stock</span>
                                        {getSortIcon('stock')}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <button 
                                        onClick={() => handleSort('cost')}
                                        className="flex items-center space-x-1 hover:text-blue-600"
                                    >
                                        <span>Unit Cost</span>
                                        {getSortIcon('cost')}
                                    </button>
                                </TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedItems.map((item) => {
                                const category = categories.find(cat => cat.id === item.category_id);
                                return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.sku}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.description}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {category ? `${category.category} - ${category.subcategory}` : 'Uncategorized'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-medium ${
                                            getTotalQuantity(item.id, stocks) <= (item.minimum_stock || 0)
                                                ? 'text-red-600' 
                                                : 'text-green-600'
                                        }`}>
                                            {getTotalQuantity(item.id, stocks)}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {' '}/ {item.minimum_stock || 0} min
                                        </span>
                                    </TableCell>
                                    <TableCell>${Number(item.unit_cost).toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Link to={`/inventory/edit/${item.id}`}>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                            <Link to={`/inventory/view/${item.id}`}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryListPage;