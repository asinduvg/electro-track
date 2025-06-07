import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Plus, Building, X } from 'lucide-react';
import useLocations from '../hooks/useLocations';

const LocationsPage: React.FC = () => {
    const { locations, createLocation } = useLocations();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        building: '',
        room: '',
        unit: ''
    });

    const handleAddLocation = async () => {
        if (!newLocation.unit.trim()) return;
        
        try {
            await createLocation(newLocation);
            setNewLocation({ building: '', room: '', unit: '' });
            setShowAddModal(false);
        } catch (error) {
            console.error('Failed to create location:', error);
        }
    };

    const resetForm = () => {
        setNewLocation({ building: '', room: '', unit: '' });
        setShowAddModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Storage Locations</h1>
                        <p className="mt-2 text-slate-600">Manage warehouse locations and storage units</p>
                    </div>
                    <Button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#FFE5E9] rounded-xl flex items-center justify-center mr-4">
                                    <Building className="h-6 w-6 text-[#FF385C]" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900">{locations.length}</p>
                                    <p className="text-slate-600">Total Locations</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-900">
                            <MapPin className="mr-2 h-5 w-5 text-[#FF385C]" />
                            All Locations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow className="border-slate-200">
                                        <TableHeaderCell className="text-slate-700">Building</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden sm:table-cell">Room</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Unit</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden md:table-cell">Items Stored</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {locations.length > 0 ? (
                                        locations.map((location) => (
                                            <TableRow key={location.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                                <TableCell className="text-slate-900">
                                                    <div>
                                                        <div className="font-medium">{location.building || 'N/A'}</div>
                                                        <div className="text-sm text-slate-500 sm:hidden">
                                                            {location.room ? `Room: ${location.room}` : 'No room specified'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-700 hidden sm:table-cell">{location.room || 'N/A'}</TableCell>
                                                <TableCell className="font-medium text-slate-900">{location.unit}</TableCell>
                                                <TableCell className="text-slate-600 hidden md:table-cell">
                                                    <span className="text-slate-600">0 items</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 text-xs">
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 text-xs hidden sm:inline-flex">
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <MapPin className="h-12 w-12 text-slate-400 mb-4" />
                                                    <p className="text-slate-500">No locations found</p>
                                                    <p className="text-sm text-slate-400 mt-1">Add your first storage location to get started</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Location Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Add New Location</h3>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={resetForm}
                                    className="p-1"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Building
                                    </label>
                                    <Input
                                        placeholder="Enter building name (optional)"
                                        value={newLocation.building}
                                        onChange={(e) => setNewLocation({...newLocation, building: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Room
                                    </label>
                                    <Input
                                        placeholder="Enter room number (optional)"
                                        value={newLocation.room}
                                        onChange={(e) => setNewLocation({...newLocation, room: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Unit <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Enter unit identifier (required)"
                                        value={newLocation.unit}
                                        onChange={(e) => setNewLocation({...newLocation, unit: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                                <Button 
                                    onClick={handleAddLocation}
                                    disabled={!newLocation.unit.trim()}
                                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                                >
                                    Create Location
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={resetForm}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationsPage;