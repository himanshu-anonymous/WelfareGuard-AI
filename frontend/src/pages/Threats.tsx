import { motion } from 'framer-motion';
import { FileWarning, Banknote, Users } from 'lucide-react';

const Threats = () => {
    const threats = [
        {
            id: 1,
            title: 'Document Forgery',
            icon: FileWarning,
            color: 'text-red-400',
            description: 'Wealthy individuals doctor PDFs or physical copies of income certificates to falsely claim poverty levels.',
        },
        {
            id: 2,
            title: 'Wealth Concealment',
            icon: Banknote,
            color: 'text-yellow-400',
            description: 'Applicants state low income on paper but own luxury assets like high-end vehicles registered with the RTO.',
        },
        {
            id: 3,
            title: 'Proxy Networks',
            icon: Users,
            color: 'text-purple-400',
            description: 'Organized networks submit hundreds of fake Aadhaar profiles that all route scheme payouts directly to a shared bank account.',
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                    The Threat Landscape
                </h1>
                <p className="text-xl text-slate-700 font-medium max-w-3xl mx-auto">
                    How proxy networks and wealthy individuals exploit schemes like Ladki Bahin and Merit Scholarships using spoofed documents and proxy networks.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {threats.map((threat, index) => {
                    const Icon = threat.icon;
                    return (
                        <motion.div
                            key={threat.id}
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="glass-panel p-8 group transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            <div className={`p-4 rounded-full bg-white/40 inline-block mb-6 group-hover:scale-110 transition-transform ${threat.color}`}>
                                <Icon className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">{threat.title}</h3>
                            <p className="text-slate-700 font-medium leading-relaxed text-lg">
                                {threat.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Threats;
