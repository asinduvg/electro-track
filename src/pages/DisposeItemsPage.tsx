import React, {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Package, Search, Save, Trash2} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';
import {getItems, createTransaction} from '../lib/api';
import type {Database} from '../lib/database.types';

type Item = Database['public']['Tables']['items']['Row'];

interface DisposeItem {
    id: string;
    quantity: number;
    reason: string;
    notes: string;
}

const DISPOSAL_REASONS = [
    'Damaged',
    'Expired',
    'Obsolete',
    'Defective',
    'Lost',
    'Other'
] as const;

const DisposeItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {currentUser} = useAuth();

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<DisposeItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadItems();

        // If itemId is provided in URL, pre-select that item
        const itemId = searchParams.get('itemId');
        if (itemId) {
            const item = items.find(i => i.id === itemId);
            if (item) {
                setSelectedItems([{
                    id: itemId,
                    quantity: 1,
                    reason: '',
                    notes: ''
                }]);
            }
        }
    }, [searchParams, items]);

    const loadItems = async () => {
        try {
            const data = await getItems();
            setItems(data);
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load inventory items');
        }
    };

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
                reason: '',
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

    const handleReasonChange = (itemId: string, reason: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? {...item, reason} : item
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
            setError('You must be logged in to dispose items');
            return;
        }

        if (selectedItems.length === 0) {
            setError('Please select at least one item to dispose');
            return;
        }

        const invalidItems = selectedItems.filter(selectedItem => {
            const item = items.find(i => i.id === selectedItem.id);
            return !item ||
                selectedItem.quantity <= 0 ||
                selectedItem.quantity > item.quantity ||
                !selectedItem.reason;
        });

        if (invalidItems.length > 0) {
            setError('Please ensure all items have valid quantities and disposal reasons');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Create dispose transactions for each item
            for (const item of selectedItems) {
                await createTransaction({
                    type: 'dispose',
                    item_id: item.id,
                    quantity: item.quantity,
                    from_location_id: items.find(i => i.id === item.id)?.location_id || null,
                    performed_by: currentUser.id,
                    notes: `Reason: ${item.reason}${item.notes ? `\nNotes: ${item.notes}` : ''}`
                });
            }

            navigate('/inventory/items');
        } catch (err) {
            console.error('Error disposing items:', err);
            setError('Failed to process disposal transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dispose Items</h1>
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
                                        <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                                        <p className="text-lg">No items selected</p>
                                        <p className="text-sm">Search and select items to dispose below</p>
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
                                                        <Input
                                                            label="Quantity"
                                                            type="number"
                                                            min="1"
                                                            max={item.quantity}
                                                            value={selectedItem.quantity}
                                                            onChange={(e) => handleQuantityChange(
                                                                item.id,
                                                                parseInt(e.target.value) || 0
                                                            )}
                                                            required
                                                            helperText={`Available: ${item.quantity}`}
                                                        />

                                                        <div>
                                                            <label
                                                                className="block text-sm font-medium text-gray-700 mb-1">
                                                                Disposal Reason
                                                            </label>
                                                            <select
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                                value={selectedItem.reason}
                                                                onChange={(e) => handleReasonChange(item.id, e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Reason</option>
                                                                {DISPOSAL_REASONS.map((reason) => (
                                                                    <option key={reason} value={reason}>
                                                                        {reason}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-span-2">
                                                            <Input
                                                                label="Additional Notes"
                                                                value={selectedItem.notes}
                                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                                placeholder="Optional details about the disposal"
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
                                            <TableHeaderCell>Location</TableHeaderCell>
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
                                                        {item.location ? (
                                                            `${item.location.building} > ${item.location.room} > ${item.location.unit}`
                                                        ) : (
                                                            'No Location'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={item.quantity < (item.minimum_stock || 0) ? 'warning' : 'success'}
                                                        >
                                                            {item.quantity}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddItem(item)}
                                                            disabled={item.quantity <= 0}
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
                            <CardTitle>Disposal Summary</CardTitle>
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

                                <div>
                                    <p className="text-sm text-gray-500">Total Value</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        -${selectedItems.reduce((sum, selected) => {
                                        const item = items.find(i => i.id === selected.id);
                                        return sum + (item ? item.unit_cost * selected.quantity : 0);
                                    }, 0).toFixed(2)}
                                    </p>
                                </div>

                                <hr className="my-6"/>

                                <Button
                                    type="submit"
                                    variant="danger"
                                    fullWidth
                                    size="lg"
                                    isLoading={isSubmitting}
                                    leftIcon={<Trash2 className="h-5 w-5"/>}
                                    disabled={selectedItems.length === 0}
                                >
                                    Complete Disposal
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

export default DisposeItemsPage;