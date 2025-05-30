import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {DatabaseProvider} from "./context/DatabaseContext.tsx";
import {SettingsProvider} from "./context/SettingsContext.tsx";

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
import EditLocationPage from './pages/EditLocationPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

function App() {
    return (
        <DatabaseProvider>
            <AuthProvider>
                <SettingsProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<LoginPage/>}/>

                            <Route path="/" element={<Layout/>}>
                                <Route index element={<Navigate to="/dashboard" replace/>}/>
                                <Route path="dashboard" element={<DashboardPage/>}/>
                                <Route path="inventory">
                                    <Route path="items" element={<InventoryListPage/>}/>
                                    <Route path="add" element={<AddItemPage/>}/>
                                    <Route path="edit/:id" element={<EditItemPage/>}/>
                                    <Route path="view/:id" element={<ItemDetailPage/>}/>
                                    <Route path="receive" element={<ReceiveItemsPage/>}/>
                                    <Route path="transfer" element={<TransferItemsPage/>}/>
                                    <Route path="dispose" element={<DisposeItemsPage/>}/>
                                    <Route path="withdraw" element={<WithdrawItemsPage/>}/>
                                </Route>

                                <Route path="locations" element={<LocationsPage/>}/>
                                <Route path="locations/edit/:id" element={<EditLocationPage/>}/>
                                <Route path="reports" element={<ReportsPage/>}/>
                                <Route path="users" element={<UsersPage/>}/>
                                <Route path="settings" element={<SettingsPage/>}/>
                            </Route>

                            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                        </Routes>
                    </Router>
                </SettingsProvider>
            </AuthProvider>
        </DatabaseProvider>
    );
}

export default App;