import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Folder,
    FolderOpen,
    Tag
} from 'lucide-react';
import useCategories from '../hooks/useCategories';

const CategoryManagementPage: React.FC = () => {
    const { categories, createCategory } = useCategories();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [newCategory, setNewCategory] = useState({
        category: '',
        subcategory: ''
    });

    const filteredCategories = categories.filter(category =>
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
            subcategory: category.subcategory
        });
        setShowEditModal(true);
    };

    const groupedCategories = filteredCategories.reduce((acc, cat) => {
        if (!acc[cat.category]) {
            acc[cat.category] = [];
        }
        acc[cat.category].push(cat);
        return acc;
    }, {} as Record<string, typeof categories>);

    return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#222222]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#222222] dark:text-white">Category Management</h1>
                        <p className="mt-2 text-[#717171]">Organize and manage inventory categories and subcategories</p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                {/* Search and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#717171]" />
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
                                    <p className="text-2xl font-bold text-[#222222] dark:text-white">{Object.keys(groupedCategories).length}</p>
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
                                <div key={mainCategory} className="border border-[#EBEBEB] dark:border-[#484848] rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Folder className="h-5 w-5 text-[#FF385C]" />
                                            <span className="font-semibold text-[#222222] dark:text-white text-lg">
                                                {mainCategory}
                                            </span>
                                            <span className="text-sm text-[#717171]">({subcategories.length} subcategories)</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-7">
                                        {subcategories.map((subcat) => (
                                            <div key={subcat.id} className="flex items-center justify-between p-3 bg-[#F7F7F7] dark:bg-[#484848] rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Tag className="h-4 w-4 text-[#717171]" />
                                                    <span className="text-[#222222] dark:text-white">{subcat.subcategory}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleEditCategory(subcat)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
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
                                                    <Button variant="outline" size="sm">
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#484848] rounded-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-[#222222] dark:text-white mb-4">Add New Category</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#222222] dark:text-white mb-2">
                                        Main Category
                                    </label>
                                    <Input
                                        placeholder="Enter main category name"
                                        value={newCategory.category}
                                        onChange={(e) => setNewCategory({...newCategory, category: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#222222] dark:text-white mb-2">
                                        Subcategory
                                    </label>
                                    <Input
                                        placeholder="Enter subcategory name"
                                        value={newCategory.subcategory}
                                        onChange={(e) => setNewCategory({...newCategory, subcategory: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <Button onClick={handleAddCategory} className="flex-1">
                                    Create Category
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAddModal(false)}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-[#484848] rounded-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-[#222222] dark:text-white mb-4">Edit Category</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#222222] dark:text-white mb-2">
                                        Main Category
                                    </label>
                                    <Input
                                        placeholder="Enter main category name"
                                        value={newCategory.category}
                                        onChange={(e) => setNewCategory({...newCategory, category: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#222222] dark:text-white mb-2">
                                        Subcategory
                                    </label>
                                    <Input
                                        placeholder="Enter subcategory name"
                                        value={newCategory.subcategory}
                                        onChange={(e) => setNewCategory({...newCategory, subcategory: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <Button className="flex-1">
                                    Update Category
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowEditModal(false)}
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