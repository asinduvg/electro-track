import React, {createContext, useContext, useState, useEffect} from 'react';
import {supabase} from '../lib/supabase';
import {signIn, signOut} from '../lib/auth';
import useUsers from "../hooks/useUsers.tsx";
import {Database} from "../lib/database.types.ts";

type User = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const {getUserById, updateUser, error: usersError} = useUsers();

    useEffect(() => {
        if (usersError) {
            setError(usersError);
            return;
        }
    }, [usersError]);

    useEffect(() => {
        // Check active session
        console.log('get session effect called')
        supabase.auth.getSession().then(({data: {session}}) => {
            console.log('active session found', session)
            if (session) {
                getUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('on state change called')
            if (session) {
                getUserProfile(session.user.id);
            } else {
                setCurrentUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getUserProfile = async (userId: string) => {
        const user = await getUserById(userId)
        setCurrentUser(user)
        await updateUser(userId, {last_login: new Date().toISOString()})
    };

    const login = async (email: string, password: string): Promise<User | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const {user} = await signIn(email, password);

            if (user) {
                console.log('User is ', user)
                console.log('now calling getUserProfile')
                await getUserProfile(user.id);
                return currentUser;
            }

            return null;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError('Invalid email or password');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut();
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};