import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {
    Search, Filter, Plus, Download, Eye, Edit, Trash, ArrowUpDown,
    LayoutGrid, LayoutList
} from 'lucide-react';
import {
    Table, TableHead, TableBody, TableRow,
    TableHeaderCell, TableCell
} from '../components/ui/Table';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';
import {categories} from '../data/mockData';
import {UserRole} from '../types';
import {useItems, Item} from "../context/ItemsContext.tsx";

// type Item = Database['public']['Tables']['items']['Row'] & {
//     locations: Array<{
//         location: Database['public']['Tables']['locations']['Row'];
//         quantity: number;
//         status: 'in_stock' | 'ordered';
//     }>;
// };

type ViewMode = 'overview' | 'detailed';

const InventoryListPage: React.FC = () => {
    const {currentUser} = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    // const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortField, setSortField] = useState<keyof Item>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {items, stocks, locations, removeItem, error: itemsError} = useItems();

    console.log('items', items);

    // useEffect(() => {
    //     loadItems();
    // }, []);

    useEffect(() => {
        if (itemsError) {
            setError(itemsError);
            setIsLoading(false);
            return;
        }
        if (items.length > 0) {
            setIsLoading(false);
        }
    }, [items, itemsError]);

    // const loadItems = async () => {
    //     try {
    //         setIsLoading(true);
    //         const data = await getItems();
    //         setItems(data);
    //         setFilteredItems(data);
    //     } catch (err) {
    //         console.error('Error loading items:', err);
    //         setError('Failed to load inventory items');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await removeItem(id);
            setFilteredItems(filteredItems.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item');
        }
    };

    useEffect(() => {
        let result = [...items];

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                item =>
                    item.name.toLowerCase().includes(search) ||
                    item.sku.toLowerCase().includes(search) ||
                    item.description?.toLowerCase().includes(search) ||
                    item.manufacturer.toLowerCase().includes(search)
            );
        }

        // Apply category filter
        if (selectedCategory) {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Apply status filter
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        setFilteredItems(result);
    }, [searchTerm, selectedCategory, statusFilter, sortField, sortDirection, items]);

    const handleSort = (field: keyof Item) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: keyof Item) => {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="ml-1 opacity-50"/>;
        }
        return sortDirection === 'asc' ?
            <ArrowUpDown size={14} className="ml-1 text-blue-600"/> :
            <ArrowUpDown size={14} className="ml-1 text-blue-600 transform rotate-180"/>;
    };

    const getStatusBadge = (status: string) => {
        let variant: 'success' | 'danger' | 'warning' | 'info' | 'primary';

        switch (status) {
            case 'in_stock':
                variant = 'success';
                break;
            case 'low_stock':
                variant = 'warning';
                break;
            case 'out_of_stock':
                variant = 'danger';
                break;
            case 'discontinued':
                variant = 'info';
                break;
            default:
                variant = 'primary';
        }

        return (
            <Badge variant={variant} className="capitalize">
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const getTotalQuantity = (itemId: string) => {
        return stocks
            .filter(stock => stock.item_id === itemId)
            .reduce((sum, stock) => sum + stock.quantity, 0);
    };

    const stocksWithLocation = (item: Item) => {
        return (
            stocks
                .filter(stock => stock.item_id === item.id) // item_locations
                .flatMap(stock => locations
                    .filter(location => location.id === stock.location_id)
                    .map(location => ({...stock, location}))
                ));
    }

    const renderOverviewTable = () => (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('sku')}
                    >
                        <div className="flex items-center">
                            SKU {getSortIcon('sku')}
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                    >
                        <div className="flex items-center">
                            Name {getSortIcon('name')}
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Total Quantity</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.sku}</TableCell>
                            <TableCell>
                                <Link
                                    to={`/inventory/view/${item.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {item.name}
                                </Link>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {item.description}
                                </p>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={getTotalQuantity(item.id) < (item.minimum_stock || 0) ? 'warning' : 'success'}
                                >
                                    {getTotalQuantity(item.id)}
                                </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Link to={`/inventory/view/${item.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Eye size={16}/>}
                                        />
                                    </Link>

                                    {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.INVENTORY_MANAGER) && (
                                        <>
                                            <Link to={`/inventory/edit/${item.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Edit size={16}/>}
                                                />
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                leftIcon={<Trash size={16}/>}
                                                onClick={() => handleDelete(item.id)}
                                            />
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Search size={48} className="mb-2 text-gray-300"/>
                                <p className="text-lg">No items found</p>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    const renderDetailedTable = () => (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('sku')}
                    >
                        <div className="flex items-center">
                            SKU {getSortIcon('sku')}
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                    >
                        <div className="flex items-center">
                            Name {getSortIcon('name')}
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Quantity</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => ( // item -> item.locations
                        stocks.filter(stock => stock.item_id === item.id).length > 0 ? (
                            stocksWithLocation(item)
                                .map((stockNLocation, idx) => (
                                    <TableRow key={`${item.id}-${idx}`}>
                                        <TableCell className="font-medium">{item.sku}</TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/inventory/view/${item.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">
                                                {item.description}
                                            </p>
                                        </TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>
                                            {stockNLocation.location.building} &gt; {stockNLocation.location.room} &gt; {stockNLocation.location.unit}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={stockNLocation.quantity < (item.minimum_stock || 0) ? 'warning' : 'success'}
                                            >
                                                {stockNLocation.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(stockNLocation.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link to={`/inventory/view/${item.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        leftIcon={<Eye size={16}/>}
                                                    />
                                                </Link>

                                                {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.INVENTORY_MANAGER) && (
                                                    <>
                                                        <Link to={`/inventory/edit/${item.id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                leftIcon={<Edit size={16}/>}
                                                            />
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            leftIcon={<Trash size={16}/>}
                                                            onClick={() => /* handleDelete(item.id) */ {
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.sku}</TableCell>
                                <TableCell>
                                    <Link
                                        to={`/inventory/view/${item.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>No Location</TableCell>
                                <TableCell>
                                    <Badge variant="danger">0</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Link to={`/inventory/view/${item.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                leftIcon={<Eye size={16}/>}
                                            />
                                        </Link>

                                        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.INVENTORY_MANAGER) && (
                                            <>
                                                <Link to={`/inventory/edit/${item.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        leftIcon={<Edit size={16}/>}
                                                    />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Trash size={16}/>}
                                                    onClick={() => /* handleDelete(item.id) */ {
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Search size={48} className="mb-2 text-gray-300"/>
                                <p className="text-lg">No items found</p>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <CardTitle>Inventory Items</CardTitle>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={viewMode === 'overview' ? <LayoutGrid size={16}/> : <LayoutList size={16}/>}
                            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                        >
                            {viewMode === 'overview' ? 'Overview' : 'Detailed View'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Download size={16}/>}
                        >
                            Export
                        </Button>
                        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.INVENTORY_MANAGER) && (
                            <Link to="/inventory/add">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Plus size={16}/>}
                                >
                                    Add Item
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name, SKU, description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                leftAddon={<Search size={16}/>}
                                fullWidth
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div>
                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Filter size={16}/>}
                                onClick={() => {
                                    setSelectedCategory('');
                                    setStatusFilter('');
                                    setSearchTerm('');
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {viewMode === 'overview' ? renderOverviewTable() : renderDetailedTable()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryListPage;