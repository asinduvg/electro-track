import React, {useState} from 'react';
import {Outlet, Navigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import {useAuth} from '../../context/AuthContext';

const Layout: React.FC = () => {
    const {isAuthenticated, isLoading} = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}
            >
                <Sidebar/>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar}/>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};

export default Layout;