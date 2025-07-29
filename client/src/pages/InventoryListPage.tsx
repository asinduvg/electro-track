import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, Plus, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '../components/ui/Input';
import useItems from '../hooks/useItems';
import useStocks from '../hooks/useStocks';
import useCategories from '../hooks/useCategories';
import { InventoryTableSkeleton, ItemCardGridSkeleton } from '../components/ui/InventorySkeletons';

interface InventoryListPageProps {
  hideAddButton?: boolean;
}

const InventoryListPage: React.FC<InventoryListPageProps> = ({ hideAddButton = false }) => {
  const [searchParams] = useSearchParams();
  const { items, getTotalQuantity, isLoading: itemsLoading } = useItems();
  const { stocks, isLoading: stocksLoading } = useStocks();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Filter and sorting state
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

  useEffect(() => {
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      setStatusFilter(statusFilter);
    }
  }, [searchParams]);

  // Check if data is loading
  const isLoading = itemsLoading || stocksLoading || categoriesLoading;

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

  const getSortIcon = (field: 'name' | 'sku' | 'stock' | 'cost') => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded bg-slate-200"></div>
              <div className="h-5 w-96 animate-pulse rounded bg-slate-200"></div>
            </div>
            {!hideAddButton && (
              <Link to="/inventory/add" className="add-item-button">
                <Button className="flex items-center bg-[#FF385C] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </Link>
            )}
          </div>
          <InventoryTableSkeleton rows={15} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Items</h1>
            <p className="mt-2 text-slate-600">Manage your electronic components and equipment</p>
          </div>
          {!hideAddButton && (
            <Link to="/inventory/add" className="add-item-button">
              <Button className="flex items-center bg-[#FF385C] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#E31C5F] hover:shadow-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </Link>
          )}
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
                className="flex items-center"
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead className="bg-slate-50">
                  <TableRow>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center">
                        SKU
                        {getSortIcon('sku')}
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {getSortIcon('name')}
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell className="hidden font-semibold text-slate-700 md:table-cell">
                      Category
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center">
                        Total Stock
                        {getSortIcon('stock')}
                      </div>
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="hidden cursor-pointer font-semibold text-slate-700 transition-colors hover:bg-slate-100 lg:table-cell"
                      onClick={() => handleSort('cost')}
                    >
                      <div className="flex items-center">
                        Unit Cost
                        {getSortIcon('cost')}
                      </div>
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
                  {filteredAndSortedItems.length > 0 ? (
                    filteredAndSortedItems.map((item) => {
                      const category = categories.find((cat) => cat.id === item.category_id);
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
                              <div className="text-sm text-slate-500 md:hidden">
                                {category
                                  ? `${category.category} - ${category.subcategory}`
                                  : 'Uncategorized'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden text-slate-600 md:table-cell">
                            {category
                              ? `${category.category} - ${category.subcategory}`
                              : 'Uncategorized'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                totalStock === 0
                                  ? 'text-red-600'
                                  : totalStock <= (item.minimum_stock || 1)
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                              }`}
                            >
                              {totalStock}
                            </span>
                          </TableCell>
                          <TableCell className="hidden text-slate-900 lg:table-cell">
                            ${Number(item.unit_cost).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link to={`/inventory/items/${item.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-200 bg-white text-xs hover:bg-slate-50"
                                >
                                  View
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                        <h3 className="mb-2 text-lg font-medium text-slate-900">No items found</h3>
                        <p className="mb-4 text-slate-500">
                          Try adjusting your search criteria or add a new item.
                        </p>
                        {!hideAddButton && (
                          <Link to="/inventory/add" className="add-item-button">
                            <Button className="bg-[#FF385C] text-white hover:bg-[#E31C5F]">
                              <Plus className="mr-2 h-4 w-4" />
                              Add New Item
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryListPage;
