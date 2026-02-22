import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, AlertTriangle, FileText } from 'lucide-react';

interface MyApplication {
    user_id: string;
    pan_number: string;
    target_bank_account: string;
    status: string;
    fraud_score: number;
    flag_reason: string;
}

const CitizenDashboard = () => {
    const [data, setData] = useState<MyApplication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyApplication = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch('http://localhost:8000/api/my-application', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.status === 'success') {
                        setData(result.data);
                    } else {
                        setData(result);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch application data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyApplication();
    }, []);

    if (loading) {
        return <div className="min-h-screen pt-24 px-6 text-center font-bold text-slate-600">Loading your profile...</div>;
    }

    if (!data) {
        return (
            <div className="min-h-screen pt-24 px-6 flex flex-col items-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 text-center max-w-md w-full mt-10">
                    <div className="inline-flex p-4 rounded-full bg-slate-100/50 mb-6 text-slate-500 shadow-sm border border-slate-200/50">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">No Application Found</h2>
                    <p className="text-slate-600 font-medium mb-8 leading-relaxed">You haven't submitted an application for welfare disbursement yet. Start now to get verified by Satark.</p>
                    <a href="/apply" className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-0.5 inline-block cursor-none">
                        Start Application
                    </a>
                </motion.div>
            </div>
        );
    }

    // Determine status rendering
    let statusConfig = { icon: Clock, label: 'Under Review', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };

    if (data.status === 'Red: Blocked') {
        statusConfig = { icon: AlertTriangle, label: 'Blocked by Satark', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (data.status === 'Approved') {
        statusConfig = { icon: ShieldCheck, label: 'Verified & Approved', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    }

    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-[80vh] pt-24 px-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 w-full max-w-2xl text-center">Citizen Application Status</h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 max-w-2xl w-full"
            >
                <div className={`p-6 rounded-xl border flex items-center space-x-4 mb-8 ${statusConfig.bg} ${statusConfig.border}`}>
                    <div className={`p-3 bg-white rounded-full shadow-sm ${statusConfig.color}`}>
                        <StatusIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Status</p>
                        <h2 className={`text-2xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
                    </div>
                </div>

                <div className="space-y-4 text-slate-700">
                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                        <span className="font-bold text-slate-500">Citizen ID</span>
                        <span className="font-mono font-medium text-slate-900">{data.user_id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                        <span className="font-bold text-slate-500">Registered PAN</span>
                        <span className="font-mono font-medium text-slate-900">{data.pan_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="font-bold text-slate-500">Target Bank Account</span>
                        <span className="font-mono font-medium text-slate-900">{data.target_bank_account}</span>
                    </div>
                    {data.flag_reason && (
                        <div className="flex justify-between items-center py-3 border-t border-slate-200 bg-red-50/50 px-2 rounded mt-2">
                            <span className="font-bold text-red-500">System Notification</span>
                            <span className="font-mono font-bold text-red-600 text-sm text-right max-w-xs">{data.flag_reason}</span>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-sm text-center text-slate-500 font-medium">
                    Please note: Satark employs AI cross-referencing on PAN financial architecture. Final decisions are algorithmic unless marked for manual review.
                </p>
            </motion.div>
        </div>
    );
};

export default CitizenDashboard;
