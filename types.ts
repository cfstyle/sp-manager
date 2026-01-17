

export interface TokenResponse {
  refresh: string;
  access: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProcedureListItem {
  id: number;
  procedure_name: string;
  database_name: string;
  creator: string;
  owner: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcedureDetail {
  id: number;
  procedure_name: string;
  database_name: string;
  creator: string;
  latest_history_id: number;
  latest_content: string;
  updated_at: string;
  // Optional fields that might be useful but aren't in the minimal doc
  owner?: string;
  description?: string;
  is_active?: boolean;
}

export interface SearchResultItem {
  id: number;
  database_name: string;
  procedure_name: string;
  highlighted_snippet: string;
}

export interface HistoryItem {
  id: number;
  version_number: number;
  modified_by_name: string;
  modified_at: string;
  change_summary: string;
  is_rollback: boolean;
  // Fields present in global activity context
  procedure_id?: number | string;
  procedure_name?: string;
  database_name?: string;
  content?: string; // Kept for frontend functionality (viewing code)
}

export interface DiffResponse {
  content_v1: string;
  content_v2: string;
  v1_summary: string;
  v2_summary: string;
}

export interface SaveResponse {
  flag: boolean;
  procedure_id: number;
  history_id: number;
  version_number: number;
  info: string;
}

export interface CreateResponse {
  flag: boolean;
  id: number;
  message: string;
}

export interface RollbackResponse {
  flag: boolean;
  id: number;
  history_id: number;
  version_number: number;
  message: string;
}

export interface DashboardStats {
  total: number;
  newThisMonth: number;
  changedThisMonth: number;
  activeDevelopers: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
}