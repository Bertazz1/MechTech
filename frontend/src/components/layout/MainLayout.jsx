import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;