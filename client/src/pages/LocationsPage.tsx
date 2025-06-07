import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { MapPin, Plus, Building } from 'lucide-react';
import useLocations from '../hooks/useLocations';

const LocationsPage: React.FC = () => {
    const { locations } = useLocations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Storage Locations</h1>
                <Button className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Building className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">{locations.length}</p>
                                <p className="text-gray-600">Total Locations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        All Locations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Building</TableHeaderCell>
                                <TableHeaderCell>Room</TableHeaderCell>
                                <TableHeaderCell>Unit</TableHeaderCell>
                                <TableHeaderCell>Items Stored</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {locations.map((location) => (
                                <TableRow key={location.id}>
                                    <TableCell className="font-medium">{location.building}</TableCell>
                                    <TableCell>{location.room}</TableCell>
                                    <TableCell>{location.unit}</TableCell>
                                    <TableCell>
                                        <span className="text-gray-600">0 items</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="outline" size="sm">View</Button>
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

export default LocationsPage;