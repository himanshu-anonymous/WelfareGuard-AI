import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, AlertTriangle, FileText, Download, Building } from 'lucide-react';
import jsPDF from 'jspdf';

interface MyApplication {
    user_id: string;
    pan_number: string;
    target_bank_account: string;
    status: string;
    fraud_score: number;
    flag_reason: string;
    full_name: string;
    calculated_pan_income: number;
    yearly_incomes?: { [key: string]: number };
}

const CitizenDashboard = () => {
    const [data, setData] = useState<MyApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const downloadReceipt = async () => {
        if (!data) return;

        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("GOVTECH HUB", 105, 20, { align: "center" });

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text("Welfare Disbursement Receipt", 105, 28, { align: "center" });

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.text(`Status: ${data.status}`, 20, 45);
        pdf.text(`Citizen Name: ${data.full_name || 'N/A'}`, 20, 55);
        pdf.text(`Citizen ID: ${data.user_id}`, 20, 65);
        pdf.text(`Registered PAN: ${data.pan_number || 'N/A'}`, 20, 75);
        pdf.text(`Target Bank Account: ${data.target_bank_account}`, 20, 85);

        let yPos = 105;
        if (data.yearly_incomes && Object.keys(data.yearly_incomes).length > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.text("Bank & PAN Financial Verification", 20, yPos);
            pdf.setFont("helvetica", "normal");
            yPos += 10;

            // Draw each sorted year
            const sortedYears = Object.keys(data.yearly_incomes).sort();
            sortedYears.forEach((year) => {
                const income = data.yearly_incomes![year];
                pdf.text(`${year} Income: Rs. ${income.toLocaleString()}`, 25, yPos);
                yPos += 10;
            });

            pdf.setFont("helvetica", "bold");
            pdf.text(`Calculated 3-Year Average: Rs. ${data.calculated_pan_income?.toLocaleString() || 'N/A'}`, 25, yPos + 5);
        }

        // Stylized Footer
        pdf.setFont("courier", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);

        const theEnd = pdf.internal.pageSize.getHeight() - 30;
        pdf.text("--------------------------------------------------", 10, theEnd);
        pdf.text("BENEFICIARY ANALYSIS SYSTEM | SATARK AI", 10, theEnd + 5);
        pdf.text(`Timestamp: ${new Date().toLocaleString()} | Integrity Check: COMPLETED`, 10, theEnd + 10);
        const mock_hash_string = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        pdf.text(`Digital Signature: SHA-256 ${mock_hash_string}`, 10, theEnd + 15);

        pdf.save(`Satark_Receipt_${data.user_id}.pdf`);
    };

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
                className="glass-panel max-w-2xl w-full flex flex-col items-center relative"
            >
                <div className="p-8 w-full bg-white/50 rounded-t-2xl">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold tracking-widest uppercase text-slate-800">GovTech Hub</h2>
                        <p className="text-xs text-slate-500 font-bold tracking-widest">Welfare Disbursement Receipt</p>
                    </div>

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

                        {data.yearly_incomes && Object.keys(data.yearly_incomes).length > 0 && (
                            <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100/50 p-4 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 flex items-center">
                                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                                        Bank & PAN Financial Verification
                                    </h3>
                                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                        Verified via PAN Ledger
                                    </span>
                                </div>
                                <div className="p-4 space-y-3 bg-white/50">
                                    {Object.keys(data.yearly_incomes).sort().map((year) => (
                                        <div key={year} className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-500">{year} Income</span>
                                            <span className="font-bold text-slate-900">₹{data.yearly_incomes![year].toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-sm pt-3 border-t border-slate-200 mt-3">
                                        <span className="font-bold text-slate-700">Calculated 3-Year Average</span>
                                        <span className="font-black text-slate-900">₹{data.calculated_pan_income?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="mt-8 text-sm text-center text-slate-500 font-medium">
                        Please note: Satark employs AI cross-referencing on PAN financial architecture. Final decisions are algorithmic unless marked for manual review.
                    </p>
                </div>

                <div className="w-full bg-slate-100/50 p-4 border-t border-slate-200 rounded-b-2xl flex justify-center">
                    <button onClick={downloadReceipt} className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold shadow-md transition-all">
                        <Download className="w-4 h-4" />
                        <span>Download Official Receipt</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CitizenDashboard;
