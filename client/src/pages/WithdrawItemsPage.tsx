import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PackageMinus, Minus, ArrowLeft, Search, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useStocks from '../hooks/useStocks';
import useTransactions from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';

interface WithdrawItem {
    itemId: string;
    locationId: string;
    quantity: number;
    notes?: string;
}

const WithdrawItemsPage: React.FC = () => {
    const { items, getTotalQuantity, refreshItems } = useItems();
    const { locations } = useLocations();
    const { stocks, refreshStocks } = useStocks();
    const { createTransaction } = useTransactions();
    const { currentUser } = useAuth();
    const [withdrawItems, setWithdrawItems] = useState<WithdrawItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItemToWithdraw = (itemId: string) => {
        const existingIndex = withdrawItems.findIndex(wi => wi.itemId === itemId);
        if (existingIndex >= 0) {
            const updated = [...withdrawItems];
            updated[existingIndex].quantity += 1;
            setWithdrawItems(updated);
        } else {
            setWithdrawItems([...withdrawItems, {
                itemId,
                locationId: locations[0]?.id || '',
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

    const getItemStock = (itemId: string, locationId?: string) => {
        if (locationId) {
            const stock = stocks.find(s => s.item_id === itemId && s.location_id === locationId);
            return stock?.quantity || 0;
        }
        return getTotalQuantity(itemId, stocks);
    };

    const canWithdraw = (itemId: string, locationId: string, quantity: number) => {
        const availableStock = getItemStock(itemId, locationId);
        return availableStock >= quantity;
    };

    const handleSubmitWithdraw = async () => {
        if (withdrawItems.length === 0) return;
        if (!currentUser?.id) {
            alert('User not authenticated. Please log in.');
            return;
        }

        // Validate all items can be withdrawn
        for (const withdrawItem of withdrawItems) {
            if (!canWithdraw(withdrawItem.itemId, withdrawItem.locationId, withdrawItem.quantity)) {
                alert('Insufficient stock for one or more items. Please check quantities.');
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
            
            // Refresh data to reflect new stock levels
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/inventory/items" className="inventory-back-button">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Inventory
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Withdraw Items</h1>
                </div>
                

            </div>

            {/* Search Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Search className="mr-2 h-5 w-5" />
                        Select Items to Withdraw
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search items by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                    
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>SKU</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Total Stock</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems.slice(0, 10).map((item) => {
                                const totalStock = getTotalQuantity(item.id, stocks);
                                const isLowStock = totalStock <= (item.minimum_stock || 1);
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
                                            <span className={`font-medium ${
                                                totalStock === 0 ? 'text-red-600' : 
                                                isLowStock ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                                {totalStock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {totalStock === 0 ? (
                                                <Badge variant="danger">Out of Stock</Badge>
                                            ) : isLowStock ? (
                                                <Badge variant="warning">Low Stock</Badge>
                                            ) : (
                                                <Badge variant="success">Available</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => addItemToWithdraw(item.id)}
                                                disabled={totalStock === 0}
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
                </CardContent>
            </Card>

            {/* Items to Withdraw */}
            {withdrawItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PackageMinus className="mr-2 h-5 w-5" />
                            Items to Withdraw ({withdrawItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Item</TableHeaderCell>
                                    <TableHeaderCell>Quantity</TableHeaderCell>
                                    <TableHeaderCell>From Location</TableHeaderCell>
                                    <TableHeaderCell>Available</TableHeaderCell>
                                    <TableHeaderCell>Notes</TableHeaderCell>
                                    <TableHeaderCell className="w-12">&nbsp;</TableHeaderCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {withdrawItems.map((withdrawItem, index) => {
                                    const item = items.find(i => i.id === withdrawItem.itemId);
                                    const availableStock = getItemStock(withdrawItem.itemId, withdrawItem.locationId);
                                    const isValidQuantity = canWithdraw(withdrawItem.itemId, withdrawItem.locationId, withdrawItem.quantity);
                                    
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item?.name}</div>
                                                    <div className="text-sm text-gray-500">{item?.sku}</div>
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
                                                <span className={`font-medium ${
                                                    availableStock === 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {availableStock}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Optional notes..."
                                                    value={withdrawItem.notes || ''}
                                                    onChange={(e) => updateWithdrawItem(index, 'notes', e.target.value)}
                                                    className="w-32"
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
    );
};

export default WithdrawItemsPage;