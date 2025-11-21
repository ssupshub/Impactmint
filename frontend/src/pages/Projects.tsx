import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import ThemeToggle from '../components/ui/ThemeToggle';
import Card from '../components/ui/Card';

const Projects: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Sidebar />

            <div className="pl-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
                    <div className="px-6 py-4">
                        <div className="mb-3">
                            <Breadcrumb
                                items={[
                                    { label: 'Home', href: '/' },
                                    { label: 'Projects' },
                                ]}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Carbon Offset Projects
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Explore and support verified environmental projects
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <Badge variant="success" size="md" rounded>
                                    Verified
                                </Badge>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Realistic Project Data */}
                        {[
                            {
                                id: 1,
                                name: "Rimba Raya Biodiversity Reserve",
                                location: "Central Kalimantan, Indonesia",
                                type: "Forestry",
                                verifier: "Verra VCS",
                                price: 16.50,
                                image: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                                description: "Protecting 64,000 hectares of tropical peat swamp forest, home to endangered Bornean orangutans.",
                                tags: ["SDG 13", "SDG 15", "Biodiversity"]
                            },
                            {
                                id: 2,
                                name: "Keo Seima Wildlife Sanctuary",
                                location: "Mondulkiri, Cambodia",
                                type: "REDD+",
                                verifier: "Gold Standard",
                                price: 14.20,
                                image: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                                description: "Conserving one of Cambodia's most important forests and supporting indigenous Bunong communities.",
                                tags: ["Community", "Wildlife", "REDD+"]
                            },
                            {
                                id: 3,
                                name: "Delta Blue Carbon Project",
                                location: "Sindh, Pakistan",
                                type: "Blue Carbon",
                                verifier: "Verra VCS",
                                price: 28.00,
                                image: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                                description: "The world's largest mangrove restoration project, sequestering millions of tons of CO2 annually.",
                                tags: ["Mangroves", "Blue Carbon", "Restoration"]
                            },
                            {
                                id: 4,
                                name: "Cordillera Azul National Park",
                                location: "Peru",
                                type: "Forestry",
                                verifier: "Verra VCS",
                                price: 12.75,
                                image: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
                                description: "Protecting a massive expanse of Andean cloud forest and lowland rainforest in the Amazon.",
                                tags: ["Amazon", "Conservation", "SDG 15"]
                            },
                            {
                                id: 5,
                                name: "Mai Ndombe REDD+ Project",
                                location: "DR Congo",
                                type: "REDD+",
                                verifier: "Verra VCS",
                                price: 11.50,
                                image: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
                                description: "Protecting 248,000 hectares of rainforest from logging and slash-and-burn agriculture.",
                                tags: ["Rainforest", "Community", "Africa"]
                            },
                            {
                                id: 6,
                                name: "Southern Cardamom REDD+",
                                location: "Koh Kong, Cambodia",
                                type: "REDD+",
                                verifier: "Verra VCS",
                                price: 15.80,
                                image: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                                description: "Protecting a critical part of the Indo-Burma Biodiversity Hotspot and Asian Elephant habitat.",
                                tags: ["Elephants", "Biodiversity", "Asia"]
                            }
                        ].map((project) => (
                            <Card key={project.id} hover padding="none" className="flex flex-col h-full overflow-hidden border border-gray-100 dark:border-gray-800">
                                {/* Project Image / Gradient Placeholder */}
                                <div 
                                    className="h-48 relative overflow-hidden group"
                                    style={{ background: project.image }}
                                >
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Badge variant="success" size="sm" rounded className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/50">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-2 py-1 text-xs font-semibold text-white bg-black/40 backdrop-blur-md rounded-md border border-white/10">
                                            {project.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {project.verifier}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {project.location}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-primary-500 transition-colors">
                                        {project.name}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-0.5">Price per ton</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                ${project.price.toFixed(2)}
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition shadow-sm hover:shadow-md">
                                            View Project
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Projects;
