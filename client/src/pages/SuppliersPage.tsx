import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Star, 
    Phone, 
    Mail, 
    Globe,
    Building2
} from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    notes?: string;
    created_at: Date;
}

const SuppliersPage: React.FC = () => {
    const [suppliers] = useState<Supplier[]>([
        {
            id: '1',
            name: 'TechCorp Components',
            contact_name: 'John Smith',
            email: 'john@techcorp.com',
            phone: '+1-555-0123',
            address: '123 Tech Street, Silicon Valley, CA',
            website: 'https://techcorp.com',
            status: 'active',
            rating: 5,
            notes: 'Reliable supplier for electronic components',
            created_at: new Date()
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="success">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const renderStars = (rating?: number) => {
        if (!rating) return <span className="text-[#717171]">No rating</span>;
        
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                ))}
                <span className="text-sm text-[#717171] ml-2">({rating}/5)</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] dark:text-white">Suppliers</h1>
                        <p className="mt-2 text-[#717171]">Manage your supplier relationships and contacts</p>
                    </div>
                    <Button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                {/* Search and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717171]" />
                                    <Input
                                        placeholder="Search suppliers..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Total Suppliers</p>
                                    <p className="text-2xl font-bold text-[#222222] dark:text-white">12</p>
                                </div>
                                <Building2 className="h-8 w-8 text-[#FF385C]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#717171]">Active Suppliers</p>
                                    <p className="text-2xl font-bold text-[#008489]">9</p>
                                </div>
                                <div className="h-3 w-3 bg-[#008489] rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Suppliers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5 text-[#FF385C]" />
                            All Suppliers ({suppliers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Supplier</TableHeaderCell>
                                        <TableHeaderCell>Contact</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell>Rating</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {suppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-[#222222] dark:text-white">
                                                        {supplier.name}
                                                    </div>
                                                    {supplier.website && (
                                                        <div className="flex items-center text-sm text-[#717171]">
                                                            <Globe className="h-3 w-3 mr-1" />
                                                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" 
                                                               className="hover:text-[#FF385C]">
                                                                {supplier.website}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {supplier.contact_name && (
                                                        <div className="text-sm text-[#222222] dark:text-white">
                                                            {supplier.contact_name}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col space-y-1 text-xs text-[#717171]">
                                                        {supplier.email && (
                                                            <div className="flex items-center">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {supplier.email}
                                                            </div>
                                                        )}
                                                        {supplier.phone && (
                                                            <div className="flex items-center">
                                                                <Phone className="h-3 w-3 mr-1" />
                                                                {supplier.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(supplier.status)}
                                            </TableCell>
                                            <TableCell>
                                                {renderStars(supplier.rating)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SuppliersPage;