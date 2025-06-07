import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, Plus, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import useItems from '../hooks/useItems';
import useStocks from '../hooks/useStocks';

const InventoryListPage: React.FC = () => {
    const { items, getTotalQuantity } = useItems();
    const { stocks } = useStocks();

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
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search items by name, SKU, or manufacturer..."
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline">Filter</Button>
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
                                <TableHeaderCell>SKU</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Category</TableHeaderCell>
                                <TableHeaderCell>Stock</TableHeaderCell>
                                <TableHeaderCell>Unit Cost</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.sku}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.description}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>Electronic Components</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryListPage;