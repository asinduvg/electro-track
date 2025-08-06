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
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Plus, UserCheck, Edit, Shield, Mail, Phone } from 'lucide-react';
import useUsers from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

const UsersPage: React.FC = () => {
  const { users, updateUser } = useUsers();
  const { currentUser } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'department_user',
    department: '',
    phone: '',
  });

  const isAdmin = currentUser?.role === 'admin';
  const canEditUsers = isAdmin || currentUser?.role === 'inventory_manager';

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      const newUser = await apiClient.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        password: 'defaultpassword123',
      });

      if (newUser) {
        window.location.reload();
      }
      setIsCreateDialogOpen(false);
      setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      await updateUser(selectedUser.id, {
        ...formData,
        role: formData.role as
          | 'admin'
          | 'inventory_manager'
          | 'warehouse_staff'
          | 'department_user',
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'department_user',
      department: user.department || '',
      phone: user.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">Admin</Badge>;
      case 'inventory_manager':
        return <Badge variant="primary">Manager</Badge>;
      case 'warehouse_staff':
        return <Badge variant="success">Warehouse</Badge>;
      case 'department_user':
        return <Badge variant="secondary">Department</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="mt-2 text-slate-600">Manage system users and permissions</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
            />
            {canEditUsers && (
              <Button
                className="flex items-center bg-[#FF385C] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE5E9]">
                  <UserCheck className="h-6 w-6 text-[#FF385C]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                  <p className="text-slate-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Users className="mr-2 h-5 w-5 text-[#FF385C]" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow className="border-slate-200">
                    <TableHeaderCell className="text-slate-700">Name</TableHeaderCell>
                    <TableHeaderCell className="hidden text-slate-700 sm:table-cell">
                      Email
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-700">Role</TableHeaderCell>
                    <TableHeaderCell className="hidden text-slate-700 md:table-cell">
                      Department
                    </TableHeaderCell>
                    <TableHeaderCell className="hidden text-slate-700 lg:table-cell">
                      Last Login
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-700">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        <TableCell className="text-slate-900">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-slate-500 sm:hidden">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-slate-700 sm:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="hidden text-slate-700 md:table-cell">
                          {user.department || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden text-slate-600 lg:table-cell">
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canEditUsers && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="border-slate-200 bg-white text-xs hover:bg-slate-50"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 bg-white text-xs hover:bg-slate-50"
                                onClick={() => alert('Permissions functionality - coming soon')}
                              >
                                <Shield className="mr-1 h-3 w-3" />
                                <span className="hidden sm:inline">Perms</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="mb-4 h-12 w-12 text-slate-400" />
                          <p className="text-slate-500">No users found</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Try adjusting your search criteria
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

        {/* Add User Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Add New User</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="department_user">Department User</option>
                    <option value="warehouse_staff">Warehouse Staff</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    {isAdmin && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={handleCreateUser}
                  disabled={isLoading}
                  className="flex-1 bg-[#FF385C] text-white shadow-lg hover:bg-[#E31C5F] hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({
                      name: '',
                      email: '',
                      role: 'department_user',
                      department: '',
                      phone: '',
                    });
                  }}
                  className="flex-1 border-slate-200 bg-white hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditDialogOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="department_user">Department User</option>
                    <option value="warehouse_staff">Warehouse Staff</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    {isAdmin && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={handleEditUser}
                  disabled={isLoading}
                  className="flex-1 bg-[#FF385C] text-white shadow-lg hover:bg-[#E31C5F] hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                >
                  {isLoading ? 'Updating...' : 'Update User'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                    setFormData({
                      name: '',
                      email: '',
                      role: 'department_user',
                      department: '',
                      phone: '',
                    });
                  }}
                  className="flex-1 border-slate-200 bg-white hover:bg-slate-50"
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

export default UsersPage;
