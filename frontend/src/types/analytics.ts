// Analytics Types
export interface OverviewMetrics {
    totalTonsCO2: number;
    totalProjects: number;
    activeProjects: number;
    verifiedProjects: number;
    pendingProjects: number;
    totalCredits: number;
    creditsActive: number;
    creditsRetired: number;
    totalMRVSubmissions: number;
    calculatedCredits: number;
    marketplaceVolume: number;
}

export interface ProjectAnalytics {
    _id: string;
    name: string;
    methodology: string;
    status: string;
    location: {
        country: string;
        region: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    capacity: number;
    verifiedCapacity?: number;
    startDate: Date;
    createdAt: Date;
    nftCount: number;
    workflowStatus?: string;
    healthScore: number;
}

export interface MethodologyBreakdown {
    methodology: string;
    projectCount: number;
    totalCapacity: number;
    verifiedCapacity: number;
    avgCapacity: number;
    nftCount: number;
    retiredCount: number;
}

export interface TimelineDataPoint {
    date: Date;
    total: number;
    cumulative: number;
    REC: number;
    REDD: number;
    OPR: number;
}

export interface GeographicProject {
    _id: string;
    name: string;
    methodology: string;
    status: string;
    location: {
        country: string;
        region: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    capacity: number;
    nftCount: number;
}

export interface MarketplaceAnalytics {
    currentListings: number;
    totalVolume: number;
    avgPrice: number;
    priceHistory: Array<{
        date: Date;
        price: number;
    }>;
    mostTraded: Array<{
        projectId: string;
        projectName: string;
        volume: number;
    }>;
}

export interface UserMetrics {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Array<{
        _id: string;
        count: number;
    }>;
}

export interface ImpactEquivalents {
    treesPlanted: number;
    carsOffRoad: number;
    homesPowered: number;
    milesSaved: number;
}

export interface Transaction {
    id: string;
    type: 'mint' | 'transfer' | 'burn' | 'purchase';
    tokenId: string;
    serialNumber?: number;
    from?: string;
    to?: string;
    amount?: number;
    timestamp: Date;
    transactionId: string;
    status: 'pending' | 'confirmed' | 'failed';
}

export interface FilterState {
    methodology: string[];
    status: string[];
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    searchQuery: string;
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}
