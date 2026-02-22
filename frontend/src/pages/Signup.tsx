import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('citizen');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await res.json();
            if (res.ok) {
                // Navigate to login to force authentic authentication flow
                navigate('/login');
            } else {
                setError(data.detail || 'Signup failed');
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
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-600 mb-4 border border-emerald-600/30">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-sm text-slate-600 font-medium mt-2">Join Satark Network</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-600 font-bold text-sm flex items-center border border-red-500/30">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Username</label>
                        <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Choose a username" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Account Type</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-none">
                            <option value="citizen">Citizen</option>
                            <option value="admin">Bureaucrat (Admin)</option>
                        </select>
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg text-white font-semibold transition-colors mt-2">
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-700 font-medium">
                    Already have an account? <Link to="/login" className="text-emerald-700 font-semibold hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
