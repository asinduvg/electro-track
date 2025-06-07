import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { MapPin, Plus, Building } from 'lucide-react';
import useLocations from '../hooks/useLocations';

const LocationsPage: React.FC = () => {
    const { locations } = useLocations();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Storage Locations</h1>
                        <p className="mt-2 text-slate-600">Manage warehouse locations and storage units</p>
                    </div>
                    <Button className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                                    <Building className="h-6 w-6 text-emerald-600" />
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
                            <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
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
            </div>
        </div>
    );
};

export default LocationsPage;