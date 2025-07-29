import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Plus, Building, X, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import useLocations from '../hooks/useLocations';
import useStocks from '../hooks/useStocks';
import { LocationGridSkeleton } from '../components/ui/InventorySkeletons';

const LocationsPage: React.FC = () => {
  const { locations, createLocation, isLoading: locationsLoading } = useLocations();
  const { stocks } = useStocks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    building: '',
    room: '',
    unit: '',
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

  const getItemsInLocation = (locationId: string) => {
    return stocks.filter((stock) => stock.location_id === locationId).length;
  };

  if (locationsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Storage Locations</h1>
              <p className="mt-2 text-slate-600">Manage warehouse locations and storage units</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center bg-[#FF385C] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
          <LocationGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Storage Locations</h1>
            <p className="mt-2 text-slate-600">Manage warehouse locations and storage units</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-[#FF385C] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE5E9]">
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

        <Card className="border-0 bg-white shadow-lg">
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
                    <TableHeaderCell className="hidden text-slate-700 sm:table-cell">
                      Room
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-700">Unit</TableHeaderCell>
                    <TableHeaderCell className="hidden text-slate-700 md:table-cell">
                      Items Stored
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-700">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.length > 0 ? (
                    locations.map((location) => (
                      <TableRow
                        key={location.id}
                        className="border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        <TableCell className="text-slate-900">
                          <div>
                            <div className="font-medium">{location.building || 'N/A'}</div>
                            <div className="text-sm text-slate-500 sm:hidden">
                              {location.room ? `Room: ${location.room}` : 'No room specified'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-slate-700 sm:table-cell">
                          {location.room || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {location.unit}
                        </TableCell>
                        <TableCell className="hidden text-slate-600 md:table-cell">
                          <span className="text-slate-600">
                            {getItemsInLocation(location.id)} items
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to={`/locations/edit/${location.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 bg-white text-xs hover:bg-slate-50"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                            </Link>
                            <Link to={`/locations/view/${location.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hidden border-slate-200 bg-white text-xs hover:bg-slate-50 sm:inline-flex"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <MapPin className="mb-4 h-12 w-12 text-slate-400" />
                          <p className="text-slate-500">No locations found</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Add your first storage location to get started
                          </p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Add New Location</h3>
                <Button variant="outline" size="sm" onClick={resetForm} className="p-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Building</label>
                  <Input
                    placeholder="Enter building name (optional)"
                    value={newLocation.building}
                    onChange={(e) => setNewLocation({ ...newLocation, building: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Room</label>
                  <Input
                    placeholder="Enter room number (optional)"
                    value={newLocation.room}
                    onChange={(e) => setNewLocation({ ...newLocation, room: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter unit identifier (required)"
                    value={newLocation.unit}
                    onChange={(e) => setNewLocation({ ...newLocation, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={handleAddLocation}
                  disabled={!newLocation.unit.trim()}
                  className="flex-1 bg-[#FF385C] text-white hover:bg-[#E31C5F] disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                >
                  Create Location
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
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
