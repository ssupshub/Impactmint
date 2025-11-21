import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api.service';
import 'leaflet/dist/leaflet.css';

const ProjectMap: React.FC = () => {
    const { data: projects, isLoading } = useQuery({
        queryKey: ['analytics', 'geographic'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getGeographic();
            return data;
        },
    });

    const methodologyColors = {
        REC: '#3b82f6', // blue
        REDD: '#22c55e', // green
        OPR: '#f59e0b', // orange
    };

    const createIcon = (methodology: string) => {
        const color = methodologyColors[methodology as keyof typeof methodologyColors] || '#6b7280';
        return new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"/>
          <circle fill="white" cx="12.5" cy="12.5" r="7"/>
        </svg>
      `)}`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Ensure projects is an array
    const projectsArray = Array.isArray(projects) ? projects : [];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Project Locations</h2>
            <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {projectsArray.length > 0 ? (
                        projectsArray.map((project: any) => (
                            <Marker
                                key={project._id}
                                position={[
                                    project.location?.coordinates?.latitude || 0,
                                    project.location?.coordinates?.longitude || 0,
                                ]}
                                icon={createIcon(project.methodology)}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-semibold">{project.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {project.methodology} • {project.status}
                                        </p>
                                        <p className="text-sm">
                                            Capacity: {project.capacity} tons
                                        </p>
                                        <p className="text-sm">
                                            NFTs: {project.nftCount || 0}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    ) : null}
                </MapContainer>
            </div>
            {projectsArray.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No projects to display on map</p>
            )}
        </div>
    );
};

export default ProjectMap;