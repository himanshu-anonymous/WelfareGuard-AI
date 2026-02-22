import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Home, AlertTriangle, GitMerge, BarChart2, FileText, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const NavigationBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem('token'));
            setRole(localStorage.getItem('role'));
        };
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const navItems = [
        { name: 'Home', path: '/', icon: Home, show: true },
        { name: 'Threats', path: '/threats', icon: AlertTriangle, show: true },
        { name: 'Pipeline', path: '/pipeline', icon: GitMerge, show: true },
        { name: 'Analytics', path: '/analytics', icon: BarChart2, show: role === 'admin' },
        { name: 'Citizen Portal', path: '/apply', icon: FileText, show: !!token },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: role === 'admin' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
        >
            <div className="max-w-7xl mx-auto glass-panel px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <span className="text-xl font-bold tracking-tight text-slate-900">Satark</span>
                </div>

                <div className="hidden md:flex space-x-1 items-center">
                    {navItems.filter(item => item.show).map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-4 py-2 rounded-lg transition-colors group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className={`flex items-center space-x-2 ${isActive ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'}`}>
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}

                    <div className="pl-4 ml-4 border-l border-slate-300">
                        {token ? (
                            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-slate-600 font-medium hover:text-red-600 transition-colors">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Logout</span>
                            </button>
                        ) : (
                            <Link to="/login" className="flex items-center space-x-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 rounded-lg text-white transition-colors">
                                <LogIn className="w-4 h-4" />
                                <span className="text-sm font-medium">Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default NavigationBar;
