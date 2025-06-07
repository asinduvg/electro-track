import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Cpu, Zap, Lock} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {useAuth} from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const {login, isLoading, currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();
    
    // Use default company name for login page since it's outside SettingsProvider
    const companyName = "ElectroStock";

    // useEffect(() => {
    //     console.log('this is from pages', currentUser)
    //     if (currentUser) {
    //         navigate('/dashboard');
    //     }
    // }, [currentUser, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }

        try {
            const user = await login(email, password);
            console.log('Login Page')
            console.log('current user is ', user)
            if (user) {
                navigate('/');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    if (currentUser) {
        return null; // Will be handled by App component
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="relative">
                            <Cpu className="h-12 w-12 text-sky-400" />
                            <Zap className="h-6 w-6 text-amber-400 absolute -top-1 -right-1" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                                {companyName}
                            </h1>
                            <p className="text-sm text-slate-300 font-medium">Component Management</p>
                        </div>
                    </div>
                </div>
                <h2 className="mt-8 text-center text-3xl font-bold text-white">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-slate-300">
                    Sign in to your inventory management system
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/95 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-white/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V5z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-600 font-medium">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                            />
                        </div>

                        <div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                label="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                            />
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Lock size={16}/>
                                        <span>Sign in</span>
                                    </>
                                )}
                            </Button>
                            
                            <Button
                                type="button"
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium transition-colors"
                                onClick={async () => {
                                    // Demo login with admin user
                                    const demoUser = {
                                        id: "550e8400-e29b-41d4-a716-446655440000",
                                        email: "admin@et.com",
                                        role: "admin" as const,
                                        name: "Admin User",
                                        department: null,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        created_by: null,
                                        updated_by: null,
                                        last_login: null
                                    };
                                    setCurrentUser(demoUser);
                                    navigate('/');
                                }}
                            >
                                Demo Login (Admin)
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;