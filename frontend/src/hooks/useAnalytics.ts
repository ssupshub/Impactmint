import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api.service';
export const useOverviewMetrics = () => {
    return useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getOverview();
            return data;
        },
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000,
    });
};
export const useProjectAnalytics = () => {
    return useQuery({
        queryKey: ['analytics', 'projects'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getProjects();
            return data;
        },
        refetchInterval: 120000,
    });
};
export const useTimelineData = (start?: Date, end?: Date) => {
    return useQuery({
        queryKey: ['analytics', 'timeline', start, end],
        queryFn: async () => {
            const { data } = await analyticsAPI.getTimeline(start, end);
            return data;
        },
        enabled: !!start && !!end,
    });
};
