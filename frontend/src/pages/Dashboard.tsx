import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Search, ChevronDown, ChevronUp, ShieldAlert, BarChart2, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Application {
    id: number;
    user_id: string;
    pan_number: string;
    target_bank_account: string;
    status: string;
    calculated_pan_income: number;
    fraud_score: number;
    flag_reason: string;
    created_at: string;
    yearly_incomes?: { [key: string]: number };
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
    const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
    const [analyticsData, setAnalyticsData] = useState<{ name: string, value: number }[]>([]);

    const handleAction = async (appId: number, action: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/applications/${appId}/action`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                fetchData(searchQuery);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/threat-analytics', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setAnalyticsData(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (viewMode === 'analytics') {
            fetchAnalyticsData();
        }
    }, [viewMode]);

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
        if (status === 'Red: Blocked') return { bg: 'bg-[#BA1200]/10', border: 'border-[#BA1200]/30', text: 'text-[#BA1200]', label: 'CRITICAL', icon: AlertCircle };
        if (status === 'Under Investigation') return { bg: 'bg-[#BA1200]/20', border: 'border-[#BA1200]/40', text: 'text-[#BA1200]', label: 'RBI REVIEW', icon: ShieldAlert };
        if (status === 'Yellow: Manual Audit') return { bg: 'bg-[#E27C37]/10', border: 'border-[#E27C37]/30', text: 'text-[#E27C37]', label: 'WARNING', icon: AlertCircle };
        return { bg: 'bg-[#006C67]/10', border: 'border-[#006C67]/30', text: 'text-[#006C67]', label: 'SAFE', icon: ShieldAlert };
    };

    return (
        <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto text-[#121212]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-['Playfair_Display'] font-black tracking-tight text-[#121212] mb-2">Satark Live Feed</h1>
                    <p className="text-[#006C67] font-mono tracking-widest text-sm uppercase">Monitoring realtime network anomalies.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="bg-slate-200 p-1 rounded-lg flex space-x-1">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 flex items-center rounded-md font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-[#006C67] text-white shadow-sm' : 'text-[#121212]/60 hover:text-[#121212]'}`}>
                            <List className="w-4 h-4 mr-2" /> Live Feed
                        </button>
                        <button onClick={() => setViewMode('analytics')} className={`px-4 py-2 flex items-center rounded-md font-bold text-sm transition-all ${viewMode === 'analytics' ? 'bg-[#006C67] text-white shadow-sm' : 'text-[#121212]/60 hover:text-[#121212]'}`}>
                            <BarChart2 className="w-4 h-4 mr-2" /> Threat Analytics
                        </button>
                    </div>

                    <div className="glass-panel px-4 py-2 flex items-center space-x-2">
                        <Search className="w-4 h-4 text-[#006C67]" />
                        <input
                            type="text"
                            placeholder="Search Citizen ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-[#121212] font-bold placeholder-[#121212]/50 w-48"
                        />
                    </div>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-[#006C67]/50">
                        <p className="text-sm font-bold text-[#121212]/60 uppercase tracking-wider mb-2">Network Scans</p>
                        <h3 className="text-3xl font-black text-[#121212]">{stats.total_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-[#006C67]/50">
                        <p className="text-sm font-bold text-[#121212]/60 uppercase tracking-wider mb-2">Verified Clean</p>
                        <h3 className="text-3xl font-black text-[#006C67]">{stats.real_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-[#BA1200]/50">
                        <p className="text-sm font-bold text-[#121212]/60 uppercase tracking-wider mb-2">Anomalous Clusters Blocked</p>
                        <h3 className="text-3xl font-black text-[#BA1200]">{stats.fake_applications}</h3>
                    </div>
                    <div className="glass-panel p-6 flex flex-col justify-center border-b-4 border-[#E27C37]/50">
                        <p className="text-sm font-bold text-[#121212]/60 uppercase tracking-wider mb-2">Capital Preserved (INR)</p>
                        <h3 className="text-3xl font-black text-[#E27C37]">₹{stats.funds_saved.toLocaleString()}</h3>
                    </div>
                </div>
            )}

            {viewMode === 'list' ? (
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
                                                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-md border border-white/10">
                                                                    {app.yearly_incomes && Object.keys(app.yearly_incomes).length > 0 && (
                                                                        <div className="col-span-2 grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-white/10">
                                                                            {Object.keys(app.yearly_incomes).sort().map(year => (
                                                                                <div key={year}>
                                                                                    <span className="text-xs text-slate-400 font-bold">{year} Income:</span><br />
                                                                                    <span className="text-sm font-bold text-white">₹{app.yearly_incomes![year].toLocaleString()}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className="col-span-2">
                                                                        <span className="text-xs text-[#121212]/60 font-bold">Actual 3-Year Avg PAN Income:</span><br />
                                                                        <span className={`text-sm font-bold ${app.calculated_pan_income > 250000 ? 'text-[#E27C37]' : 'text-[#006C67]'}`}>
                                                                            ₹{app.calculated_pan_income?.toLocaleString() || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs text-[#121212]/60 font-bold">Rule Trigger / Flag Details:</span><br />
                                                                    <span className="text-sm font-medium text-[#121212]/90">{app.flag_reason || "Passed all heuristics"}</span>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><span className="text-xs text-[#121212]/60 font-bold">Analysis Trace Score:</span><br /><span className="text-sm font-mono text-[#121212] font-semibold">{app.fraud_score.toFixed(2)} Decision Integrity</span></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex space-x-3 mt-4">
                                                            <button onClick={() => handleAction(app.id, 'approve')} className="px-5 py-2 bg-[#006C67] hover:bg-[#005a56] text-white rounded font-bold text-sm shadow-sm transition-colors cursor-pointer border border-[#006C67]/50">
                                                                Approve
                                                            </button>
                                                            <button onClick={() => handleAction(app.id, 'force_approve')} className="px-5 py-2 bg-[#E27C37] hover:bg-[#c96a2e] text-[#121212] rounded font-bold text-sm transition-all shadow-sm cursor-pointer border border-[#E27C37]/50">
                                                                Force Approve
                                                            </button>
                                                            <button onClick={() => handleAction(app.id, 'flag_rbi')} className="px-5 py-2 bg-[#BA1200] hover:bg-[#9e1000] text-white rounded font-bold text-sm transition-colors shadow-sm cursor-pointer border border-[#BA1200]/50">
                                                                Flag for RBI Investigation
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
            ) : (
                <div className="glass-panel p-8 h-[70vh] flex flex-col justify-center items-center w-full bg-white/50 backdrop-blur-md">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 w-full text-center">Threat Vectors by Category</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 w-full text-center">Breakdown of blocked applications across anomaly detection rules</p>

                    {analyticsData.length > 0 ? (
                        <div className="w-full h-full max-h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                        tickMargin={15}
                                    />
                                    <YAxis
                                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                        {analyticsData.map((_, index) => {
                                            const colors = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#10b981'];
                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500 font-bold">
                            Initializing Analytics... No flagged items to display.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
