import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
// Dialog component placeholder - will use modal approach
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
        try {
            const newUser = await apiClient.createUser({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                department: formData.department,
                phone: formData.phone,
                password: 'defaultpassword123' // Default password - user should change on first login
            });
            
            if (newUser) {
                // Refresh the users list
                window.location.reload();
            }
            setIsCreateDialogOpen(false);
            setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleEditUser = async () => {
        if (selectedUser) {
            await updateUser(selectedUser.id, {
                ...formData,
                role: formData.role as 'admin' | 'inventory_manager' | 'warehouse_staff' | 'department_user'
            });
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', role: 'department_user', department: '', phone: '' });
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
                                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        )}
                    </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">{users.length}</p>
                                <p className="text-gray-600">Active Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        All Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>Role</TableHeaderCell>
                                <TableHeaderCell>Department</TableHeaderCell>
                                <TableHeaderCell>Last Login</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{user.department || 'N/A'}</TableCell>
                                    <TableCell>
                                        {user.last_login 
                                            ? new Date(user.last_login).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {canEditUsers && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            )}
                                            {isAdmin && (
                                                <Button variant="outline" size="sm">
                                                    <Shield className="h-4 w-4 mr-1" />
                                                    Permissions
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                </Card>

                {/* Add User Modal */}
                {isCreateDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New User</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
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
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button
                                    onClick={handleCreateUser}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Create User
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
                {isEditDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit User</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
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
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button
                                    onClick={handleEditUser}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Update User
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