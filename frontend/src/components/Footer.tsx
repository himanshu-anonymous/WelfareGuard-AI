const Footer = () => {
    return (
        <footer className="bg-slate-900 mt-24 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm border-t border-slate-800 pt-8">
                <div className="mb-4 md:mb-0">
                    <img src="/logo.png" alt="Satark Logo" className="h-12 w-auto object-contain mb-3 brightness-0 invert opacity-90 origin-left" />
                    &copy; 2026 Satark - Welfare Distribution Network
                </div>

                <div className="text-right">
                    <p className="font-medium text-slate-300">
                        Engineered by: <span className="text-white font-bold">Himanshu Patil, Soham Shirke, Aarya, Saksham Jaswal</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
