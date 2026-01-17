
import { ProcedureListItem, HistoryItem, DashboardStats, User } from './types';
import { mockData } from './mockData';

export const CURRENT_USER: User = mockData.currentUser;

// Populate initial mocks from the provided API responses to prevent crashes
export const MOCK_SPS: ProcedureListItem[] = mockData.responses.list.results as unknown as ProcedureListItem[];

export const MOCK_ACTIVITY: HistoryItem[] = mockData.responses.historyGlobal.results as unknown as HistoryItem[];

export const MOCK_STATS: DashboardStats = mockData.stats;
