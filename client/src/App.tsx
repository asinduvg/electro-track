import { Route } from 'wouter';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from "./context/DatabaseContext.tsx";

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
    return (
        <DatabaseProvider>
            <AuthProvider>
                <Route path="/login" component={LoginPage} />
                <Route path="/" component={DashboardPage} />
            </AuthProvider>
        </DatabaseProvider>
    );
}

export default App;