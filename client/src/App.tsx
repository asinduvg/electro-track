import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from "./context/DatabaseContext.tsx";

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

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
                                    <DashboardPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </DatabaseProvider>
    );
}

export default App;