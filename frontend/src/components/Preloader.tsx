import { motion } from 'framer-motion';

const Preloader = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-[#EBEBEB] flex flex-col items-center justify-center pointer-events-none"
        >
            <motion.h1
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-4xl md:text-6xl font-['Playfair_Display'] text-[#121212] tracking-[0.3em] ml-[0.3em] font-bold"
            >
                SATARK
            </motion.h1>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-6 flex items-center space-x-2"
            >
                <div className="w-2 h-2 rounded-full bg-[#006C67] animate-ping"></div>
                <span className="text-[#006C67] text-sm font-bold tracking-widest uppercase">Initializing Core Systems</span>
            </motion.div>
        </motion.div>
    );
};

export default Preloader;
