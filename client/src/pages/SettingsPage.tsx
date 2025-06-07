import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            System Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Configure system-wide settings and preferences.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;