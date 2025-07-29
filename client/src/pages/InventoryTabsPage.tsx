import React, { useState } from 'react';
import { Package, PackageCheck, PackageMinus, ArrowRightLeft, Plus, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import ReceiveItemsPage from './ReceiveItemsPage';
import WithdrawItemsPage from './WithdrawItemsPage';
import InventoryListPage from './InventoryListPage';
import AddItemForm from '../components/AddItemForm';
import TransferItemsComponent from '../components/TransferItemsComponent';

type TabType = 'items' | 'receive' | 'withdraw' | 'transfer' | 'add';

const InventoryTabsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('items');

    const tabs = [
        { id: 'items', label: 'Items', icon: Package, description: 'View and manage inventory items' },
        { id: 'add', label: 'Add Item', icon: PackagePlus, description: 'Add new items to inventory' },
        { id: 'receive', label: 'Receive', icon: PackageCheck, description: 'Receive new stock' },
        { id: 'withdraw', label: 'Withdraw', icon: PackageMinus, description: 'Withdraw items from stock' },
        { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, description: 'Transfer items between locations' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'receive':
                return (
                    <div className="relative">
                        <style>
                            {`
                                .receive-page .inventory-back-button { display: none !important; }
                                .receive-page h1 { display: none !important; }
                                .receive-page .add-item-button { display: none !important; }
                            `}
                        </style>
                        <div className="receive-page">
                            <ReceiveItemsPage />
                        </div>
                    </div>
                );
            case 'withdraw':
                return (
                    <div className="relative">
                        <style>
                            {`
                                .withdraw-page .inventory-back-button { display: none !important; }
                                .withdraw-page h1 { display: none !important; }
                                .withdraw-page .add-item-button { display: none !important; }
                            `}
                        </style>
                        <div className="withdraw-page">
                            <WithdrawItemsPage />
                        </div>
                    </div>
                );
            case 'transfer':
                return <TransferItemsComponent />;
            case 'add':
                return <AddItemForm />;
            case 'items':
            default:
                return (
                    <div className="relative">
                        <style>
                            {`
                                .items-page .add-item-button { display: none !important; }
                            `}
                        </style>
                        <div className="items-page">
                            <InventoryListPage hideAddButton={true} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with Tabs */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                            <p className="mt-2 text-slate-600">Manage your electronic components and equipment</p>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            isActive
                                                ? 'border-[#FF385C] text-[#FF385C]'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <IconComponent
                                            className={`mr-2 h-5 w-5 ${
                                                isActive ? 'text-[#FF385C]' : 'text-slate-400 group-hover:text-slate-500'
                                            }`}
                                        />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
};

export default InventoryTabsPage;