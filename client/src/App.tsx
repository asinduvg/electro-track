import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from "./context/DatabaseContext.tsx";
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryListPage from './pages/InventoryListPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import LocationsPage from './pages/LocationsPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ReceiveItemsPage from './pages/ReceiveItemsPage';
import WithdrawItemsPage from './pages/WithdrawItemsPage';
import TransferItemsPage from './pages/TransferItemsPage';
import SuppliersPage from './pages/SuppliersPage';
import AlertsPage from './pages/AlertsPage';
import BulkOperationsPage from './pages/BulkOperationsPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import CategoryManagementPage from './pages/CategoryManagementPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-600 border-t-[#FF385C]"></div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 dark:border-gray-600 border-t-[#FF385C]"></div>
            </div>
        );
    }
    
    if (currentUser) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
}

function App() {
    return (
        <SettingsProvider>
            <DatabaseProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route 
                                path="/login" 
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                } 
                            />
                            <Route 
                                path="/" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <DashboardPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/items" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <InventoryListPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/add" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <AddItemPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/edit/:id" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <EditItemPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/view/:id" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <ItemDetailPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/locations" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <LocationsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/users" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <UsersPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/reports" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <ReportsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/settings" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <SettingsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/receive" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <ReceiveItemsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/withdraw" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <WithdrawItemsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/inventory/transfer" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <TransferItemsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/suppliers" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <SuppliersPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/alerts" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <AlertsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/bulk-operations" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <BulkOperationsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/advanced-analytics" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <AdvancedAnalyticsPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/categories" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <CategoryManagementPage />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </DatabaseProvider>
        </SettingsProvider>
    );
}

export default App;