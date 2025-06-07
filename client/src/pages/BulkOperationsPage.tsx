import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useCategories from '../hooks/useCategories';
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
    const { items } = useItems();
    const { locations } = useLocations();
    const { categories } = useCategories();
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
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
        } else {
            alert('Please select a valid CSV file');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                alert('Please select a valid CSV file');
            }
        }
    };

    const handleBulkImport = async () => {
        if (!selectedFile) return;
        
        setIsProcessing(true);
        try {
            const csvText = await selectedFile.text();
            const lines = csvText.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Validate headers
            const requiredHeaders = ['SKU', 'Name', 'Manufacturer', 'Unit Cost'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            
            if (missingHeaders.length > 0) {
                alert(`Missing required columns: ${missingHeaders.join(', ')}`);
                setIsProcessing(false);
                return;
            }
            
            // Parse CSV data
            const items = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length === headers.length) {
                    const item: any = {};
                    headers.forEach((header, index) => {
                        item[header.toLowerCase().replace(' ', '_')] = values[index];
                    });
                    items.push(item);
                }
            }
            
            console.log('Parsed items:', items);
            alert(`Successfully parsed ${items.length} items from CSV. Import functionality would process these items.`);
            setSelectedFile(null);
            
        } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file. Please check the format and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkExport = () => {
        // Implementation would generate CSV from current inventory
        const csvContent = generateInventoryCSV();
        downloadCSV(csvContent, 'inventory_export.csv');
    };

    const generateInventoryCSV = () => {
        const headers = ['SKU', 'Name', 'Description', 'Manufacturer', 'Model', 'Unit Cost', 'Minimum Stock', 'Status'];
        const rows = items.map(item => [
            item.sku,
            item.name,
            item.description || '',
            item.manufacturer,
            item.model || '',
            item.unit_cost,
            item.minimum_stock || '',
            item.status
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const generateImportTemplate = () => {
        const headers = ['SKU', 'Name', 'Description', 'Manufacturer', 'Model', 'Unit Cost', 'Minimum Stock', 'Status'];
        const sampleRows = [
            ['SAMPLE-001', 'Sample Item Name', 'Sample description', 'Sample Manufacturer', 'Model123', '25.00', '10', 'in_stock'],
            ['SAMPLE-002', 'Another Sample Item', 'Another description', 'Another Manufacturer', 'ModelXYZ', '15.50', '5', 'low_stock']
        ];
        
        return [headers, ...sampleRows].map(row => row.join(',')).join('\n');
    };

    const handleDownloadTemplate = () => {
        const csvContent = generateImportTemplate();
        downloadCSV(csvContent, 'inventory_import_template.csv');
    };

    const handleBulkTransfer = () => {
        // Generate transfer template with current items and locations
        const headers = ['Item SKU', 'From Location', 'To Location', 'Quantity', 'Notes'];
        const sampleRows = [
            ['SAMPLE-001', 'Warehouse A - Shelf A1', 'Warehouse B - Shelf B1', '10', 'Bulk transfer operation'],
            ['SAMPLE-002', 'Lab 1 - Cabinet C1', 'Storage Room A - Shelf A2', '5', 'Moving to main storage']
        ];
        
        const csvContent = [headers, ...sampleRows].map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, 'bulk_transfer_template.csv');
    };

    const handleStockAdjustment = () => {
        // Generate stock adjustment template with current items
        const headers = ['Item SKU', 'Location', 'Current Quantity', 'New Quantity', 'Adjustment Reason'];
        const itemRows = items.slice(0, 5).map(item => [
            item.sku,
            'Warehouse A - Shelf A1',
            '0', // Current quantity placeholder
            '', // New quantity to be filled
            'Inventory count adjustment'
        ]);
        
        const csvContent = [headers, ...itemRows].map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, 'stock_adjustment_template.csv');
    };

    const handleGenerateReports = () => {
        // Generate comprehensive inventory report
        const headers = [
            'SKU', 'Name', 'Description', 'Manufacturer', 'Model', 
            'Unit Cost', 'Status', 'Minimum Stock', 'Category', 'Created Date'
        ];
        
        const reportRows = items.map(item => [
            item.sku,
            item.name,
            item.description || '',
            item.manufacturer,
            item.model || '',
            item.unit_cost,
            item.status,
            item.minimum_stock || '',
            'Electronics', // Default category
            new Date(item.created_at || Date.now()).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...reportRows].map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, 'inventory_full_report.csv');
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
                        <Card className="h-full">
                            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                                <Download className="h-12 w-12 text-[#008489] mx-auto mb-4" />
                                <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Export Inventory</h3>
                                <p className="text-sm text-[#717171]">Download complete inventory as CSV</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleBulkTransfer}>
                        <Card className="h-full">
                            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                                <ArrowRightLeft className="h-12 w-12 text-[#FF385C] mx-auto mb-4" />
                                <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Bulk Transfer</h3>
                                <p className="text-sm text-[#717171]">Transfer items between locations</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleStockAdjustment}>
                        <Card className="h-full">
                            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                                <RotateCcw className="h-12 w-12 text-[#FC642D] mx-auto mb-4" />
                                <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Stock Adjustment</h3>
                                <p className="text-sm text-[#717171]">Adjust quantities in bulk</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGenerateReports}>
                        <Card className="h-full">
                            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                                <Package className="h-12 w-12 text-[#FF385C] mx-auto mb-4" />
                                <h3 className="font-semibold text-[#222222] dark:text-white mb-2">Generate Reports</h3>
                                <p className="text-sm text-[#717171]">Create custom inventory reports</p>
                            </CardContent>
                        </Card>
                    </div>
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
                                <div 
                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                        isDragOver 
                                            ? 'border-[#FF385C] bg-[#FFF3F4]' 
                                            : 'border-[#DDDDDD] hover:border-[#FF385C]'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
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
                                                <Button size="sm" onClick={handleBulkImport} disabled={isProcessing}>
                                                    {isProcessing ? 'Processing...' : 'Process Import'}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)} disabled={isProcessing}>
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
                                    <Button variant="outline" size="sm" className="mt-3" onClick={handleDownloadTemplate}>
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