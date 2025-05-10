import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryListPage from './pages/InventoryListPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReceiveItemsPage from './pages/ReceiveItemsPage';
import TransferItemsPage from './pages/TransferItemsPage';
import DisposeItemsPage from './pages/DisposeItemsPage';
import WithdrawItemsPage from './pages/WithdrawItemsPage';
import LocationsPage from './pages/LocationsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import {ItemsProvider} from "./context/ItemsContext.tsx";
import {LocationsProvider} from "./context/LocationsContext.tsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    <Route path="/" element={<Layout/>}>
                        <Route index element={<Navigate to="/dashboard" replace/>}/>
                        <Route path="dashboard" element={<DashboardPage/>}/>
                        {/* Inventory Routes with ItemsProvider */}
                        <Route path="inventory" element={<InventoryLayout/>}>
                            <Route path="items" element={<InventoryListPage/>}/>
                            <Route path="add" element={<AddItemPage/>}/>
                            <Route path="edit/:id" element={<EditItemPage/>}/>
                            <Route path="view/:id" element={<ItemDetailPage/>}/>
                            <Route path="receive" element={<ReceiveItemsPage/>}/>
                            <Route path="transfer" element={<TransferItemsPage/>}/>
                            <Route path="dispose" element={<DisposeItemsPage/>}/>
                            <Route path="withdraw" element={<WithdrawItemsPage/>}/>
                        </Route>

                        {/* Location Management */}
                        <Route path="locations" element=
                            {
                                <LocationsProvider>
                                    <ItemsProvider>
                                        <LocationsPage/>
                                    </ItemsProvider>
                                </LocationsProvider>
                            }/>

                        {/* Reports */}
                        <Route path="reports" element={<ReportsPage/>}/>

                        {/* User Management */}
                        <Route path="users" element={<UsersPage/>}/>

                        {/* Settings */}
                        <Route path="settings" element={<SettingsPage/>}/>
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

function InventoryLayout() {
    return (
        <LocationsProvider>
            <ItemsProvider>
                <Outlet/>
            </ItemsProvider>
        </LocationsProvider>
    );
}

export default App;