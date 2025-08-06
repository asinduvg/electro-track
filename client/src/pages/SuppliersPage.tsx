import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import { Plus, Search, Edit, Trash2, Star, Phone, Mail, Globe, Building2, X } from 'lucide-react';
import useSuppliers, { InsertSupplier } from '../hooks/useSuppliers';
import { useAuth } from '../context/AuthContext';

const SuppliersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InsertSupplier>({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    status: 'active',
    rating: 5,
    notes: '',
  });

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

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await createSupplier(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        status: 'active',
        rating: 5,
        notes: '',
      });
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateSupplier(selectedSupplier.id, formData);
      setShowEditModal(false);
      setSelectedSupplier(null);
      setFormData({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        status: 'active',
        rating: 5,
        notes: '',
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Failed to update supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await deleteSupplier(id);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier. Please try again.');
    }
  };

  const openEditModal = (supplier: any) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      website: supplier.website || '',
      status: supplier.status,
      rating: supplier.rating || 5,
      notes: supplier.notes || '',
    });
    setShowEditModal(true);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-[#717171]">No rating</span>;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-[#717171]">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222] dark:text-white">Suppliers</h1>
            <p className="mt-2 text-[#717171]">Manage your supplier relationships and contacts</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#717171]" />
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
                  <p className="text-2xl font-bold text-[#222222] dark:text-white">
                    {suppliers.length}
                  </p>
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
                  <p className="text-2xl font-bold text-[#008489]">
                    {suppliers.filter((s) => s.status === 'active').length}
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#008489]"></div>
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
                              <Globe className="mr-1 h-3 w-3" />
                              <a
                                href={supplier.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#FF385C]"
                              >
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
                                <Mail className="mr-1 h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>{renderStars(supplier.rating)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
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

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-[#2A2A2A]">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#222222] dark:text-white">
                    Add New Supplier
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Supplier Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Contact Person
                    </label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Business address"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'active' | 'inactive' | 'pending',
                        })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[#222222] dark:border-gray-600 dark:bg-[#2A2A2A] dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Rating (1-5)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-[#222222] dark:border-gray-600 dark:bg-[#2A2A2A] dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Supplier'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {showEditModal && selectedSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-[#2A2A2A]">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#222222] dark:text-white">
                    Edit Supplier
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleEditSupplier} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Supplier Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Contact Person
                    </label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Business address"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'active' | 'inactive' | 'pending',
                        })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[#222222] dark:border-gray-600 dark:bg-[#2A2A2A] dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Rating (1-5)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#222222] dark:text-white">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-[#222222] dark:border-gray-600 dark:bg-[#2A2A2A] dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Supplier'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
