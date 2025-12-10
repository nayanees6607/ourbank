import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGlobe, FaCreditCard, FaShieldAlt, FaHeadset, FaArrowRight, FaCode, FaCheckCircle, FaLock, FaUniversity } from 'react-icons/fa';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password, false);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
        }
    };

    const features = [
        { icon: <FaGlobe className="text-[#635BFF] text-2xl" />, title: "Global Payments", description: "Accept payments from anywhere in the world with our unified platform." },
        { icon: <FaCreditCard className="text-[#00D4FF] text-2xl" />, title: "Corporate Cards", description: "Issue physical and virtual cards for your team instantly." },
        { icon: <FaShieldAlt className="text-[#635BFF] text-2xl" />, title: "Fraud Protection", description: "Real-time machine learning detects and blocks fraudulent transactions." },
        { icon: <FaHeadset className="text-[#00D4FF] text-2xl" />, title: "24/7 Support", description: "Get help whenever you need it from our dedicated support team." },
    ];

    return (
        <div className="w-full text-slate-900 font-sans bg-white selection:bg-[#635BFF] selection:text-white">

            {/* HERO SECTION */}
            <div className="relative min-h-[90vh] flex flex-col overflow-hidden bg-white">
                {/* Bank Name Header */}
                <div className="w-full py-4 px-6 flex items-center gap-3 z-20">
                    <div className="bg-[#635BFF] p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                        <FaUniversity className="text-white text-2xl" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        Vitta <span className="font-light text-slate-500">Bank</span>
                    </span>
                </div>

                {/* Diagonal Gradient Background */}
                {/* Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 stripe-mesh-bg"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-white via-white/80 to-transparent z-1"></div>
                </div>

                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1 py-20 lg:py-0 relative z-10">
                    {/* Left Column: Hero Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="hidden lg:block space-y-8"
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Financial <br />
                            infrastructure <br />
                            to grow your <br />
                            <span className="text-gradient">revenue</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
                            Join millions of companies of all sizes that use Vitta Bank to accept payments online and in person, embed financial services, and build better businesses.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <button className="bg-[#635BFF] text-white px-8 py-4 rounded-full font-bold hover:bg-[#5349e0] transition-all shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] hover:-translate-y-1 flex items-center gap-2 group text-lg">
                                Start now
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-transparent text-slate-700 border border-slate-300 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-all hover:-translate-y-1 text-lg">
                                Contact sales
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Login Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="w-full max-w-[480px] mx-auto lg:ml-auto"
                    >
                        <div className="bg-white p-10 relative overflow-hidden rounded-2xl shadow-none border border-slate-200">
                            {/* Decorative top shape */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#635BFF] to-[#00D4FF]"></div>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Sign in to your account</h2>
                                <p className="text-slate-500 text-base">Access the Vitta dashboard to manage your finances.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-semibold text-slate-700">Password</label>
                                        <Link to="/forgot-password" className="text-sm font-medium text-[#635BFF] hover:text-[#5349e0]">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="pt-2"></div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] transform active:scale-[0.98] transition-all duration-200 text-lg"
                                >
                                    Sign In
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-slate-500 text-base">
                                    Don't have an account? <Link to="/register" className="text-[#635BFF] font-bold hover:underline">Sign up</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-32 bg-white relative z-10"
            >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-[#635BFF] font-bold tracking-widest uppercase text-xs mb-4">Why Vitta Bank</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">A fully integrated suite of financial products</h3>
                        <p className="text-xl text-slate-500 leading-relaxed font-light">We bring together everything that's required to build websites and apps that accept payments and send payouts globally.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="group p-8 rounded-2xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-100"
                            >
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-[15px]">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* DEVELOPER / INFRASTRUCTURE SECTION */}
            <section className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-[#635BFF] font-bold tracking-widest uppercase text-xs mb-4">Designed for Developers</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">The world's most powerful API</h3>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light">
                            Vitta Bank was designed with developers in mind. Our robust APIs and comprehensive documentation make integration a breeze.
                        </p>
                        <ul className="space-y-5 mb-10">
                            {[
                                "Pre-built checkout flows",
                                "Customizable UI components",
                                "Real-time webhooks",
                                "Sandbox environment"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-700 font-medium text-lg">
                                    <div className="text-[#635BFF]"><FaCheckCircle className="text-xl" /></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="text-[#635BFF] font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all group">
                            Read the documentation <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative perspective-1000"
                    >
                        {/* Abstract Code Block Mockup */}
                        <div className="bg-[#1A202C] rounded-xl shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25)] p-0 overflow-hidden transform rotate-y-6 rotate-z-2 hover:rotate-0 transition-all duration-700 ease-out border border-slate-700/50">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#2D3748] border-b border-slate-700">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                                <div className="ml-4 text-xs text-slate-400 font-mono">payment-intent.js</div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm leading-relaxed">
                                    <code>
                                        <span className="text-[#C792EA]">const</span> <span className="text-[#82AAFF]">session</span> = <span className="text-[#C792EA]">await</span> stripe.<span className="text-[#82AAFF]">checkout</span>.sessions.<span className="text-[#82AAFF]">create</span>({`{`}
                                        <span className="text-[#F07178]">payment_method_types</span>: [<span className="text-[#C3E88D]">'card'</span>],
                                        <span className="text-[#F07178]">line_items</span>: [{`{`}
                                        <span className="text-[#F07178]">price_data</span>: {`{`}
                                        <span className="text-[#F07178]">currency</span>: <span className="text-[#C3E88D]">'usd'</span>,
                                        <span className="text-[#F07178]">product_data</span>: {`{`}
                                        <span className="text-[#F07178]">name</span>: <span className="text-[#C3E88D]">'T-shirt'</span>,
                                        {`}`},
                                        <span className="text-[#F07178]">unit_amount</span>: <span className="text-[#F78C6C]">2000</span>,
                                        {`}`},
                                        <span className="text-[#F07178]">quantity</span>: <span className="text-[#F78C6C]">1</span>,
                                        {`}`}],
                                        <span className="text-[#F07178]">mode</span>: <span className="text-[#C3E88D]">'payment'</span>,
                                        <span className="text-[#F07178]">success_url</span>: <span className="text-[#C3E88D]">'https://example.com/success'</span>,
                                        <span className="text-[#F07178]">cancel_url</span>: <span className="text-[#C3E88D]">'https://example.com/cancel'</span>,
                                        {`}`});
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECURITY SECTION */}
            <section className="py-32 bg-[#0A2540] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#00D4FF]/10 mb-10 border border-[#00D4FF]/20 shadow-[0_0_50px_-10px_rgba(0,212,255,0.3)]">
                            <FaLock className="text-4xl text-[#00D4FF]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Enterprise-grade security</h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-16 font-light leading-relaxed">
                            Security is at the heart of everything we do. We adhere to the highest international standards to ensure your funds and data are always protected.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto">
                        {[
                            { title: "AES-256 Encryption", desc: "Data is encrypted at rest and in transit." },
                            { title: "SOC 2 Certified", desc: "Compliance with industry best practices." },
                            { title: "24/7 Monitoring", desc: "Automated systems track anomalies in real-time." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl"
                            >
                                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h4>
                                <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-50 border-t border-slate-200 py-16">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#635BFF] rounded-lg flex items-center justify-center">
                                <FaUniversity className="text-white text-sm" />
                            </div>
                            <span className="text-slate-500 font-semibold tracking-tight">© 2024 Vitta Bank</span>
                        </div>
                        <div className="flex gap-8 text-slate-500 font-medium text-sm">
                            <a href="#" className="hover:text-[#635BFF] transition-colors">Privacy</a>
                            <a href="#" className="hover:text-[#635BFF] transition-colors">Terms</a>
                            <a href="#" className="hover:text-[#635BFF] transition-colors">Sitemap</a>
                            <Link to="/admin-login" className="hover:text-[#635BFF] transition-colors">
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
