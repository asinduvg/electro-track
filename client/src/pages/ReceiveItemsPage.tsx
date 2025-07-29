import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  PackageCheck,
  Plus,
  Search,
  X,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import useItems from '../hooks/useItems';
import useLocations from '../hooks/useLocations';
import useTransactions from '../hooks/useTransactions';
import useStocks from '../hooks/useStocks';
import useCategories from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import { ReceiveItemsSkeleton } from '../components/ui/InventorySkeletons';

interface ReceiveItem {
  itemId: string;
  locationId: string;
  quantity: number;
  notes?: string;
}

const ReceiveItemsPage: React.FC = () => {
  const { items, getTotalQuantity, refreshItems, isLoading: itemsLoading } = useItems();
  const { locations, isLoading: locationsLoading } = useLocations();
  const { createTransaction } = useTransactions();
  const { stocks, refreshStocks, isLoading: stocksLoading } = useStocks();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { currentUser } = useAuth();
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'sku' | 'stock' | 'cost'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRangeMin, setPriceRangeMin] = useState('');
  const [priceRangeMax, setPriceRangeMax] = useState('');
  const [stockRangeMin, setStockRangeMin] = useState('');
  const [stockRangeMax, setStockRangeMax] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = itemsLoading || locationsLoading || stocksLoading || categoriesLoading;

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' || item.category_id?.toString() === categoryFilter;

      // Price range filter
      const matchesPriceRange =
        (!priceRangeMin || parseFloat(item.unit_cost) >= parseFloat(priceRangeMin)) &&
        (!priceRangeMax || parseFloat(item.unit_cost) <= parseFloat(priceRangeMax));

      // Stock range filter
      const totalStock = getTotalQuantity(item.id, stocks);
      const matchesStockRange =
        (!stockRangeMin || totalStock >= parseInt(stockRangeMin)) &&
        (!stockRangeMax || totalStock <= parseInt(stockRangeMax));

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesPriceRange && matchesStockRange
      );
    });

    // Sort items
    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'sku':
          comparison = (a.sku || '').localeCompare(b.sku || '');
          break;
        case 'stock':
          const stockA = getTotalQuantity(a.id, stocks);
          const stockB = getTotalQuantity(b.id, stocks);
          comparison = stockA - stockB;
          break;
        case 'cost':
          comparison = parseFloat(a.unit_cost) - parseFloat(b.unit_cost);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    items,
    stocks,
    searchQuery,
    statusFilter,
    categoryFilter,
    priceRangeMin,
    priceRangeMax,
    stockRangeMin,
    stockRangeMax,
    sortField,
    sortDirection,
    getTotalQuantity,
  ]);

  const handleSort = (field: 'name' | 'sku' | 'stock' | 'cost') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriceRangeMin('');
    setPriceRangeMax('');
    setStockRangeMin('');
    setStockRangeMax('');
  };

  const getSortIcon = (field: 'name' | 'sku' | 'stock' | 'cost') => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="success">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="danger">Out of Stock</Badge>;
      case 'discontinued':
        return <Badge variant="secondary">Discontinued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const addItemToReceive = (itemId: string) => {
    const existingIndex = receiveItems.findIndex((ri) => ri.itemId === itemId);
    if (existingIndex >= 0) {
      const updated = [...receiveItems];
      updated[existingIndex].quantity += 1;
      setReceiveItems(updated);
    } else {
      setReceiveItems([
        ...receiveItems,
        {
          itemId,
          locationId: locations[0]?.id || '',
          quantity: 1,
          notes: '',
        },
      ]);
    }
  };

  const updateReceiveItem = (index: number, field: keyof ReceiveItem, value: any) => {
    const updated = [...receiveItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceiveItems(updated);
  };

  const removeReceiveItem = (index: number) => {
    setReceiveItems(receiveItems.filter((_, i) => i !== index));
  };

  const handleSubmitReceive = async () => {
    if (receiveItems.length === 0) return;
    if (!currentUser?.id) {
      alert('User not authenticated. Please log in.');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const receiveItem of receiveItems) {
        await createTransaction({
          item_id: receiveItem.itemId,
          type: 'receive',
          quantity: receiveItem.quantity,
          to_location_id: receiveItem.locationId,
          notes: receiveItem.notes || `Received ${receiveItem.quantity} units`,
          performed_by: currentUser.id,
        });
      }

      await refreshItems();
      await refreshStocks();

      setReceiveItems([]);
      alert('Items received successfully!');
    } catch (error) {
      console.error('Error receiving items:', error);
      alert('Failed to receive items. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded bg-slate-200"></div>
              <div className="h-5 w-96 animate-pulse rounded bg-slate-200"></div>
            </div>
          </div>
          <ReceiveItemsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Receive Items</h1>
            <p className="mt-2 text-slate-600">Add items to your inventory</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-0 bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-[20px] z-10 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                <Input
                  placeholder="Search items by name, SKU, or description..."
                  className="border-slate-200 pl-10 focus:border-slate-400 focus:ring-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-slate-200 bg-white px-4 py-3 transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category} - {category.subcategory}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced
                </Button>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min $"
                        value={priceRangeMin}
                        onChange={(e) => setPriceRangeMin(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max $"
                        value={priceRangeMax}
                        onChange={(e) => setPriceRangeMax(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Stock Range
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min stock"
                        value={stockRangeMin}
                        onChange={(e) => setStockRangeMin(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max stock"
                        value={stockRangeMax}
                        onChange={(e) => setStockRangeMax(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Showing {filteredAndSortedItems.length} of {items.length} items
            </p>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'name' | 'sku' | 'stock' | 'cost')}
                className="rounded border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="name">Name</option>
                <option value="sku">SKU</option>
                <option value="stock">Stock</option>
                <option value="cost">Cost</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2"
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <Card className="mb-6 border-0 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Select Items to Receive
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead className="bg-slate-50">
                  <TableRow>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center">SKU {getSortIcon('sku')}</div>
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">Name {getSortIcon('name')}</div>
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center">Current Stock {getSortIcon('stock')}</div>
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => handleSort('cost')}
                    >
                      <div className="flex items-center">Unit Cost {getSortIcon('cost')}</div>
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold text-slate-700">
                      Status
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold text-slate-700">
                      Actions
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedItems.map((item) => {
                    const totalStock = getTotalQuantity(item.id, stocks);

                    return (
                      <TableRow
                        key={item.id}
                        className="border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        <TableCell className="font-medium text-slate-900">{item.sku}</TableCell>
                        <TableCell className="text-slate-900">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-slate-500">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              totalStock === 0
                                ? 'text-red-600'
                                : totalStock <= (item.minimum_stock || 0)
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {totalStock}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          ${parseFloat(item.unit_cost).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addItemToReceive(item.id)}
                            className="border-slate-200 bg-white text-xs hover:bg-slate-50"
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Items to Receive */}
        {receiveItems.length > 0 && (
          <Card className="mb-6 border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PackageCheck className="mr-2 h-5 w-5" />
                Items to Receive ({receiveItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHead className="bg-slate-50">
                    <TableRow>
                      <TableHeaderCell className="font-semibold text-slate-700">
                        Item
                      </TableHeaderCell>
                      <TableHeaderCell className="font-semibold text-slate-700">
                        Quantity
                      </TableHeaderCell>
                      <TableHeaderCell className="font-semibold text-slate-700">
                        Location
                      </TableHeaderCell>
                      <TableHeaderCell className="font-semibold text-slate-700">
                        Notes
                      </TableHeaderCell>
                      <TableHeaderCell className="font-semibold text-slate-700">
                        Actions
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receiveItems.map((receiveItem, index) => {
                      const item = items.find((i) => i.id === receiveItem.itemId);

                      return (
                        <TableRow
                          key={index}
                          className="border-slate-200 transition-colors hover:bg-slate-50"
                        >
                          <TableCell className="text-slate-900">
                            <div>
                              <div className="font-medium">{item?.name}</div>
                              <div className="text-sm text-slate-500">{item?.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={receiveItem.quantity}
                              onChange={(e) =>
                                updateReceiveItem(index, 'quantity', parseInt(e.target.value) || 0)
                              }
                              className="w-20"
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              value={receiveItem.locationId}
                              onChange={(e) =>
                                updateReceiveItem(index, 'locationId', e.target.value)
                              }
                              className="rounded-md border border-gray-300 px-3 py-2"
                            >
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.unit}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional notes..."
                              value={receiveItem.notes || ''}
                              onChange={(e) => updateReceiveItem(index, 'notes', e.target.value)}
                              className="w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReceiveItem(index)}
                              className="h-10 w-10 p-0 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Receive Button */}
        {receiveItems.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={handleSubmitReceive}
              disabled={isSubmitting}
              className="flex items-center rounded-lg bg-[#FF385C] px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-[#E31C5F]"
              size="lg"
            >
              <PackageCheck className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Processing...' : `Receive ${receiveItems.length} Items`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveItemsPage;
