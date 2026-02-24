import { motion } from 'framer-motion';

const teamMembers = [
    {
        name: "Himanshu Patil",
        role: "Backend & Systems Architect",
        image: "/himanshupatil.png",
        bio: "Himanshu engineered Satark’s core data pipeline. Specializing in Python, TypeScript, and distributed architecture, he built the high-concurrency backend and anomaly detection engine, ensuring the platform scales flawlessly under state-level loads.",
    },
    {
        name: "Aarya Maurya",
        role: "Lead Frontend Engineer",
        image: "/aaryamaurya.png",
        bio: "Translating complex threat analytics into actionable bureaucracy. Aarya engineered the minimalist, high-contrast user interface, utilizing advanced Glassmorphism and Tailwind CSS to ensure the platform is as intuitive for local government operators as it is impenetrable to fraudsters.",
    },
    {
        name: "Soham Shirke",
        role: "Database Architect",
        image: "/sohamshirke.png",
        bio: "The guardian of the data pipeline. Soham designed and deployed the resilient database architecture that powers Satark's anomaly detection. He engineered the high-speed querying logic that allows the system to cross-reference years of financial ledgers in milliseconds.",
    },
    {
        name: "Saksham Jaiswal",
        role: "Interaction Engineer",
        image: "/sakshamjaiswal.png",
        bio: "Bridging the gap between static data and human intuition. Saksham brought the application to life through precision state management and dynamic UI scripting. He integrated the buttery-smooth Framer Motion animations and micro-interactions that give Satark its premium, enterprise-grade feel.",
    }
];

const AboutUs = () => {
    return (
        <div className="w-full flex flex-col pt-32 pb-24 px-6 md:px-12 lg:px-24">
            {/* The Vision Section */}
            <section className="max-w-4xl mx-auto text-center mb-32 relative z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black text-[#121212] mb-10 tracking-tight font-['Playfair_Display']">
                        Our Vision.
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-[#121212]/90 leading-relaxed max-w-4xl mx-auto">
                        Building an un-gameable truth engine for India's welfare infrastructure. Satark eradicates systemic leakage in <span className="text-[#006C67] font-bold">Direct Benefit Transfers (DBT)</span> through real-time, <span className="text-[#006C67] font-bold">PAN-based financial audits</span>—ensuring state funds bypass fraudulent syndicates and reach the citizens who truly need them.
                    </p>
                </motion.div>
            </section>

            {/* Team Layout Section */}
            <section className="max-w-6xl mx-auto space-y-32 relative z-10">
                {teamMembers.map((member, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <motion.div
                            key={member.name}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
                        >
                            {/* Image Container */}
                            <div className="w-full md:w-1/2 flex justify-center">
                                <div className="relative w-72 h-72 md:w-96 md:h-96">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,108,103,0.15)] border border-white/40 animate-[bounce_3s_ease-in-out_infinite]"
                                        style={{ animationDuration: `${3 + index * 0.2}s` }} // Slight offset for each floating animation
                                    />
                                </div>
                            </div>

                            {/* Bio Container */}
                            <div className="w-full md:w-1/2 flex-col justify-center text-center md:text-left">
                                <h3 className="text-3xl md:text-4xl font-black text-[#121212] mb-2">{member.name}</h3>
                                <p className="text-[#E27C37] font-bold text-lg tracking-wider uppercase mb-6">{member.role}</p>
                                <p className="text-[#121212]/80 font-medium text-lg leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </section>
        </div>
    );
};

export default AboutUs;
