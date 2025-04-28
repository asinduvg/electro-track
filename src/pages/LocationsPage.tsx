import React, {useState, useEffect} from 'react';
import {MapPin, Plus, Edit, Trash2, Search, Package} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';
import {getLocations, createLocation, getItems} from '../lib/api';
import type {Database} from '../lib/database.types';

type Location = Database['public']['Tables']['locations']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

interface LocationWithItemCount extends Location {
    itemCount: number;
    totalValue: number;
}

const LocationsPage: React.FC = () => {
    const {currentUser} = useAuth();
    const [locations, setLocations] = useState<LocationWithItemCount[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New Location Form State
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocation, setNewLocation] = useState({
        building: '',
        room: '',
        unit: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [locationsData, itemsData] = await Promise.all([
                getLocations(),
                getItems()
            ]);

            // Calculate item counts and total values for each location
            const locationsWithCounts = locationsData.map(location => {
                const locationItems = itemsData.filter(item => item.location_id === location.id);
                return {
                    ...location,
                    itemCount: locationItems.length,
                    totalValue: locationItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
                };
            });

            setLocations(locationsWithCounts);
            setItems(itemsData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load locations data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLocation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newLocation.unit.trim()) {
            setError('Unit name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await createLocation(newLocation);
            await loadData();

            setIsAddingLocation(false);
            setNewLocation({building: '', room: '', unit: ''});
        } catch (err) {
            console.error('Error creating location:', err);
            setError('Failed to create location');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLocations = locations.filter(location => {
        const searchStr = searchTerm.toLowerCase();
        return (
            location.building?.toLowerCase().includes(searchStr) ||
            location.room?.toLowerCase().includes(searchStr) ||
            location.unit.toLowerCase().includes(searchStr)
        );
    });

    const canManageLocations = currentUser?.role === 'admin' || currentUser?.role === 'inventory_manager';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Storage Locations</h1>
                {canManageLocations && (
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={16}/>}
                        onClick={() => setIsAddingLocation(true)}
                    >
                        Add Location
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <MapPin className="h-5 w-5 text-red-400"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 font-medium">Total Locations</p>
                                <p className="text-3xl font-bold mt-1">{locations.length}</p>
                            </div>
                            <div className="bg-blue-700 p-3 rounded-full">
                                <MapPin size={24}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-700 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-200 font-medium">Total Items Stored</p>
                                <p className="text-3xl font-bold mt-1">
                                    {items.length}
                                </p>
                            </div>
                            <div className="bg-green-600 p-3 rounded-full">
                                <Package size={24}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-800 to-purple-700 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-200 font-medium">Total Inventory Value</p>
                                <p className="text-3xl font-bold mt-1">
                                    ${locations.reduce((sum, loc) => sum + loc.totalValue, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-purple-700 p-3 rounded-full">
                                <Package size={24}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Location Form */}
            {isAddingLocation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateLocation} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Building"
                                    value={newLocation.building}
                                    onChange={(e) => setNewLocation({...newLocation, building: e.target.value})}
                                    placeholder="e.g., Main Warehouse"
                                />
                                <Input
                                    label="Room"
                                    value={newLocation.room}
                                    onChange={(e) => setNewLocation({...newLocation, room: e.target.value})}
                                    placeholder="e.g., Storage Room A"
                                />
                                <Input
                                    label="Unit"
                                    value={newLocation.unit}
                                    onChange={(e) => setNewLocation({...newLocation, unit: e.target.value})}
                                    placeholder="e.g., Shelf A1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddingLocation(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                >
                                    Create Location
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Locations List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftAddon={<Search className="h-5 w-5"/>}
                        />
                    </div>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Building</TableHeaderCell>
                                <TableHeaderCell>Room</TableHeaderCell>
                                <TableHeaderCell>Unit</TableHeaderCell>
                                <TableHeaderCell>Items Stored</TableHeaderCell>
                                <TableHeaderCell>Total Value</TableHeaderCell>
                                {canManageLocations && <TableHeaderCell>Actions</TableHeaderCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLocations.length > 0 ? (
                                filteredLocations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell>{location.building || '-'}</TableCell>
                                        <TableCell>{location.room || '-'}</TableCell>
                                        <TableCell className="font-medium">{location.unit}</TableCell>
                                        <TableCell>
                                            <Badge variant={location.itemCount > 0 ? 'success' : 'secondary'}>
                                                {location.itemCount} items
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${location.totalValue.toLocaleString()}</TableCell>
                                        {canManageLocations && (
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        leftIcon={<Edit size={16}/>}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        leftIcon={<Trash2 size={16}/>}
                                                        disabled={location.itemCount > 0}
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={canManageLocations ? 6 : 5}
                                        className="text-center py-8"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <MapPin size={48} className="mb-2 text-gray-300"/>
                                            <p className="text-lg">No locations found</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {searchTerm
                                                    ? 'Try adjusting your search terms'
                                                    : 'Add your first storage location to get started'
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default LocationsPage;