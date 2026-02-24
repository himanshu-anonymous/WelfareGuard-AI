import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Portal = () => {
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkExisting = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch('http://localhost:8000/api/my-application', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const result = await res.json();
                        if (result.status === 'success' && result.data) {
                            navigate('/status');
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }
        };
        checkExisting();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus('idle');

        try {
            const form = e.currentTarget;
            const formData = new FormData(form);

            // Reconstruct payload to exactly match FastAPI ApplicationData model
            // Not sending Aadhaar ID explicitly to the API since it maps to username from JWT
            // but we simulated capturing it on the frontend.
            const payload = {
                pan_number: formData.get('pan_number'),
                target_bank_account: formData.get('target_bank_account'),
                full_name: formData.get('full_name'),
                age: parseInt(formData.get('age') as string, 10),
                gender: formData.get('gender')
            };

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/apply', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok) {
                setStatus('success');
                setMsg('Application submitted successfully. Under verification.');
                form.reset();
            } else {
                setStatus('error');
                setMsg(result.detail || 'Failed to submit application.');
            }
        } catch {
            setStatus('error');
            setMsg('Network error. Cannot reach backend API.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-8">
                <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
                    Citizen Scheme Application
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#121212] mb-1">Full Name (As per Aadhaar)</label>
                            <input type="text" name="full_name" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-[#121212] placeholder-[#121212]/50 font-medium focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all" placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#121212] mb-1">Aadhaar Number</label>
                            <input type="text" name="aadhaar_number" required title="Format: XXXX-XXXX-XXXX" pattern="^\d{4}-\d{4}-\d{4}$" className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-[#121212] placeholder-[#121212]/50 font-medium focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all" placeholder="1234-5678-9012" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#121212] mb-1">Age</label>
                            <input type="number" name="age" required min="18" max="100" className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-[#121212] placeholder-[#121212]/50 font-medium focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all" placeholder="e.g. 35" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#121212] mb-1">Gender</label>
                            <select name="gender" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-[#121212] font-medium focus:outline-none focus:ring-2 focus:ring-[#006C67] transition-all">
                                <option value="">-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Target Bank Account Number</label>
                        <input type="text" name="target_bank_account" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g., HDFC1000293" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Permanent Account Number (PAN)</label>
                        <input type="text" name="pan_number" required title="Format: 5 Letters, 4 Numbers, 1 Letter" pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" className="w-full bg-white/40 border border-white/40 text-slate-900 rounded-lg px-4 py-3 font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="ABCDE1234F" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Your PAN will be analyzed through Satark's financial activity network.</p>
                    </div>

                    <button disabled={submitting} type="submit" className="w-full bg-[#006C67] hover:bg-[#005a56] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg">
                        {submitting ? 'Authenticating & Submitting...' : 'Submit Application'}
                    </button>
                </form>

                {status !== 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${status === 'success' ? 'bg-[#006C67]/10 border border-[#006C67]/30' : 'bg-[#BA1200]/10 border border-[#BA1200]/30'}`}>
                        {status === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#006C67] mt-0.5" /> : <AlertCircle className="w-5 h-5 text-[#BA1200] mt-0.5" />}
                        <p className={`text-sm font-bold ${status === 'success' ? 'text-[#006C67]' : 'text-[#BA1200]'}`}>{msg}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Portal;
