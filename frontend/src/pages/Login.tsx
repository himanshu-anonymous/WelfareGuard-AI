import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);

                if (data.role === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate('/apply');
                }
                window.dispatchEvent(new Event('auth-change'));
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Unable to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-full bg-[#006C67]/10 text-[#006C67] mb-4 border border-[#006C67]/30">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#121212]">Secure Login</h2>
                    <p className="text-sm text-[#121212]/80 font-medium mt-2">Access your Satark account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-600 font-bold text-sm flex items-center border border-red-500/30">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#121212]/90 mb-1">Username</label>
                        <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/40 border border-[#121212]/10 rounded-lg px-4 py-3 text-[#121212] font-medium placeholder-[#121212]/50 focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all" placeholder="Enter username" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#121212]/90 mb-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/40 border border-[#121212]/10 rounded-lg px-4 py-3 text-[#121212] font-medium placeholder-[#121212]/50 focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all" placeholder="••••••••" />
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-[#E27C37] hover:bg-[#c96a2e] py-3 rounded-lg text-white font-semibold shadow-md active:scale-95 transition-all mt-2">
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#121212]/80 font-medium">
                    Not registered? <Link to="/signup" className="text-[#006C67] font-bold hover:underline">Create an account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
