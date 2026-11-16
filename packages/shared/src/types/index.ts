export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export type LinkStatus = 'active' | 'disabled' | 'expired';

export interface Link {
  id: string;
  ownerId: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  status: 'active' | 'disabled';
  expiresAt?: string | null;
  totalClicks: number;
  createdAt: string;
  updatedAt: string;
  shortUrl?: string;
}

export interface ClickEvent {
  id?: string;
  linkId: string;
  shortCode: string;
  occurredAt: string;
  referrerHost?: string | null;
  deviceType?: string | null;
  browserFamily?: string | null;
  countryCode?: string | null;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface LinkAnalytics {
  linkId: string;
  shortCode: string;
  totalClicks: number;
  todayClicks: number;
  timeSeries: TimeSeriesPoint[];
  referrers: BreakdownItem[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
}

export interface AnalyticsOverview {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  recentLinks: Link[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LinkFilters {
  search?: string;
  status?: 'all' | 'active' | 'disabled' | 'expired';
  page?: number;
  limit?: number;
}

export type TimeRange = '7d' | '30d' | '90d';
