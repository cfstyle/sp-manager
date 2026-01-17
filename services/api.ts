
import { mockData } from '../mockData';
import {
  ProcedureListItem,
  ProcedureDetail,
  HistoryItem,
  DiffResponse,
  SearchResultItem,
  PaginatedResponse,
  TokenResponse,
  SaveResponse,
  RollbackResponse,
  CreateResponse
} from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // 1. 认证 (Authentication)
  login: async (data: any): Promise<TokenResponse> => {
    await delay(500);
    return mockData.responses.tokens;
  },

  // 2. 获取列表 (List Procedures)
  // Updated signature to accept owner filter
  getProcedures: async (limit = 10, offset = 0, owner?: string): Promise<PaginatedResponse<ProcedureListItem>> => {
    await delay(300);

    // 1. Get all raw data (simulate database table)
    let allResults = [...mockData.responses.list.results] as ProcedureListItem[];

    // 2. Inject Mock "My Procedures" if needed for the demo to ensure we have data
    if (owner === mockData.currentUser.username) {
      const myMockData = [
        {
          id: 9901,
          procedure_name: "sp_my_daily_report",
          database_name: "db2admin",
          creator: owner,
          owner: owner,
          description: "Personal daily sales aggregation",
          is_active: true,
          created_at: "2025-11-01T09:00:00",
          updated_at: "2026-01-18T10:30:00"
        },
        {
          id: 9902,
          procedure_name: "sp_data_cleanup_temp",
          database_name: "temp",
          creator: owner,
          owner: owner,
          description: "Temporary cleanup script for Q4",
          is_active: false,
          created_at: "2025-12-15T14:20:00",
          updated_at: "2026-01-10T11:15:00"
        },
        {
          id: 1355,
          procedure_name: "proc_test",
          database_name: "temp",
          creator: owner,
          owner: owner,
          description: "Test procedure for validation",
          is_active: true,
          created_at: "2025-10-14T15:29:06",
          updated_at: "2026-01-14T16:37:39"
        },
        // Generate some extra items to demonstrate pagination
        ...Array.from({ length: 15 }).map((_, i) => ({
          id: 10000 + i,
          procedure_name: `sp_auto_generated_report_${i + 1}`,
          database_name: i % 2 === 0 ? "crm" : "bcas",
          creator: owner,
          owner: owner,
          description: `Auto generated description for pagination test ${i + 1}`,
          is_active: true,
          created_at: "2025-01-01T00:00:00",
          updated_at: "2026-01-01T00:00:00"
        }))
      ];
      // Merge without duplicates (simplified)
      allResults = [...myMockData, ...allResults.filter(r => r.owner !== owner)];
    }

    // 3. Filter
    let filteredResults = allResults;
    if (owner) {
      filteredResults = allResults.filter(p => p.owner === owner || p.creator === owner);
    }

    // 4. Paginate
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    return {
      count: filteredResults.length, // Total count after filter
      next: offset + limit < filteredResults.length ? "true" : null,
      previous: offset > 0 ? "true" : null,
      results: paginatedResults
    } as unknown as PaginatedResponse<ProcedureListItem>;
  },

  // 3. 获取详情 (Detail)
  getProcedureDetail: async (procedure_id: string | number): Promise<ProcedureDetail> => {
    // Reduced delay significantly to optimize "beautify" perception time
    await delay(50);
    const numId = Number(procedure_id);

    // For demo purposes, if ID matches the detailed mock, return it
    if (numId === mockData.responses.detail.id) {
      return mockData.responses.detail as unknown as ProcedureDetail;
    }

    // Fallback: try to find in the list
    const found = mockData.responses.list.results.find(p => p.id === numId);
    if (found) {
      return {
        ...found,
        latest_history_id: 0,
        latest_content: '-- Content not available in list view --'
      };
    }

    // Check "My Procedures" mock IDs
    if (numId === 9901) {
      return {
        id: 9901,
        procedure_name: "sp_my_daily_report",
        database_name: "db2admin",
        creator: "chenfei",
        latest_history_id: 1,
        latest_content: "CREATE PROCEDURE sp_my_daily_report ...",
        updated_at: "2026-01-18T10:30:00",
        owner: "chenfei"
      };
    }
    // ... (Add dynamic handler if needed for the extra pagination items, but simple fallback works for now)

    // Dynamic Mock for Newly Created IDs (Simulated)
    if (numId > 9000) {
      return {
        ...mockData.responses.detail,
        id: numId,
        procedure_name: `new_procedure_${numId}`,
        latest_content: `-- This is a newly created procedure (ID: ${numId})\n-- Content would be fetched from DB normally.\n\nCREATE OR REPLACE PROCEDURE ${numId} ...`
      } as unknown as ProcedureDetail;
    }

    // Default Fallback
    return mockData.responses.detail as unknown as ProcedureDetail;
  },

  // 4. 全文检索 (Search)
  searchProcedures: async (q: string): Promise<PaginatedResponse<SearchResultItem>> => {
    await delay(400);
    const lowerQ = q.toLowerCase();

    if (lowerQ.includes('nick')) {
      return mockData.responses.searchNick as unknown as PaginatedResponse<SearchResultItem>;
    }

    if (lowerQ.includes('deposit')) {
      return mockData.responses.searchDeposit as unknown as PaginatedResponse<SearchResultItem>;
    }

    return { count: 0, next: null, previous: null, results: [] };
  },

  // 5. 保存 (Save)
  saveProcedure: async (procedure_id: number, new_content: string, change_summary: string, description?: string): Promise<SaveResponse> => {
    await delay(600);

    // 模拟失败场景：如果变更说明是 "测试失败"，则返回错误信息
    if (change_summary === '测试失败') {
      return {
        flag: false,
        procedure_id: procedure_id,
        history_id: 0,
        version_number: 0,
        info: `Traceback (most recent call last):
  File "/usr/local/lib/python3.9/site-packages/django/core/handlers/exception.py", line 47, in inner
    response = get_response(request)
  File "/app/sp_manager/views.py", line 128, in save_procedure
    ProcedureService.update_content(proc_id, content, summary)
  File "/app/sp_manager/services.py", line 45, in update_content
    raise Exception("Database transaction failed: SQL code -911")
Exception: Database transaction failed: SQL code -911
[IBM][CLI Driver][DB2/LINUXX8664] SQL0911N  The current transaction has been rolled back because of a deadlock or timeout.  Reason code "68".  SQLSTATE=40001`
      };
    }

    return mockData.responses.save;
  },

  // 6. 新建 (Create)
  createProcedure: async (data: { name: string, db: string, owner: string, content: string, description: string }): Promise<CreateResponse> => {
    await delay(800);
    // Mock success
    return {
      flag: true,
      id: Math.floor(Math.random() * 1000) + 9000, // Generate a random ID > 9000
      message: "存储过程创建成功"
    };
  },

  // 7. 历史版本 (History)
  getHistory: async (params: { procedure_id?: string | number, limit?: number, offset?: number } = {}): Promise<PaginatedResponse<HistoryItem>> => {
    await delay(300);
    const { procedure_id } = params;

    if (procedure_id && Number(procedure_id) === 1355) {
      return mockData.responses.historyDetail as unknown as PaginatedResponse<HistoryItem>;
    }

    if (!procedure_id) {
      return mockData.responses.historyGlobal as unknown as PaginatedResponse<HistoryItem>;
    }

    // Default fallback for other IDs
    return { count: 0, next: null, previous: null, results: [] };
  },

  // 8. 对比 (Diff)
  getDiff: async (v1_id: string | number, v2_id: string | number): Promise<DiffResponse> => {
    await delay(500);
    return mockData.responses.diff;
  },

  // 9. 回滚 (Rollback)
  rollbackProcedure: async (procedure_id: number, target_history_id: number): Promise<RollbackResponse> => {
    await delay(600);
    return mockData.responses.rollback;
  },

  // Dashboard stats
  getDashboardStats: async () => {
    await delay(200);
    return mockData.stats;
  }
};
