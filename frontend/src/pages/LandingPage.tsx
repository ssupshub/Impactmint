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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-screen flex items-center pt-20 pb-20">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="container relative z-10 mx-auto px-6 max-w-7xl w-full">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {/* Badge */}
                        <div className="inline-block mb-8 px-6 py-2 rounded-full glass border border-primary-500/30 shadow-glow-sm">
                            <span className="text-primary-400 font-semibold text-sm tracking-wide uppercase">🌱 Carbon-Negative Blockchain</span>
                        </div>
                        
                        {/* Heading */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                            Carbon Offsets,
                            <br />
                            <span className="gradient-text">
                                Verified on Blockchain
                            </span>
                        </h1>
                        
                        {/* Description */}
                        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Trade, retire, and track carbon offset NFTs with complete transparency.
                            Built on Hedera for trust, speed, and sustainability.
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                            <Button
                                variant="primary"
                                size="xl"
                                className="w-full sm:w-auto min-w-[200px] shadow-glow-md hover:scale-105 transition-transform"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                Explore Dashboard
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                size="xl"
                                className="w-full sm:w-auto min-w-[200px] hover:bg-white/5"
                            >
                                Learn More
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Card variant="glass" padding="lg" hover className="text-center border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="text-4xl font-bold gradient-text mb-2">
                                    <CountUp end={stats?.totalCredits || 12547} duration={2.5} separator="," />
                                </div>
                                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Tons CO₂ Offset</div>
                            </Card>
                            <Card variant="glass" padding="lg" hover className="text-center border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="text-4xl font-bold gradient-text mb-2">
                                    <CountUp end={stats?.totalProjects || 156} duration={2.5} />
                                </div>
                                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Projects</div>
                            </Card>
                            <Card variant="glass" padding="lg" hover className="text-center border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="text-4xl font-bold gradient-text mb-2">
                                    <CountUp end={stats?.totalCredits || 8932} duration={2.5} separator="," />
                                </div>
                                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">NFTs Minted</div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-900/50 backdrop-blur-sm relative">
                <div className="container mx-auto px-6 max-w-7xl w-full">
                    <div className="text-center mb-20">
                        <div className="inline-block mb-4 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-500/20 text-primary-400 font-semibold text-sm uppercase tracking-wider">
                            ✨ Premium Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Why <span className="gradient-text">ImpactMint</span>?
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            The most transparent and efficient carbon offset marketplace powered by blockchain technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <Card hover padding="xl" className="text-center h-full flex flex-col bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow-sm shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Blockchain Verified</h3>
                            <p className="text-base text-gray-400 leading-relaxed flex-1">
                                Every carbon credit is tokenized as an NFT on Hedera, ensuring immutable proof of ownership and retirement
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card hover padding="xl" className="text-center h-full flex flex-col bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow-sm shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                            <p className="text-base text-gray-400 leading-relaxed flex-1">
                                Powered by Hedera's high-throughput network for instant transactions at minimal cost
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card hover padding="xl" className="text-center h-full flex flex-col bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow-sm shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Real-Time Analytics</h3>
                            <p className="text-base text-gray-400 leading-relaxed flex-1">
                                Track your environmental impact with comprehensive dashboards and detailed reporting
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary-900/80 to-secondary-900/80 backdrop-blur-md border-t border-white/10">
                <div className="container mx-auto px-6 text-center max-w-4xl w-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Make an <span className="text-primary-400">Impact</span>?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of organizations offsetting their carbon footprint with blockchain-verified credits
                    </p>
                    <Button 
                        variant="primary" 
                        size="xl" 
                        className="shadow-glow-lg hover:scale-105 transition-transform min-w-[240px]"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Get Started Today
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
