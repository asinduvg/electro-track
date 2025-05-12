import React, {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Package, Search, Save, ArrowRight} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';
import type {Database} from '../lib/database.types';
import {useDatabase} from "../context/DatabaseContext.tsx";

type Item = Database['public']['Tables']['items']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface TransferItem {
    id: string;
    quantity: number;
    fromLocationId: string;
    toLocationId: string;
    notes: string;
}

const TransferItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {currentUser} = useAuth();

    const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {items, stocks, locations, createTransaction, refreshData} = useDatabase();

    useEffect(() => {
        // If itemId is provided in URL, pre-select that item
        const itemId = searchParams.get('itemId');
        if (itemId) {
            const item = items.find(i => i.id === itemId);
            if (item) {
                setSelectedItems([{
                    id: itemId,
                    quantity: 1,
                    fromLocationId: '',
                    toLocationId: '',
                    notes: ''
                }]);
            }
        }
    }, [searchParams, items]);

    const filteredItems = items.filter(item =>
        !selectedItems.some(selected => selected.id === item.id) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddItem = (item: Item) => {
        setSelectedItems([
            ...selectedItems,
            {
                id: item.id,
                quantity: 1,
                fromLocationId: '',
                toLocationId: '',
                notes: ''
            }
        ]);
        setSearchTerm('');
    };

    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? {...item, quantity} : item
        ));
    };

    const handleFromLocationChange = (itemId: string, locationId: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? {...item, fromLocationId: locationId} : item
        ));
    };

    const handleToLocationChange = (itemId: string, locationId: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? {...item, toLocationId: locationId} : item
        ));
    };

    const handleNotesChange = (itemId: string, notes: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? {...item, notes} : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to transfer items');
            return;
        }

        if (selectedItems.length === 0) {
            setError('Please select at least one item to transfer');
            return;
        }

        const invalidItems = selectedItems.filter(item =>
            item.quantity <= 0 ||
            !item.fromLocationId ||
            !item.toLocationId ||
            item.fromLocationId === item.toLocationId
        );

        if (invalidItems.length > 0) {
            setError('Please ensure all items have valid quantities and different source/destination locations');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Create transfer transactions for each item
            for (const item of selectedItems) {
                await createTransaction({
                    type: 'transfer',
                    item_id: item.id,
                    quantity: item.quantity,
                    from_location_id: item.fromLocationId,
                    to_location_id: item.toLocationId,
                    performed_by: currentUser.id,
                    notes: item.notes
                });
            }

            await refreshData('*');

            navigate('/inventory/items');
        } catch (err) {
            console.error('Error transferring items:', err);
            setError('Failed to process transfer transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTotalQuantity = (itemId: string) => {
        return stocks
            .filter(stock => stock.item_id === itemId)
            .reduce((sum, stock) => sum + stock.quantity, 0);
    }

    const availableLocations = (itemId: string): Location[] => {
        return stocks
            .filter(stock => stock.item_id === itemId && stock.quantity > 0)
            .flatMap(stock => locations
                .filter(location => location.id === stock.location_id)
            )
    }

    // const getDestinationLocations = (itemId: string, selectedItem: TransferItem): Location[] => {
    //     return locations
    //         .filter(location => location.id !== selectedItem.fromLocationId)
    //         .filter(location => {
    //             const stock = stocks.find(stock => stock.item_id === itemId && stock.location_id === location.id);
    //             return stock && stock.quantity > 0;
    //         });
    // }

    const getQtyInLocation = (itemId: string, locationId: string): number => {
        return stocks
            .filter(stock => (stock.item_id === itemId) && (stock.location_id === locationId))
            .reduce((sum, stock) => sum + stock.quantity, 0);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Transfer Items</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Package className="h-5 w-5 text-red-400"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Selected Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="mr-2 h-5 w-5 text-blue-600"/>
                                    Selected Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <ArrowRight className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                                        <p className="text-lg">No items selected</p>
                                        <p className="text-sm">Search and select items to transfer below</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedItems.map(selectedItem => {
                                            const item = items.find(i => i.id === selectedItem.id);
                                            if (!item) return null;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                SKU: {item.sku}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label
                                                                className="block text-sm font-medium text-gray-700 mb-1">
                                                                From Location
                                                            </label>
                                                            <select
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                value={selectedItem.fromLocationId}
                                                                onChange={(e) => handleFromLocationChange(item.id, e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Source Location</option>
                                                                {availableLocations(selectedItem.id).map((location) => (
                                                                    <option key={location.id} value={location.id}>
                                                                        {location.building} &gt; {location.room} &gt; {location.unit}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label
                                                                className="block text-sm font-medium text-gray-700 mb-1">
                                                                To Location
                                                            </label>
                                                            <select
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                value={selectedItem.toLocationId}
                                                                onChange={(e) => handleToLocationChange(item.id, e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Destination Location</option>
                                                                {locations.filter(location => location.id !== selectedItem.fromLocationId).map((location) => (
                                                                    <option
                                                                        key={location.id}
                                                                        value={location.id}
                                                                        disabled={location.id === selectedItem.fromLocationId}
                                                                    >
                                                                        {location.building} &gt; {location.room} &gt; {location.unit}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <Input
                                                                label="Quantity"
                                                                type="number"
                                                                min="1"
                                                                max={getQtyInLocation(selectedItem.id, selectedItem.fromLocationId)}
                                                                value={selectedItem.quantity > getQtyInLocation(selectedItem.id, selectedItem.fromLocationId) ? getQtyInLocation(selectedItem.id, selectedItem.fromLocationId) : selectedItem.quantity}
                                                                onChange={(e) => handleQuantityChange(
                                                                    item.id,
                                                                    (parseInt(e.target.value) || 0) > getQtyInLocation(selectedItem.id, selectedItem.fromLocationId) ? getQtyInLocation(selectedItem.id, selectedItem.fromLocationId) : (parseInt(e.target.value) || 0)
                                                                )}
                                                                required
                                                                helperText={`Available: ${getQtyInLocation(selectedItem.id, selectedItem.fromLocationId)}`}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Input
                                                                label="Notes"
                                                                value={selectedItem.notes}
                                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                                placeholder="Optional notes about this transfer"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Item Search */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <Input
                                        placeholder="Search by name or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        leftAddon={<Search className="h-5 w-5"/>}
                                    />
                                </div>

                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>SKU</TableHeaderCell>
                                            <TableHeaderCell>Name</TableHeaderCell>
                                            <TableHeaderCell>Stock</TableHeaderCell>
                                            <TableHeaderCell>Action</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.sku}</TableCell>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getTotalQuantity(item.id) === 0 ? 'danger' : getTotalQuantity(item.id) < (item.minimum_stock || 0) ? 'warning' : 'success'}
                                                        >
                                                            {getTotalQuantity(item.id)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddItem(item)}
                                                            disabled={getTotalQuantity(item.id) <= 0}
                                                        >
                                                            Select
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <p className="text-gray-500">No matching items found</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Total Items</p>
                                    <p className="text-2xl font-bold">
                                        {selectedItems.length}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Total Quantity</p>
                                    <p className="text-2xl font-bold">
                                        {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
                                    </p>
                                </div>

                                <hr className="my-6"/>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    isLoading={isSubmitting}
                                    leftIcon={<Save className="h-5 w-5"/>}
                                    disabled={selectedItems.length === 0}
                                >
                                    Complete Transfer
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    onClick={() => navigate('/inventory/items')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default TransferItemsPage;