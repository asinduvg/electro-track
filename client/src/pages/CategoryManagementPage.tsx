import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table';
import { Plus, Edit, Trash2, Search, Folder, FolderOpen, Tag, X } from 'lucide-react';
import useCategories from '../hooks/useCategories';
import useItems from '../hooks/useItems';
import { DashboardStatsSkeleton } from '../components/ui/InventorySkeletons';

const CategoryManagementPage: React.FC = () => {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();
  const { items } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    category: '',
    subcategory: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardStatsSkeleton />
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategory.category.trim() || !newCategory.subcategory.trim()) return;

    try {
      await createCategory(newCategory);
      setNewCategory({ category: '', subcategory: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setNewCategory({
      category: category.category,
      subcategory: category.subcategory,
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleUpdateCategory = async () => {
    if (!newCategory.category.trim() || !newCategory.subcategory.trim() || !selectedCategory)
      return;

    try {
      await updateCategory(selectedCategory.id, newCategory);
      setNewCategory({ category: '', subcategory: '' });
      setSelectedCategory(null);
      setShowEditModal(false);
      setError(null);
    } catch (error) {
      console.error('Failed to update category:', error);
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (category: any) => {
    // Check if any items are using this category
    const itemsUsingCategory = items.filter((item) => item.category_id === category.id);

    if (itemsUsingCategory.length > 0) {
      setError(
        `Cannot delete category "${category.category} - ${category.subcategory}" because ${itemsUsingCategory.length} item(s) are using it.`
      );
      return;
    }

    try {
      await deleteCategory(category.id);
      setError(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category');
    }
  };

  const groupedCategories = filteredCategories.reduce(
    (acc, cat) => {
      if (!acc[cat.category]) {
        acc[cat.category] = [];
      }
      acc[cat.category].push(cat);
      return acc;
    },
    {} as Record<string, typeof categories>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222] dark:text-white">
              Category Management
            </h1>
            <p className="mt-2 text-[#717171]">
              Organize and manage inventory categories and subcategories
            </p>
          </div>
          <Button
            onClick={() => {
              setShowAddModal(true);
              setError(null);
            }}
            className="bg-[#FF385C] text-white hover:bg-[#E31C5F]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Stats */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#717171]" />
                  <Input
                    placeholder="Search categories..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#717171]">Total Categories</p>
                  <p className="text-2xl font-bold text-[#222222] dark:text-white">
                    {Object.keys(groupedCategories).length}
                  </p>
                </div>
                <Folder className="h-8 w-8 text-[#FF385C]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tree View */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5 text-[#FF385C]" />
              Category Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedCategories).map(([mainCategory, subcategories]) => (
                <div
                  key={mainCategory}
                  className="rounded-lg border border-[#EBEBEB] p-4 dark:border-[#484848]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-5 w-5 text-[#FF385C]" />
                      <span className="text-lg font-semibold text-[#222222] dark:text-white">
                        {mainCategory}
                      </span>
                      <span className="text-sm text-[#717171]">
                        ({subcategories.length} subcategories)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewCategory({ category: mainCategory, subcategory: '' });
                        setShowAddModal(true);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Subcategory</span>
                    </Button>
                  </div>
                  <div className="ml-7 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {subcategories.map((subcat) => (
                      <div
                        key={subcat.id}
                        className="flex items-center justify-between rounded-lg bg-[#F7F7F7] p-3 dark:bg-[#484848]"
                      >
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-[#717171]" />
                          <span className="text-[#222222] dark:text-white">
                            {subcat.subcategory}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(subcat)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(subcat)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traditional Table View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-[#FF385C]" />
              All Categories ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Main Category</TableHeaderCell>
                    <TableHeaderCell>Subcategory</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-sm">{category.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Folder className="h-4 w-4 text-[#FF385C]" />
                          <span className="font-medium text-[#222222] dark:text-white">
                            {category.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-[#717171]" />
                          <span className="text-[#222222] dark:text-white">
                            {category.subcategory}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Category Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setError(null);
              }
            }}
          >
            <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-[#484848]">
              <h3 className="mb-4 text-lg font-semibold text-[#222222] dark:text-white">
                Add New Category
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#222222] dark:text-white">
                    Main Category
                  </label>
                  <Input
                    placeholder="Enter main category name"
                    value={newCategory.category}
                    onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#222222] dark:text-white">
                    Subcategory
                  </label>
                  <Input
                    placeholder="Enter subcategory name"
                    value={newCategory.subcategory}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, subcategory: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={() => {
                    handleAddCategory();
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Create Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setError(null);
              }
            }}
          >
            <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-[#484848]">
              <h3 className="mb-4 text-lg font-semibold text-[#222222] dark:text-white">
                Edit Category
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#222222] dark:text-white">
                    Main Category
                  </label>
                  <Input
                    placeholder="Enter main category name"
                    value={newCategory.category}
                    onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#222222] dark:text-white">
                    Subcategory
                  </label>
                  <Input
                    placeholder="Enter subcategory name"
                    value={newCategory.subcategory}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, subcategory: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <Button onClick={handleUpdateCategory} className="flex-1">
                  Update Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagementPage;
