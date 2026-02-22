import { motion } from 'framer-motion';
import { Upload, ScanLine, Network, ShieldCheck } from 'lucide-react';

const Pipeline = () => {
    const steps = [
        {
            icon: Upload,
            title: '1. Application Submission',
            desc: 'Citizen submits JSON metadata + Income Certificate Image payload to our high-throughput FastAPI queue.'
        },
        {
            icon: ScanLine,
            title: '2. OCR & PyTorch Analysis',
            desc: 'CUDA-accelerated Tesseract OCR reads the document. Our MLP Neural Network checks for extreme mismatches vs RTO databases.'
        },
        {
            icon: Network,
            title: '3. Graph Neural Clustering',
            desc: 'NetworkX bipartite graph scanning dynamically flags shared bank accounts connected to >3 Aadhaar profiles.'
        },
        {
            icon: ShieldCheck,
            title: '4. AI Verification Complete',
            desc: 'Fraud probability score evaluated (0-100%). Bureaucrats review the explainable AI flag reason instantly.'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-green-300">
                How Satark Works
            </h1>

            <div className="relative border-l-2 border-slate-700 ml-6 md:ml-12 space-y-12">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="relative pl-10"
                        >
                            <div className="absolute -left-[2.85rem] top-0 p-3 bg-blue-900 border-2 border-blue-400 rounded-full text-blue-300 glass-panel shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="glass-panel p-6 bg-white/10 hover:bg-white/40 transition-colors">
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                                <p className="text-slate-700 font-medium text-lg leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Pipeline;
