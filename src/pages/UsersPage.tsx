import React, {useState, useEffect} from 'react';
import {
    UserPlus, Search, Shield, Mail, Building, Calendar,
    Clock, Edit, Trash2, Check, X
} from 'lucide-react';
import {format} from 'date-fns';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell} from '../components/ui/Table';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';
import {getUsers, updateUser} from '../lib/api';
import type {Database} from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

const UsersPage: React.FC = () => {
    const {currentUser} = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New User Form State
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        role: 'department_user' as const,
        department: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUser.email.trim() || !newUser.name.trim()) {
            setError('Email and name are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // In a real app, you would create the user here
            console.log('Creating user:', newUser);

            setIsAddingUser(false);
            setNewUser({
                email: '',
                name: '',
                role: 'department_user',
                department: ''
            });
        } catch (err) {
            console.error('Error creating user:', err);
            setError('Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            await updateUser(userId, {role: newRole as any});
            loadUsers(); // Reload users to get updated data
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            // In a real app, you would delete the user here
            console.log('Deleting user:', userId);
            loadUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const searchStr = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchStr) ||
            user.email.toLowerCase().includes(searchStr) ||
            user.department?.toLowerCase().includes(searchStr) ||
            user.role.toLowerCase().includes(searchStr)
        );
    });

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-700">Access Restricted</h2>
                <p className="mt-2 text-gray-500">
                    You don't have permission to manage users.
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

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'danger';
            case 'inventory_manager':
                return 'success';
            case 'warehouse_staff':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button
                    variant="primary"
                    leftIcon={<UserPlus size={16}/>}
                    onClick={() => setIsAddingUser(true)}
                >
                    Add User
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Form */}
            {isAddingUser && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                                <Input
                                    label="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                                        required
                                    >
                                        <option value="department_user">Department User</option>
                                        <option value="warehouse_staff">Warehouse Staff</option>
                                        <option value="inventory_manager">Inventory Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <Input
                                    label="Department"
                                    value={newUser.department}
                                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddingUser(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                >
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftAddon={<Search className="h-5 w-5"/>}
                        />
                    </div>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>Role</TableHeaderCell>
                                <TableHeaderCell>Department</TableHeaderCell>
                                <TableHeaderCell>Last Active</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="flex items-center">
                                            <Mail size={16} className="mr-2 text-gray-400"/>
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getRoleBadgeVariant(user.role)}
                                                className="capitalize"
                                            >
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.department ? (
                                                <div className="flex items-center">
                                                    <Building size={16} className="mr-2 text-gray-400"/>
                                                    {user.department}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-gray-500">
                                                <Clock size={16} className="mr-2"/>
                                                {user.last_login ? (
                                                    format(new Date(user.last_login), 'MMM d, yyyy')
                                                ) : (
                                                    'Never'
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Edit size={16}/>}
                                                    onClick={() => {/* Handle edit */
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Trash2 size={16}/>}
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser.id}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Search size={48} className="mb-2 text-gray-300"/>
                                            <p className="text-lg">No users found</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {searchTerm
                                                    ? 'Try adjusting your search terms'
                                                    : 'Add your first user to get started'
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersPage;