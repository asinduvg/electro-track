import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, Lock } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  // Use default company name for login page since it's outside SettingsProvider
  const companyName = 'ElectroTrack';

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
      console.log('Login Page');
      console.log('current user is ', user);
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
    <div className="flex min-h-screen flex-col justify-center bg-white py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Cpu className="h-12 w-12 text-[#FF385C]" />
              <Zap className="absolute -right-1 -top-1 h-6 w-6 text-[#FC642D]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#FF385C]">{companyName}</h1>
              <p className="text-sm font-medium text-[#717171]">Component Management</p>
            </div>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-semibold text-[#222222]">Welcome back</h2>
        <p className="mt-2 text-center text-base text-[#717171]">
          Sign in to continue to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-[#DDDDDD] bg-white px-6 py-8 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-[#FED7D7] bg-[#FFF5F5] p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-[#C4141C]" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#C4141C]">{error}</p>
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
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Continue</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={async () => {
                  // Demo login with admin user
                  const demoUser = {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    email: 'admin@et.com',
                    role: 'admin' as const,
                    name: 'Admin User',
                    department: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: null,
                    updated_by: null,
                    last_login: null,
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
