import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="w-full flex flex-col pt-20">
            {/* Hero Section */}
            <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6 relative" style={{ backgroundColor: '#8FAFBDB3' }}>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                        Securing welfare with precision AI.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-800 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        Satark stops organized proxy networks from draining the Ladki Bahin Yojana by cross-referencing documents with automated PyTorch precision.
                    </p>
                    <Link
                        to="/apply"
                        className="inline-flex px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-lg font-semibold transition-all hover:scale-105 active:scale-95 items-center space-x-2"
                    >
                        <span>Apply Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </section>

            {/* The Problem Section */}
            <section id="problem" className="bg-white py-24 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="h-96 bg-slate-100 rounded-2xl shadow-inner flex items-center justify-center p-8 border border-slate-200">
                        <span className="text-slate-400 font-medium text-lg">Document Forgery Graphic Placeholder</span>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            Proxy networks are draining the system.
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            Organized proxy networks exploit government schemes by bulk-generating spoofed income certificates
                            and routing billions of rupees through proxy bank accounts. Traditional manual verification
                            cannot scale to intercept these coordinated fraud rings before the funds are dispersed.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section id="solution" className="py-24 px-6 md:px-12 lg:px-24" style={{ backgroundColor: '#FAFAFA' }}>
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16">The Engine</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Card 1 */}
                        <div className="glass-panel p-8 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">PAN Graph Inspector</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">Cross-references registered PAN endpoints to identify excessive wealth spikes or direct state treasury overlap prior to welfare disbursement.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">CUDA PyTorch Engine</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Hardware-accelerated Neural Networks instantly map extracted income against simulated RTO databases to spot luxury asset mismatches in milliseconds.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">NetworkX Graphing</h3>
                            <p className="text-slate-600 leading-relaxed">
                                In-memory graph engines trace direct connections between seemingly unrelated applications formatting a cluster of matching bank proxy accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
