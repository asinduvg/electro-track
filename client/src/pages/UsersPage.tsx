import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, Plus, UserCheck } from 'lucide-react';
import useUsers from '../hooks/useUsers';

const UsersPage: React.FC = () => {
    const { users } = useUsers();

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
                <Button className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
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
                            {users.map((user) => (
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
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="outline" size="sm">Permissions</Button>
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