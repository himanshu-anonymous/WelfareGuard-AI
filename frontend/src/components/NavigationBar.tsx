import { Link, useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';

const NavigationBar = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [hasApplication, setHasApplication] = useState<boolean>(false);

    useEffect(() => {
        const checkApplication = async () => {
            const currentToken = localStorage.getItem('token');
            const currentRole = localStorage.getItem('role');
            if (currentToken && currentRole === 'citizen') {
                try {
                    const res = await fetch('http://localhost:8000/api/my-application', {
                        headers: { 'Authorization': `Bearer ${currentToken}` }
                    });
                    if (res.ok) {
                        const result = await res.json();
                        if (result.status === 'success' && result.data) {
                            setHasApplication(true);
                        } else {
                            setHasApplication(false);
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            } else {
                setHasApplication(false);
            }
        };

        checkApplication();
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-1 border-none outline-none">
                    <Link to="/" className="flex items-center -ml-3">
                        <img src="/logo.png" alt="Satark Logo" className="h-16 md:h-20 w-auto object-contain scale-110 origin-left" />
                    </Link>
                </div>

                {/* Center Links */}
                <div className="hidden md:flex space-x-8 items-center">
                    <a href="/#problem" className="text-slate-600 hover:text-slate-900 font-medium transition">The Threat</a>
                    <a href="/#solution" className="text-slate-600 hover:text-slate-900 font-medium transition">How it Works</a>

                    {role === 'admin' ? (
                        <>
                            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition">Flags</Link>
                            <Link to="/citizens" className="text-slate-600 hover:text-slate-900 font-medium transition">Registered Citizens</Link>
                            <Link to="/analytics" className="text-slate-600 hover:text-slate-900 font-medium transition">Live Data</Link>
                        </>
                    ) : role === 'citizen' ? (
                        <>
                            {!hasApplication && <Link to="/apply" className="text-slate-600 hover:text-slate-900 font-medium transition">Citizen Portal</Link>}
                            <Link to="/status" className="text-slate-600 hover:text-slate-900 font-medium transition">My Application</Link>
                        </>
                    ) : (
                        <a href="/analytics" className="text-slate-600 hover:text-slate-900 font-medium transition">Live Data</a>
                    )}
                </div>

                {/* Right Buttons */}
                <div className="hidden md:flex space-x-4 items-center">
                    {token ? (
                        <>
                            <button onClick={handleLogout} className="px-5 py-2 text-slate-600 bg-transparent hover:text-slate-900 font-medium transition-colors">
                                Logout
                            </button>
                            {role !== 'admin' && !hasApplication && (
                                <Link to="/apply" className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-lg font-medium transition-all">
                                    Apply Now
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="px-5 py-2 text-slate-600 bg-transparent hover:text-slate-900 font-medium transition-colors">
                                Admin Login
                            </Link>
                            <Link to="/apply" className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-lg font-medium transition-all">
                                Apply Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
