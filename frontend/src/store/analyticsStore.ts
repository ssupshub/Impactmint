import { create } from 'zustand';
import type { FilterState } from '../types/analytics';
interface AnalyticsStore {
    filters: FilterState;
    setMethodologyFilter: (methodology: string[]) => void;
    setStatusFilter: (status: string[]) => void;
    setDateRange: (start: Date | null, end: Date | null) => void;
    setSearchQuery: (query: string) => void;
    resetFilters: () => void;
}
export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
    filters: {
        methodology: [],
        status: [],
        dateRange: { start: null, end: null },
        searchQuery: '',
    },
    setMethodologyFilter: (methodology) =>
        set((state) => ({
            filters: { ...state.filters, methodology },
        })),
    setStatusFilter: (status) =>
        set((state) => ({
            filters: { ...state.filters, status },
        })),
    setDateRange: (start, end) =>
        set((state) => ({
            filters: { ...state.filters, dateRange: { start, end } },
        })),
    setSearchQuery: (searchQuery) =>
        set((state) => ({
            filters: { ...state.filters, searchQuery },
        })),
    resetFilters: () =>
        set({
            filters: {
                methodology: [],
                status: [],
                dateRange: { start: null, end: null },
                searchQuery: '',
            },
        }),
}));