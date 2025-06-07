import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
    Upload, 
    Download, 
    FileText, 
    CheckCircle, 
    AlertCircle,
    ArrowRightLeft,
    Package,
    Plus,
    Minus,
    RotateCcw
} from 'lucide-react';

interface BulkOperation {
    id: string;
    type: 'import' | 'export' | 'transfer' | 'adjustment';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    filename?: string;
    recordsProcessed: number;
    totalRecords: number;
    errors: string[];
    created_at: Date;
    completed_at?: Date;
}

const BulkOperationsPage: React.FC = () => {
    const [operations] = useState<BulkOperation[]>([
        {
            id: '1',
            type: 'import',
            status: 'completed',
            filename: 'inventory_update_2024.csv',
            recordsProcessed: 150,
            totalRecords: 150,
            errors: [],
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
            completed_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
        },
        {
            id: '2',
            type: 'export',
            status: 'completed',
            filename: 'inventory_export_full.csv',
            recordsProcessed: 1248,
            totalRecords: 1248,
            errors: [],
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
            completed_at: new Date(Date.now() - 23.5 * 60 * 60 * 1000)
        }
    ]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [operationType, setOperationType] = useState<'stock_adjustment' | 'transfer' | 'import'>('import');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
        } else {
            alert('Please select a valid CSV file');
        }
    };

    const handleBulkImport = () => {
        if (!selectedFile) return;
        
        // Implementation would parse CSV and create items
        console.log('Processing bulk import:', selectedFile.name);
        alert('Bulk import started. You will be notified when complete.');
    };

    const handleBulkExport = () => {
        // Implementation would generate CSV from current inventory
        const csvContent = generateInventoryCSV();
        downloadCSV(csvContent, 'inventory_export.csv');
    };

    const generateInventoryCSV = () => {
        const headers = ['SKU', 'Name', 'Description', 'Manufacturer', 'Model', 'Category', 'Unit Cost', 'Quantity', 'Location', 'Status'];
        const rows = [
            ['ARD-UNO-R3', 'Arduino Uno R3', 'Microcontroller board', 'Arduino', 'UNO R3', 'Microcontrollers', '25.00', '15', 'Warehouse A - Shelf B2', 'in_stock'],
            ['RPI-4-4GB', 'Raspberry Pi 4 Model B', '4GB RAM single board computer', 'Raspberry Pi Foundation', 'Pi 4B', 'Single Board Computers', '75.00', '8', 'Warehouse A - Shelf A1', 'in_stock']
        ];
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            case 'processing':
                return <Badge variant="warning">Processing</Badge>;
            case 'failed':
                return <Badge variant="danger">Failed</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getOperationIcon = (type: string) => {
        switch (type) {
            case 'import':
                return <Upload className="h-4 w-4" />;
            case 'export':
                return <Download className="h-4 w-4" />;
            case 'transfer':
                return <ArrowRightLeft className="h-4 w-4" />;
            case 'adjustment':
                return <RotateCcw className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] dark:text-white">Bulk Operations</h1>
                        <p className="mt-2 text-[#717171]">Import, export, and manage inventory data in bulk</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleBulkExport}>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Download className="h-12 w-12 text-[#008489] mx-auto mb-4" />
                                <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Export Inventory</h3>
                                <p className="text-sm text-[#717171]">Download complete inventory as CSV</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <ArrowRightLeft className="h-12 w-12 text-[#FF385C] mx-auto mb-4" />
                            <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Bulk Transfer</h3>
                            <p className="text-sm text-[#717171]">Transfer items between locations</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <RotateCcw className="h-12 w-12 text-[#FC642D] mx-auto mb-4" />
                            <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Stock Adjustment</h3>
                            <p className="text-sm text-[#717171]">Adjust quantities in bulk</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                            <Package className="h-12 w-12 text-[#FF385C] mx-auto mb-4" />
                            <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Generate Reports</h3>
                            <p className="text-sm text-[#717171]">Create custom inventory reports</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Import Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Upload className="mr-2 h-5 w-5 text-[#FF385C]" />
                            Bulk Import
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-[#222222] dark:text-white mb-4">Upload CSV File</h4>
                                <div className="border-2 border-dashed border-[#DDDDDD] rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <FileText className="h-8 w-8 text-[#008489] mx-auto" />
                                            <p className="text-sm font-medium text-[#222222] dark:text-white">{selectedFile.name}</p>
                                            <p className="text-xs text-[#717171]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            <div className="flex space-x-2 justify-center">
                                                <Button size="sm" onClick={handleBulkImport}>
                                                    Process Import
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="h-8 w-8 text-[#717171] mx-auto" />
                                            <p className="text-sm text-[#717171]">Click to upload or drag and drop</p>
                                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                Select CSV File
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-[#222222] dark:text-white mb-4">CSV Format Requirements</h4>
                                <div className="bg-[#F7F7F7] dark:bg-[#484848] rounded-lg p-4 text-sm">
                                    <p className="font-medium mb-2">Required columns:</p>
                                    <ul className="space-y-1 text-[#717171] dark:text-[#B0B0B0]">
                                        <li>• SKU (unique identifier)</li>
                                        <li>• Name</li>
                                        <li>• Manufacturer</li>
                                        <li>• Category ID</li>
                                        <li>• Unit Cost</li>
                                        <li>• Quantity</li>
                                        <li>• Location ID</li>
                                    </ul>
                                    <Button variant="outline" size="sm" className="mt-3">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Template
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Operation History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-[#FF385C]" />
                            Recent Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {operations.map((operation) => (
                                <div key={operation.id} className="flex items-center justify-between p-4 border border-[#EBEBEB] dark:border-[#484848] rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                            {getOperationIcon(operation.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-[#222222] dark:text-white capitalize">
                                                    {operation.type}
                                                </span>
                                                {getStatusBadge(operation.status)}
                                            </div>
                                            {operation.filename && (
                                                <p className="text-sm text-[#717171]">{operation.filename}</p>
                                            )}
                                            <p className="text-xs text-[#717171]">
                                                {operation.recordsProcessed} of {operation.totalRecords} records processed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[#717171]">
                                            {operation.created_at.toLocaleDateString()}
                                        </p>
                                        {operation.errors.length > 0 && (
                                            <div className="flex items-center text-xs text-[#C4141C] mt-1">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {operation.errors.length} errors
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BulkOperationsPage;