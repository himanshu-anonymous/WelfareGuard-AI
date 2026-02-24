import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
    const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

    return (
        <motion.div
            className="w-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
            {/* Hero Section */}
            <section ref={containerRef} className="relative w-full h-screen min-h-[100vh] flex flex-col justify-center items-center text-center overflow-hidden pt-24 px-6">
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ y: yBackground }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#E27C37]/10 rounded-full blur-[120px]"></div>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl relative z-10"
                    style={{ y: yText }}
                >
                    <h1 className="text-6xl md:text-8xl font-black text-[#121212] mb-6 leading-tight tracking-tight">
                        Universal Welfare <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006C67] to-[#004a46]">Verification Engine.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#121212]/80 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                        Securing Direct Benefit Transfers (DBT) and state schemes with real-time, PAN-based financial topology. Cross-referencing documents with automated precise heuristics.
                    </p>
                    <Link
                        to="/apply"
                        className="inline-flex px-10 py-5 bg-[#E27C37] text-white rounded-full hover:bg-[#c96a2e] font-bold transition-all hover:scale-105 active:scale-95 items-center space-x-3 shadow-md hover:shadow-lg"
                    >
                        <span className="text-lg uppercase tracking-wider">Start Application</span>
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </motion.div>
            </section>

            {/* The Problem Section */}
            <section id="problem" className="py-24 px-6 md:px-12 lg:px-24 border-t border-[#121212]/5 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        className="glass-panel h-96 flex items-center justify-center p-4 relative overflow-hidden"
                        animate={{ y: [-15, 5, -15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E27C37]/10 to-transparent z-0"></div>
                        <img
                            src="/threat_simulation.jpg"
                            alt="Threat Topology Mapping"
                            className="relative z-10 w-full h-full object-cover rounded-lg shadow-2xl drop-shadow-[0_15px_15px_rgba(18,18,18,0.3)]"
                        />
                    </motion.div>
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-[#121212] mb-6 leading-tight">
                            Proxy networks are draining the system.
                        </h2>
                        <p className="text-lg text-[#121212]/80 leading-relaxed font-medium">
                            Organized proxy networks exploit government schemes by bulk-generating spoofed income certificates
                            and routing billions of rupees through proxy bank accounts. Traditional manual verification
                            cannot scale to intercept these coordinated fraud rings before the funds are dispersed.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section id="solution" className="py-32 px-6 md:px-12 lg:px-24 border-t border-[#121212]/5 relative z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-[#121212] mb-20 tracking-tight">The Engine</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Card 1 */}
                        <div className="glass-panel p-8 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-[#121212] mb-4">PAN Graph Inspector</h3>
                            <p className="text-[#121212]/80 font-medium leading-relaxed">Cross-references registered PAN endpoints to identify excessive wealth spikes or direct state treasury overlap prior to welfare disbursement.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel p-8 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-[#121212] mb-4">Deterministic Heuristics</h3>
                            <p className="text-[#121212]/80 font-medium leading-relaxed">
                                Core logic instantly maps extracted income and identity across simulated databases to spot mismatches and anomalies in milliseconds.
                            </p>
                        </div>

                        {/* Card 3 - CSS Pattern Background */}
                        <div className="glass-panel p-8 transform transition hover:-translate-y-2 relative overflow-hidden h-80 flex flex-col justify-center">
                            <div className="absolute inset-0 z-0 opacity-5"
                                style={{ backgroundImage: 'radial-gradient(#006C67 2px, transparent 2px)', backgroundSize: '24px 24px' }}
                            />
                            <div className="relative z-10 pointer-events-none">
                                <h3 className="text-2xl font-bold text-[#121212] mb-4">Graph-Based Threat Topology</h3>
                                <p className="text-[#121212]/80 font-medium leading-relaxed">
                                    Real-time PAN network mapping traces direct connections between seemingly unrelated applications, formatting a cluster of matching bank proxy accounts in milliseconds.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default Home;
