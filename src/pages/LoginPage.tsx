import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Package, Lock} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {useAuth} from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const {login, isLoading, currentUser} = useAuth();

    useEffect(() => {
        console.log('this is from pages', currentUser)
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate])

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
                navigate('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                        <Package className="h-12 w-12 text-blue-800"/>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    ElectroTrack
                </h2>
                <p className="mt-2 text-center text-sm text-blue-300">
                    Electronics Inventory Management System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V5z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-500">
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

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isLoading}
                                leftIcon={<Lock size={16}/>}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;