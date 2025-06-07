import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
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
        phone: ''
    });

    const isAdmin = currentUser?.role === 'admin';
    const canEditUsers = isAdmin || currentUser?.role === 'inventory_manager';

    const filteredUsers = users.filter(user =>
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
                password: 'defaultpassword123'
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
                role: formData.role as 'admin' | 'inventory_manager' | 'warehouse_staff' | 'department_user'
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
            phone: user.phone || ''
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        <p className="mt-2 text-slate-600">Manage system users and permissions</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                        />
                        {canEditUsers && (
                            <Button 
                                className="flex items-center bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#FFE5E9] rounded-xl flex items-center justify-center mr-4">
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

                <Card className="bg-white border-0 shadow-lg">
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
                                        <TableHeaderCell className="text-slate-700 hidden sm:table-cell">Email</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Role</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden md:table-cell">Department</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700 hidden lg:table-cell">Last Login</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-700">Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                                                <TableCell className="text-slate-900">
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-slate-500 sm:hidden">{user.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-700 hidden sm:table-cell">{user.email}</TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="text-slate-700 hidden md:table-cell">{user.department || 'N/A'}</TableCell>
                                                <TableCell className="text-slate-600 hidden lg:table-cell">
                                                    {user.last_login 
                                                        ? new Date(user.last_login).toLocaleDateString()
                                                        : 'Never'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {canEditUsers && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openEditDialog(user)}
                                                                className="bg-white border-slate-200 hover:bg-slate-50 text-xs"
                                                            >
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                <span className="hidden sm:inline">Edit</span>
                                                            </Button>
                                                        )}
                                                        {isAdmin && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="bg-white border-slate-200 hover:bg-slate-50 text-xs"
                                                                onClick={() => alert('Permissions functionality - coming soon')}
                                                            >
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                <span className="hidden sm:inline">Perms</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <Users className="h-12 w-12 text-slate-400 mb-4" />
                                                    <p className="text-slate-500">No users found</p>
                                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria</p>
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New User</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                    >
                                        <option value="department_user">Department User</option>
                                        <option value="warehouse_staff">Warehouse Staff</option>
                                        <option value="inventory_manager">Inventory Manager</option>
                                        {isAdmin && <option value="admin">Admin</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                                    <Input
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="Enter department"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button
                                    onClick={handleCreateUser}
                                    disabled={isLoading}
                                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-lg hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                                >
                                    {isLoading ? 'Creating...' : 'Create User'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
                                    }}
                                    className="flex-1 bg-white border-slate-200 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {isEditDialogOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit User</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors bg-white"
                                    >
                                        <option value="department_user">Department User</option>
                                        <option value="warehouse_staff">Warehouse Staff</option>
                                        <option value="inventory_manager">Inventory Manager</option>
                                        {isAdmin && <option value="admin">Admin</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                                    <Input
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="Enter department"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button
                                    onClick={handleEditUser}
                                    disabled={isLoading}
                                    className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-lg hover:shadow-xl disabled:bg-[#DDDDDD] disabled:text-[#717171]"
                                >
                                    {isLoading ? 'Updating...' : 'Update User'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedUser(null);
                                        setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
                                    }}
                                    className="flex-1 bg-white border-slate-200 hover:bg-slate-50"
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