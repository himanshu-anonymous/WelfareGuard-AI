import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SlideInButtonProps {
    to: string;
    text: string;
}

const SlideInButton = ({ to, text }: SlideInButtonProps) => {
    return (
        <Link to={to} className="inline-block">
            <motion.button
                whileHover="hover"
                initial="initial"
                className="relative overflow-hidden px-6 py-2 rounded-full border border-[#121212] text-[#121212] font-semibold flex items-center justify-center group"
            >
                <motion.div
                    variants={{ initial: { y: "100%" }, hover: { y: 0 } }}
                    transition={{ ease: [0.19, 1, 0.22, 1], duration: 0.5 }}
                    className="absolute inset-0 bg-[#E27C37] z-0"
                />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                    {text}
                </span>
            </motion.button>
        </Link>
    );
};

export default SlideInButton;
