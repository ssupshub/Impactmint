import axios from 'axios';
import type { OverviewMetrics, ProjectAnalytics, TimelineDataPoint } from '../types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const analyticsAPI = {
    getOverview: () => apiClient.get<OverviewMetrics>('/analytics/overview'),
    getProjects: () => apiClient.get<ProjectAnalytics[]>('/analytics/projects'),
    getMethodology: () => apiClient.get('/analytics/methodology'),
    getTimeline: (start?: Date, end?: Date) =>
        apiClient.get<TimelineDataPoint[]>('/analytics/timeline', {
            params: { start: start?.toISOString(), end: end?.toISOString() }
        }),
    getGeographic: () => apiClient.get('/analytics/geographic'),
    getMarketplace: () => apiClient.get('/analytics/marketplace'),
    exportData: (format: 'csv' | 'json') =>
        apiClient.get(`/analytics/export?format=${format}`, { responseType: 'blob' }),
};