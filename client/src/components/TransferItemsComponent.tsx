import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './ui/Table';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { ArrowRightLeft, Search, AlertTriangle, X } from 'lucide-react';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useStocks from '../hooks/useStocks';
import useTransactions from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import { TransferItemsSkeleton } from './ui/InventorySkeletons';

interface TransferItem {
    itemId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    notes?: string;
}

const TransferItemsComponent: React.FC = () => {
    const { items, getTotalQuantity, refreshItems, isLoading: itemsLoading } = useItems();
    const { locations, isLoading: locationsLoading } = useLocations();
    const { stocks, refreshStocks, isLoading: stocksLoading } = useStocks();
    const { createTransaction } = useTransactions();
    const { currentUser } = useAuth();
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isLoading = itemsLoading || locationsLoading || stocksLoading;

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItemToTransfer = (itemId: string) => {
        const existingIndex = transferItems.findIndex(ti => ti.itemId === itemId);
        if (existingIndex >= 0) {
            const updated = [...transferItems];
            updated[existingIndex].quantity += 1;
            setTransferItems(updated);
        } else {
            setTransferItems([...transferItems, {
                itemId,
                fromLocationId: locations[0]?.id || '',
                toLocationId: locations[1]?.id || locations[0]?.id || '',
                quantity: 1,
                notes: ''
            }]);
        }
    };

    const updateTransferItem = (index: number, field: keyof TransferItem, value: any) => {
        const updated = [...transferItems];
        updated[index] = { ...updated[index], [field]: value };
        setTransferItems(updated);
    };

    const removeTransferItem = (index: number) => {
        setTransferItems(transferItems.filter((_, i) => i !== index));
    };

    const getItemStock = (itemId: string, locationId: string) => {
        const stock = stocks.find(s => s.item_id === itemId && s.location_id === locationId);
        return stock?.quantity || 0;
    };

    const canTransfer = (itemId: string, fromLocationId: string, quantity: number) => {
        const availableStock = getItemStock(itemId, fromLocationId);
        return availableStock >= quantity;
    };

    const isValidTransfer = (fromLocationId: string, toLocationId: string) => {
        return fromLocationId !== toLocationId;
    };

    const handleSubmitTransfer = async () => {
        if (transferItems.length === 0) return;
        if (!currentUser?.id) {
            alert('User not authenticated. Please log in.');
            return;
        }

        for (const transferItem of transferItems) {
            if (!canTransfer(transferItem.itemId, transferItem.fromLocationId, transferItem.quantity)) {
                alert('Insufficient stock in source location for one or more items.');
                return;
            }
            if (!isValidTransfer(transferItem.fromLocationId, transferItem.toLocationId)) {
                alert('Source and destination locations must be different.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            for (const transferItem of transferItems) {
                await createTransaction({
                    item_id: transferItem.itemId,
                    type: 'transfer',
                    quantity: transferItem.quantity,
                    from_location_id: transferItem.fromLocationId,
                    to_location_id: transferItem.toLocationId,
                    notes: transferItem.notes || `Transferred ${transferItem.quantity} units`,
                    performed_by: currentUser.id
                });
            }
            
            await refreshItems();
            await refreshStocks();
            
            setTransferItems([]);
            alert('Items transferred successfully!');
        } catch (error) {
            console.error('Error transferring items:', error);
            alert('Failed to transfer items. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <TransferItemsSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Transfer Items</h1>
                        <p className="mt-2 text-slate-600">Move items between locations</p>
                    </div>
                </div>

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
                        </div>
                    </CardContent>
                </Card>

                <div className="mb-6">
                    <p className="text-slate-600">
                        Showing {filteredItems.slice(0, 10).length} of {filteredItems.length} items
                    </p>
                </div>

                <Card className="bg-white border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            Select Items to Transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead className="bg-slate-50">
                                    <TableRow>
                                        <TableHeaderCell className="text-slate-700 font-semibold">SKU</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Name</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Total Stock</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Locations</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredItems.slice(0, 10).map((item) => {
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
                                                    <span className="font-medium text-blue-600">{totalStock}</span>
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
                                                        onClick={() => addItemToTransfer(item.id)}
                                                        disabled={totalStock === 0}
                                                        className="bg-white border-slate-200 hover:bg-slate-50 text-xs"
                                                    >
                                                        ⇄ Transfer
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

                {transferItems.length > 0 && (
                    <Card className="bg-white border-0 shadow-lg mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ArrowRightLeft className="mr-2 h-5 w-5" />
                                Items to Transfer ({transferItems.length})
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
                                            <TableHeaderCell className="text-slate-700 font-semibold">To Location</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Available</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Notes</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transferItems.map((transferItem, index) => {
                                            const item = items.find(i => i.id === transferItem.itemId);
                                            const availableStock = getItemStock(transferItem.itemId, transferItem.fromLocationId);
                                            const isValidQuantity = canTransfer(transferItem.itemId, transferItem.fromLocationId, transferItem.quantity);
                                            const isValidLocations = isValidTransfer(transferItem.fromLocationId, transferItem.toLocationId);
                                            
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
                                                            value={transferItem.quantity}
                                                            onChange={(e) => updateTransferItem(index, 'quantity', parseInt(e.target.value) || 0)}
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
                                                            value={transferItem.fromLocationId}
                                                            onChange={(e) => updateTransferItem(index, 'fromLocationId', e.target.value)}
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
                                                        <select
                                                            value={transferItem.toLocationId}
                                                            onChange={(e) => updateTransferItem(index, 'toLocationId', e.target.value)}
                                                            className={`px-3 py-2 border border-gray-300 rounded-md ${
                                                                !isValidLocations ? 'border-red-500' : ''
                                                            }`}
                                                        >
                                                            {locations.map((location) => (
                                                                <option key={location.id} value={location.id}>
                                                                    {location.unit}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {!isValidLocations && (
                                                            <div className="flex items-center text-red-500 text-xs mt-1">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Same location
                                                            </div>
                                                        )}
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
                                                            value={transferItem.notes || ''}
                                                            onChange={(e) => updateTransferItem(index, 'notes', e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => removeTransferItem(index)}
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
                
                {transferItems.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Button 
                            onClick={handleSubmitTransfer}
                            disabled={isSubmitting}
                            className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-lg px-6 py-3 text-lg font-semibold rounded-lg"
                            size="lg"
                        >
                            <ArrowRightLeft className="h-5 w-5 mr-2" />
                            {isSubmitting ? 'Processing...' : `Transfer ${transferItems.length} Items`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferItemsComponent;
