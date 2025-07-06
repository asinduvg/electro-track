import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PackageCheck, Plus, Search, X } from 'lucide-react';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useTransactions from '../hooks/useTransactions';
import useStocks from '../hooks/useStocks';
import { useAuth } from '../context/AuthContext';
import { ReceiveItemsSkeleton } from '../components/ui/InventorySkeletons';

interface ReceiveItem {
    itemId: string;
    locationId: string;
    quantity: number;
    notes?: string;
}

const ReceiveItemsPage: React.FC = () => {
    const { items, getTotalQuantity, refreshItems, isLoading: itemsLoading } = useItems();
    const { locations, isLoading: locationsLoading } = useLocations();
    const { createTransaction } = useTransactions();
    const { stocks, refreshStocks, isLoading: stocksLoading } = useStocks();
    const { currentUser } = useAuth();
    const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isLoading = itemsLoading || locationsLoading || stocksLoading;

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItemToReceive = (itemId: string) => {
        const existingIndex = receiveItems.findIndex(ri => ri.itemId === itemId);
        if (existingIndex >= 0) {
            const updated = [...receiveItems];
            updated[existingIndex].quantity += 1;
            setReceiveItems(updated);
        } else {
            setReceiveItems([...receiveItems, {
                itemId,
                locationId: locations[0]?.id || '',
                quantity: 1,
                notes: ''
            }]);
        }
    };

    const updateReceiveItem = (index: number, field: keyof ReceiveItem, value: any) => {
        const updated = [...receiveItems];
        updated[index] = { ...updated[index], [field]: value };
        setReceiveItems(updated);
    };

    const removeReceiveItem = (index: number) => {
        setReceiveItems(receiveItems.filter((_, i) => i !== index));
    };

    const handleSubmitReceive = async () => {
        if (receiveItems.length === 0) return;
        if (!currentUser?.id) {
            alert('User not authenticated. Please log in.');
            return;
        }

        setIsSubmitting(true);
        try {
            for (const receiveItem of receiveItems) {
                await createTransaction({
                    item_id: receiveItem.itemId,
                    type: 'receive',
                    quantity: receiveItem.quantity,
                    to_location_id: receiveItem.locationId,
                    notes: receiveItem.notes || `Received ${receiveItem.quantity} units`,
                    performed_by: currentUser.id
                });
            }
            
            await refreshItems();
            await refreshStocks();
            
            setReceiveItems([]);
            alert('Items received successfully!');
        } catch (error) {
            console.error('Error receiving items:', error);
            alert('Failed to receive items. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <ReceiveItemsSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Receive Items</h1>
                        <p className="mt-2 text-slate-600">Add new stock to your inventory</p>
                    </div>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-slate-600">
                        Showing {filteredItems.slice(0, 10).length} of {filteredItems.length} items
                    </p>
                </div>

                {/* Items Table */}
                <Card className="bg-white border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            Select Items to Receive
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead className="bg-slate-50">
                                    <TableRow>
                                        <TableHeaderCell className="text-slate-700 font-semibold">SKU</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Name</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Current Stock</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredItems.slice(0, 10).map((item) => (
                                        <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium text-slate-900">{item.sku}</TableCell>
                                            <TableCell className="text-slate-900">
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-slate-500">{item.description}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{getTotalQuantity(item.id, stocks)} units</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => addItemToReceive(item.id)}
                                                    className="bg-white border-slate-200 hover:bg-slate-50 text-xs"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Items to Receive */}
                {receiveItems.length > 0 && (
                    <Card className="bg-white border-0 shadow-lg mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PackageCheck className="mr-2 h-5 w-5" />
                                Items to Receive ({receiveItems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHead className="bg-slate-50">
                                        <TableRow>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Item</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Quantity</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Location</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Notes</TableHeaderCell>
                                            <TableHeaderCell className="text-slate-700 font-semibold">Actions</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {receiveItems.map((receiveItem, index) => {
                                            const item = items.find(i => i.id === receiveItem.itemId);
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
                                                            value={receiveItem.quantity}
                                                            onChange={(e) => updateReceiveItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            className="w-20"
                                                            min="1"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            value={receiveItem.locationId}
                                                            onChange={(e) => updateReceiveItem(index, 'locationId', e.target.value)}
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
                                                        <Input
                                                            placeholder="Optional notes..."
                                                            value={receiveItem.notes || ''}
                                                            onChange={(e) => updateReceiveItem(index, 'notes', e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => removeReceiveItem(index)}
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
                
                {/* Floating Receive Button */}
                {receiveItems.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <Button 
                            onClick={handleSubmitReceive}
                            disabled={isSubmitting}
                            className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-lg px-6 py-3 text-lg font-semibold rounded-lg"
                            size="lg"
                        >
                            <PackageCheck className="h-5 w-5 mr-2" />
                            {isSubmitting ? 'Processing...' : `Receive ${receiveItems.length} Items`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiveItemsPage;