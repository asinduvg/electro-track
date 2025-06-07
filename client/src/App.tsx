import { Route } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from "./context/DatabaseContext.tsx";

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function AppContent() {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <LoginPage />;
    }
    
    return <DashboardPage />;
}

function App() {
    return (
        <DatabaseProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </DatabaseProvider>
    );
}

export default App;