import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Search, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

interface Application {
    id: number;
    user_id: string;
    pan_number: string;
    target_bank_account: string;
    status: string;
    fraud_score: number;
    flag_reason: string;
    created_at: string;
}

interface StatsData {
    total_applications: number;
    real_applications: number;
    fake_applications: number;
    funds_saved: number;
}

const Dashboard = () => {
    const [data, setData] = useState<Application[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const fetchData = async (query = '') => {
        try {
            const token = localStorage.getItem('token');
            const url = query ? `http://localhost:8000/api/applications?user_id=${encodeURIComponent(query)}` : 'http://localhost:8000/api/applications';

            const [resApps, resStats] = await Promise.all([
                fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8000/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (resApps.ok) {
                const result = await resApps.json();
                setData(result);
            }
            if (resStats.ok) {
                const sData = await resStats.json();
                setStats(sData);
            }
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(searchQuery);
        }, 5000);
        fetchData(searchQuery);
        return () => clearInterval(interval);
    }, [searchQuery]);

    const getSeverity = (status: string) => {
        if (status === 'Red: Blocked') return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600', label: 'CRITICAL', icon: AlertCircle };
        if (status === 'Yellow: Manual Audit') return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-600', label: 'WARNING', icon: AlertCircle };
        return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-600', label: 'SAFE', icon: ShieldAlert };
    };

    return (
        <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Satark Live Feed</h1>
                    <p className="text-slate-600 mt-1 font-medium">Monitoring realtime network anomalies.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="glass-panel px-4 py-2 flex items-center space-x-2">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Citizen ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-slate-900 font-medium placeholder-slate-500 w-48"
                        />
                    </div>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="glass-panel p-6 flex flex-col justify-center">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Network Scans</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.total_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-green-500">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Verified Clean</p>
                        <h3 className="text-3xl font-black text-green-600">{stats.real_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-red-500">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Anomalous Clusters Blocked</p>
                        <h3 className="text-3xl font-black text-red-600">{stats.fake_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center bg-slate-900 border-none">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Capital Preserved (INR)</p>
                        <h3 className="text-3xl font-black text-emerald-400">₹{stats.funds_saved.toLocaleString()}</h3>
                    </div>
                </div>
            )}

            <div className="glass-panel overflow-hidden w-full">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/40 text-xs font-bold text-slate-700 uppercase tracking-wider bg-white/40">
                    <div className="col-span-1">Citizen ID</div>
                    <div className="col-span-1">PAN</div>
                    <div className="col-span-1">Bank Account</div>
                    <div className="col-span-1">Threat Level</div>
                    <div className="col-span-2">System Flag</div>
                </div>

                <div className="divide-y divide-white/10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {loading && data.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 font-bold">Connecting to neural feed...</div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 font-medium">Database Empty.</div>
                    ) : (
                        data.map((app) => {
                            const severity = getSeverity(app.status);
                            const Icon = severity.icon;
                            const isExpanded = expandedRow === app.id.toString();

                            return (
                                <div key={app.id}>
                                    <div
                                        onClick={() => setExpandedRow(expandedRow === app.id.toString() ? null : app.id.toString())}
                                        className={`grid grid-cols-6 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-white/40 transition-colors border-l-4 ${severity.border.replace('border-', 'border-l-')}`}
                                    >
                                        <div className="col-span-1 font-mono text-sm font-semibold text-slate-900 tracking-tight">{app.user_id}</div>
                                        <div className="col-span-1 text-sm font-bold text-slate-700">{app.pan_number || 'N/A'}</div>
                                        <div className="col-span-1 font-mono text-sm text-slate-500 truncate">{app.target_bank_account}</div>

                                        <div className="col-span-1">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${severity.bg} ${severity.text} border ${severity.border}`}>
                                                <Icon className="w-3 h-3 mr-1" />
                                                {severity.label}
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-sm font-bold text-slate-800 flex justify-between items-center">
                                            <span className="truncate block">{app.flag_reason || 'Clean Record'}</span>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`mx-6 mb-4 mt-2 p-4 rounded-lg bg-white/50 backdrop-blur-md border ${severity.border}`}>
                                                    <div className="p-4 bg-slate-100/50 rounded-lg">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Engine Execution Trace</h4>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <span className="text-xs text-slate-500 font-bold">Rule Trigger / Flag Details:</span><br />
                                                                <span className="text-sm font-medium text-slate-900">{app.flag_reason || "Passed all heuristics"}</span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div><span className="text-xs text-slate-500 font-bold">Network Graph Trace Score:</span><br /><span className="text-sm font-mono text-slate-900 font-semibold">{app.fraud_score.toFixed(2)} Decision Integrity</span></div>
                                                                <div><span className="text-xs text-slate-500 font-bold">Network Architecture:</span><br /><span className="text-sm font-mono text-slate-900 font-semibold">{app.fraud_score > 0.50 ? 'Anomalous Node Detected' : 'Isolated Node'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-3 mt-4">
                                                        <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-sm shadow-sm transition-colors cursor-pointer">
                                                            Force Approve
                                                        </button>
                                                        <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm shadow-sm transition-colors cursor-pointer">
                                                            Flag for CID Investigation
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
