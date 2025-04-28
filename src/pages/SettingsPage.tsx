import React, {useState} from 'react';
import {Settings, Bell, Shield, Database, Users, Palette, Save} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '../components/ui/Card';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Badge} from '../components/ui/Badge';
import {useAuth} from '../context/AuthContext';

const SettingsPage: React.FC = () => {
    const {currentUser} = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'ElectroTrack',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
    });

    const [notificationSettings, setNotificationSettings] = useState({
        lowStockAlerts: true,
        transactionNotifications: true,
        dailyReports: false,
        emailNotifications: true
    });

    const [securitySettings, setSecuritySettings] = useState({
        requireTwoFactor: false,
        sessionTimeout: 30,
        passwordExpiration: 90,
        minimumPasswordLength: 8
    });

    const handleSaveSettings = () => {
        // Here we would save the settings to the database
        console.log('Saving settings...');
    };

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'inventory_manager')) {
        return (
            <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-700">Access Restricted</h2>
                <p className="mt-2 text-gray-500">
                    You don't have permission to access system settings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">System Settings</h1>
                <Button
                    variant="primary"
                    leftIcon={<Save size={16}/>}
                    onClick={handleSaveSettings}
                >
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <Card>
                    <CardContent className="p-0">
                        <nav className="space-y-1">
                            {[
                                {id: 'general', label: 'General', icon: Settings},
                                {id: 'notifications', label: 'Notifications', icon: Bell},
                                {id: 'security', label: 'Security', icon: Shield},
                                {id: 'database', label: 'Database', icon: Database},
                                {id: 'users', label: 'User Management', icon: Users, adminOnly: true},
                                {id: 'appearance', label: 'Appearance', icon: Palette}
                            ].map(item => (
                                (item.adminOnly && currentUser.role !== 'admin') ? null : (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                                            activeTab === item.id
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <item.icon size={18} className="mr-3"/>
                                        <span className="flex-1">{item.label}</span>
                                        {item.adminOnly && (
                                            <Badge variant="primary" className="ml-2">Admin</Badge>
                                        )}
                                    </button>
                                )
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Company Name"
                                    value={generalSettings.companyName}
                                    onChange={(e) => setGeneralSettings({
                                        ...generalSettings,
                                        companyName: e.target.value
                                    })}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Timezone
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={generalSettings.timezone}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                timezone: e.target.value
                                            })}
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="EST">Eastern Time</option>
                                            <option value="CST">Central Time</option>
                                            <option value="PST">Pacific Time</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date Format
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={generalSettings.dateFormat}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                dateFormat: e.target.value
                                            })}
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Currency
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            value={generalSettings.currency}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                currency: e.target.value
                                            })}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Low Stock Alerts</h3>
                                            <p className="text-sm text-gray-500">
                                                Receive notifications when items fall below minimum stock levels
                                            </p>
                                        </div>
                                        <div className="relative inline-block w-12 h-6">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={notificationSettings.lowStockAlerts}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    lowStockAlerts: e.target.checked
                                                })}
                                            />
                                            <div
                                                className={`block w-12 h-6 rounded-full transition-colors ${
                                                    notificationSettings.lowStockAlerts ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                            />
                                            <div
                                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                                                    notificationSettings.lowStockAlerts ? 'translate-x-6' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Transaction Notifications</h3>
                                            <p className="text-sm text-gray-500">
                                                Get notified about new inventory transactions
                                            </p>
                                        </div>
                                        <div className="relative inline-block w-12 h-6">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={notificationSettings.transactionNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    transactionNotifications: e.target.checked
                                                })}
                                            />
                                            <div
                                                className={`block w-12 h-6 rounded-full transition-colors ${
                                                    notificationSettings.transactionNotifications ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                            />
                                            <div
                                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                                                    notificationSettings.transactionNotifications ? 'translate-x-6' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Daily Reports</h3>
                                            <p className="text-sm text-gray-500">
                                                Receive daily inventory status reports
                                            </p>
                                        </div>
                                        <div className="relative inline-block w-12 h-6">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={notificationSettings.dailyReports}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    dailyReports: e.target.checked
                                                })}
                                            />
                                            <div
                                                className={`block w-12 h-6 rounded-full transition-colors ${
                                                    notificationSettings.dailyReports ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                            />
                                            <div
                                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                                                    notificationSettings.dailyReports ? 'translate-x-6' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Email Notifications</h3>
                                            <p className="text-sm text-gray-500">
                                                Send notifications to your email address
                                            </p>
                                        </div>
                                        <div className="relative inline-block w-12 h-6">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={notificationSettings.emailNotifications}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    emailNotifications: e.target.checked
                                                })}
                                            />
                                            <div
                                                className={`block w-12 h-6 rounded-full transition-colors ${
                                                    notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                            />
                                            <div
                                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                                                    notificationSettings.emailNotifications ? 'translate-x-6' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-500">
                                            Require 2FA for all user accounts
                                        </p>
                                    </div>
                                    <div className="relative inline-block w-12 h-6">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={securitySettings.requireTwoFactor}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                requireTwoFactor: e.target.checked
                                            })}
                                        />
                                        <div
                                            className={`block w-12 h-6 rounded-full transition-colors ${
                                                securitySettings.requireTwoFactor ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div
                                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
                                                securitySettings.requireTwoFactor ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        type="number"
                                        label="Session Timeout (minutes)"
                                        value={securitySettings.sessionTimeout}
                                        onChange={(e) => setSecuritySettings({
                                            ...securitySettings,
                                            sessionTimeout: parseInt(e.target.value)
                                        })}
                                        min="5"
                                        max="240"
                                    />

                                    <Input
                                        type="number"
                                        label="Password Expiration (days)"
                                        value={securitySettings.passwordExpiration}
                                        onChange={(e) => setSecuritySettings({
                                            ...securitySettings,
                                            passwordExpiration: parseInt(e.target.value)
                                        })}
                                        min="0"
                                        helperText="0 = never expire"
                                    />

                                    <Input
                                        type="number"
                                        label="Minimum Password Length"
                                        value={securitySettings.minimumPasswordLength}
                                        onChange={(e) => setSecuritySettings({
                                            ...securitySettings,
                                            minimumPasswordLength: parseInt(e.target.value)
                                        })}
                                        min="8"
                                        max="32"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Database Settings */}
                    {activeTab === 'database' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-900">Database Information</h3>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="font-medium">PostgreSQL</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Version:</span>
                                            <span className="font-medium">15.x</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Size:</span>
                                            <span className="font-medium">128 MB</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Last Backup:</span>
                                            <span className="font-medium">2 hours ago</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                    >
                                        Backup Database
                                    </Button>

                                    <Button
                                        variant="outline"
                                        fullWidth
                                    >
                                        Optimize Tables
                                    </Button>

                                    <Button
                                        variant="outline"
                                        fullWidth
                                    >
                                        View Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* User Management */}
                    {activeTab === 'users' && currentUser.role === 'admin' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500">
                                    User management functionality would be implemented here.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Light', 'Dark', 'System'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <div className={`h-12 rounded-md mb-2 ${
                                                        theme === 'Light' ? 'bg-white border border-gray-200' :
                                                            theme === 'Dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-white to-gray-900'
                                                    }`}/>
                                                    <p className="text-sm font-medium">{theme}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Accent Color
                                        </label>
                                        <div className="grid grid-cols-6 gap-4">
                                            {['blue', 'green', 'purple', 'red', 'orange', 'pink'].map((color) => (
                                                <button
                                                    key={color}
                                                    className={`w-full h-12 rounded-lg bg-${color}-500 hover:ring-2 hover:ring-${color}-400 focus:outline-none focus:ring-2 focus:ring-${color}-500`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Font Size
                                        </label>
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option>Small</option>
                                            <option>Medium</option>
                                            <option>Large</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;