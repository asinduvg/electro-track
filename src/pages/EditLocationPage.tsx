import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Location = Database['public']['Tables']['locations']['Row'];

const EditLocationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<Location | null>(null);

    useEffect(() => {
        loadLocation();
    }, [id]);

    const loadLocation = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setLocation(data);
        } catch (err) {
            console.error('Error loading location:', err);
            setError('Failed to load location details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            setError('You must be logged in to edit locations');
            return;
        }

        if (!location?.unit.trim()) {
            setError('Unit name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const { error: updateError } = await supabase
                .from('locations')
                .update({
                    building: location.building,
                    room: location.room,
                    unit: location.unit,
                    updated_by: currentUser.id,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            navigate('/locations');
        } catch (err) {
            console.error('Error updating location:', err);
            setError('Failed to update location');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'inventory_manager')) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-700">Access Denied</h2>
                <p className="mt-2 text-gray-500">
                    You don't have permission to edit storage locations.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-700">Location Not Found</h2>
                <p className="mt-2 text-gray-500">
                    The location you are trying to edit does not exist.
                </p>
                <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => navigate('/locations')}
                >
                    Back to Locations
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Location</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Building"
                                value={location.building || ''}
                                onChange={(e) => setLocation({ ...location, building: e.target.value })}
                                placeholder="e.g., Main Warehouse"
                            />
                            <Input
                                label="Room"
                                value={location.room || ''}
                                onChange={(e) => setLocation({ ...location, room: e.target.value })}
                                placeholder="e.g., Storage Room A"
                            />
                            <Input
                                label="Unit"
                                value={location.unit}
                                onChange={(e) => setLocation({ ...location, unit: e.target.value })}
                                placeholder="e.g., Shelf A1"
                                required
                                helperText="Specific storage unit identifier (required)"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/locations')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                leftIcon={<Save size={16} />}
                                isLoading={isSubmitting}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditLocationPage;