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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <div className="flex space-x-4">
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    {canEditUsers && (
                        <Button 
                            className="flex items-center"
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
        </div>
    );
};

export default UsersPage;