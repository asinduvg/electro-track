import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettings } from '../context/SettingsContext';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Clock,
  Bell,
  Shield,
  Database,
  Palette,
  Monitor,
  User,
  Building,
  Mail,
  Save,
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    currency,
    setCurrency,
    timezone,
    setTimezone,
    companyName,
    setCompanyName,
    emailNotifications,
    setEmailNotifications,
    lowStockThreshold,
    setLowStockThreshold,
    autoBackup,
    setAutoBackup,
    dataRetention,
    setDataRetention,
    saveSettings,
  } = useSettings();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  const handleSave = () => {
    saveSettings();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">
            Configure your ElectroTrack preferences and system settings
          </p>
        </div>
        <Button onClick={handleSave} className="flex items-center bg-slate-900 hover:bg-slate-800">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Appearance Settings */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Appearance</h3>
                <p className="text-sm font-normal text-slate-500">
                  Customize the visual experience
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                    theme === 'light'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Sun className="mb-2 h-6 w-6 text-amber-500" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                    theme === 'dark'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Moon className="mb-2 h-6 w-6 text-slate-600" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                    theme === 'system'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Monitor className="mb-2 h-6 w-6 text-slate-600" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localization Settings */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Localization</h3>
                <p className="text-sm font-normal text-slate-500">Regional preferences</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <DollarSign className="mr-2 inline h-4 w-4" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD')
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <Clock className="mr-2 inline h-4 w-4" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Company Settings */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Building className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Organization</h3>
                <p className="text-sm font-normal text-slate-500">Company information</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Low Stock Threshold
              </label>
              <Input
                type="number"
                value={lowStockThreshold.toString()}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                placeholder="Default minimum stock level"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <p className="text-sm font-normal text-slate-500">Alert preferences</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-500">Receive alerts via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-sky-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-sm font-normal text-slate-500">Privacy and access control</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Change Password
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-slate-900">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <Database className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Data Management</h3>
                <p className="text-sm font-normal text-slate-500">Backup and retention</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Auto Backup</p>
                <p className="text-sm text-slate-500">Daily automatic backups</p>
              </div>
              <button
                onClick={() => setAutoBackup(!autoBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoBackup ? 'bg-sky-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Data Retention (days)
              </label>
              <Input
                type="number"
                value={dataRetention.toString()}
                onChange={(e) => setDataRetention(parseInt(e.target.value) || 365)}
                placeholder="Number of days to retain data"
              />
            </div>

            <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50">
              Export All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
