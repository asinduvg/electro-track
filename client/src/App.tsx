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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
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
                <div className="text-lg">Loading...</div>
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
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </DatabaseProvider>
        </SettingsProvider>
    );
}

export default App;