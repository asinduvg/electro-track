import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryListPage from './pages/InventoryListPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReceiveItemsPage from './pages/ReceiveItemsPage';
import TransferItemsPage from './pages/TransferItemsPage';
import DisposeItemsPage from './pages/DisposeItemsPage';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Inventory Routes */}
              <Route path="inventory/items" element={<InventoryListPage />} />
              <Route path="inventory/add" element={<AddItemPage />} />
              <Route path="inventory/view/:id" element={<ItemDetailPage />} />
              <Route path="inventory/receive" element={<ReceiveItemsPage />} />
              <Route path="inventory/transfer" element={<TransferItemsPage />} />
              <Route path="inventory/dispose" element={<DisposeItemsPage />} />

              {/* Placeholder routes - would be implemented in a real app */}
              <Route path="inventory/edit/:id" element={<p className="text-center py-12">Edit Item page would be implemented here</p>} />
              <Route path="locations" element={<p className="text-center py-12">Storage Locations page would be implemented here</p>} />
              <Route path="reports" element={<p className="text-center py-12">Reports & Analytics page would be implemented here</p>} />
              <Route path="settings" element={<p className="text-center py-12">System Settings page would be implemented here</p>} />
              <Route path="users" element={<p className="text-center py-12">User Management page would be implemented here</p>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;