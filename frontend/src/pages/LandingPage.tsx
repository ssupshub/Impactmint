import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CountUp from 'react-countup';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { analyticsAPI } from '../services/api.service';

const LandingPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['landing-stats'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getOverview();
            return data;
        },
    });

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            Carbon Offsets,
                            <br />
                            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                                Verified on Blockchain
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Trade, retire, and track carbon offset NFTs with complete transparency.
                            Built on Hedera for trust, speed, and sustainability.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                Explore Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white/10"
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>

                    {/* Stats Counter */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <Card variant="glass" padding="lg" className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <CountUp end={stats?.totalCredits || 0} duration={2.5} separator="," />
                            </div>
                            <div className="text-gray-300 text-lg">Tons CO₂ Offset</div>
                        </Card>
                        <Card variant="glass" padding="lg" className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <CountUp end={stats?.totalProjects || 0} duration={2.5} />
                            </div>
                            <div className="text-gray-300 text-lg">Active Projects</div>
                        </Card>
                        <Card variant="glass" padding="lg" className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                <CountUp end={stats?.totalNFTs || 0} duration={2.5} separator="," />
                            </div>
                            <div className="text-gray-300 text-lg">NFTs Minted</div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why ImpactMint?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The most transparent and efficient carbon offset marketplace powered by blockchain technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card hover padding="lg" className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Blockchain Verified</h3>
                            <p className="text-gray-600">
                                Every carbon credit is tokenized as an NFT on Hedera, ensuring immutable proof of ownership and retirement
                            </p>
                        </Card>

                        <Card hover padding="lg" className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                            <p className="text-gray-600">
                                Powered by Hedera's high-throughput network for instant transactions at minimal cost
                            </p>
                        </Card>

                        <Card hover padding="lg" className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
                            <p className="text-gray-600">
                                Track your environmental impact with comprehensive dashboards and detailed reporting
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simple, transparent, and secure carbon offset trading
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Browse Projects', desc: 'Explore verified carbon offset projects across multiple methodologies' },
                            { step: '02', title: 'Purchase NFTs', desc: 'Buy carbon credit NFTs representing real environmental impact' },
                            { step: '03', title: 'Track Impact', desc: 'Monitor your portfolio and environmental contribution in real-time' },
                            { step: '04', title: 'Retire Credits', desc: 'Permanently retire credits and receive verifiable certificates' },
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                <div className="text-6xl font-bold text-green-200 mb-4">{item.step}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-300 to-transparent"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Make an Impact?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join the future of carbon offsetting with blockchain-verified transparency
                    </p>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="bg-white text-green-600 hover:bg-gray-100"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Get Started Now
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">ImpactMint</h3>
                            <p className="text-gray-400">
                                Blockchain-verified carbon offsets for a sustainable future
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                                <li><a href="/projects" className="hover:text-white transition">Projects</a></li>
                                <li><a href="/marketplace" className="hover:text-white transition">Marketplace</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/docs" className="hover:text-white transition">Documentation</a></li>
                                <li><a href="/api" className="hover:text-white transition">API</a></li>
                                <li><a href="/support" className="hover:text-white transition">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/about" className="hover:text-white transition">About</a></li>
                                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 ImpactMint. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
