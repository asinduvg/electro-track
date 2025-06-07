import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from "./context/DatabaseContext.tsx";
import { useEffect } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function AppRoutes() {
    const { currentUser, isLoading } = useAuth();
    const [location, setLocation] = useLocation();
    
    useEffect(() => {
        if (!isLoading) {
            if (!currentUser && location !== '/login') {
                setLocation('/login');
            } else if (currentUser && location === '/login') {
                setLocation('/');
            }
        }
    }, [currentUser, isLoading, location, setLocation]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }
    
    return (
        <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/" component={DashboardPage} />
        </Switch>
    );
}

function App() {
    return (
        <DatabaseProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </DatabaseProvider>
    );
}

export default App;