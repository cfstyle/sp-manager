
export const mockData = {
  currentUser: {
    id: "u1",
    username: "chenfei",
    name: "陈飞",
    avatar: "https://picsum.photos/200/200"
  },
  stats: {
    total: 1373,
    newThisMonth: 12,
    changedThisMonth: 34,
    activeDevelopers: 8
  },
  responses: {
    tokens: {
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2ODcxODIwMiwiaWF0IjoxNzY4NjMxODAyLCJqdGkiOiI2YmEwY2NkNjNlYTI0NmQyOGVkMTlhNjliNDkyYjg4OSIsInVzZXJfaWQiOjEwfQ.sfglDEorStyYfbtimUdTfVqSErckgxmk-QKL3djg6cI",
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4NzE4MjAyLCJpYXQiOjE3Njg2MzE4MDIsImp0aSI6ImJiM2QyMWYzZTQ0ODQzYzE5MDhhM2VjZWQ2ZGJhZmNkIiwidXNlcl9pZCI6MTB9.-bRa4FVqQ5T-F9ensMl95gxiUerUwgx1a_JXmxQsulg"
    },
    list: {
      "count": 1373,
      "next": "http://localhost:8000/api/spmanager/procedures/?limit=10&offset=10",
      "previous": null,
      "results": [
        { "id": 435, "procedure_name": "fr_shb_qlpp", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-04-17T09:21:11", "updated_at": "2026-01-14T16:37:31" },
        { "id": 434, "procedure_name": "fr_shb_zlpp", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-08-07T17:45:05", "updated_at": "2026-01-14T16:37:31" },
        { "id": 928, "procedure_name": "hgb_dg_noncompliantaccount_sls", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-10-20T14:47:07", "updated_at": "2026-01-14T16:37:31" },
        { "id": 5421, "procedure_name": "kmh_2026_wcqktj", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2026-01-06T18:14:35", "updated_at": "2026-01-14T16:37:31" },
        { "id": 1333, "procedure_name": "operhisdata", "database_name": "rugao", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-05-12T17:40:59", "updated_at": "2026-01-14T16:37:31" },
        { "id": 658, "procedure_name": "pd_bldkqs_proc", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-05-08T16:44:04", "updated_at": "2026-01-14T16:37:31" },
        { "id": 664, "procedure_name": "prc_c_dp_acct_txn_dtl", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-07-21T17:43:54", "updated_at": "2026-01-14T16:37:31" },
        { "id": 665, "procedure_name": "prc_c_dp_agree_dpsit_acct_info", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-05-08T17:39:18", "updated_at": "2026-01-14T16:37:31" },
        { "id": 869, "procedure_name": "prc_c_dp_agree_dpsit_acct_info_mm", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-07-23T10:38:23", "updated_at": "2026-01-14T16:37:31" },
        { "id": 666, "procedure_name": "prc_c_dp_dpsit_acct_info", "database_name": "db2admin", "creator": "unknown", "owner": "rugao", "description": "", "is_active": true, "created_at": "2025-07-23T16:11:06", "updated_at": "2026-01-14T16:37:31" }
      ]
    },
    detail: {
      "id": 1355,
      "procedure_name": "proc_test",
      "database_name": "temp",
      "creator": "unknown",
      "owner": "rugao",
      "description": "",
      "is_active": true,
      "created_at": "2025-10-14T15:29:06",
      "updated_at": "2026-01-14T16:37:39",
      "latest_history_id": 1452,
      "latest_content": "CREATE OR REPLACE PROCEDURE TEMP.PROC_TEST (\r\n\t IN P_DATE VARCHAR(10),\r\n    OUT V_OUT_FLAG VARCHAR(500) )\r\nBEGIN\r\n    DECLARE V_OUT_MSG               VARCHAR(100); -- SQLSTATE码\r\n    DECLARE V_ERRNO                 INT ; -- 返回错误码\r\n    DECLARE V_ERR_MSG               VARCHAR(2000);\r\n  \tDECLARE C_YMD\t\t\t\t\tVARCHAR(10); -- 返回错误信息 \r\n    DECLARE EXIT HANDLER FOR SQLEXCEPTION,SQLWARNING\r\n\r\nBEGIN\r\nGET DIAGNOSTICS CONDITION 1 SQLERRM = MESSAGE_TEXT;\r\nVALUES(SQLCODE, SQLSTATE, SQLERRM) INTO V_ERRNO, V_OUT_MSG, V_ERR_MSG;\r\nEND;\r\n\r\nSET C_YMD = P_DATE;\r\nCOMMIT;\r\nSET V_OUT_FLAG ='SUCCESS ' || C_YMD;\r\n\r\nRETURN;\r\nEND;"
    },
    searchNick: {
      "count": 10,
      "results": [
        { "id": 115, "database_name": "bcas", "procedure_name": "tmp_20250415", "highlighted_snippet": "... mc<mark class=\"highlight\">nick</mark>name ..." },
        { "id": 289, "database_name": "db2admin", "procedure_name": "proc_nick_hgjc_hgglb2023004", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE DB2ADMIN.PROC_<mark class=\"highlight\">NICK</mark>_HGJC_HGGLB2023004 ..." },
        { "id": 303, "database_name": "db2admin", "procedure_name": "proc_nick_hgjc_hgglb2022064", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE DB2ADMIN.PROC_<mark class=\"highlight\">NICK</mark>_HGJC_HGGLB2022064 ..." },
        { "id": 304, "database_name": "db2admin", "procedure_name": "proc_nick_hgjc_hgglb2023003", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE DB2ADMIN.PROC_<mark class=\"highlight\">NICK</mark>_HGJC_HGGLB2023003 ..." },
        { "id": 305, "database_name": "db2admin", "procedure_name": "proc_nick_hgjc_hgglb2023001", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE db2admin.proc_<mark class=\"highlight\">nick</mark>_hgjc_hgglb2023001 ..." },
        { "id": 309, "database_name": "db2admin", "procedure_name": "proc_nick_hgjc_hgglb2022063", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE db2admin.proc_<mark class=\"highlight\">nick</mark>_hgjc_hgglb2022063 ..." },
        { "id": 415, "database_name": "db2admin", "procedure_name": "proc_nick_hg_wbrygl_count", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE db2admin.proc_<mark class=\"highlight\">nick</mark>_hg_wbrygl_count ..." },
        { "id": 475, "database_name": "db2admin", "procedure_name": "proc_nick_jrscb_zqtzmx", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE DB2ADMIN.PROC_<mark class=\"highlight\">NICK</mark>_JRSCB_ZQTZMX ..." },
        { "id": 478, "database_name": "db2admin", "procedure_name": "proc_nick_jrscb_decd_count", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE DB2ADMIN.PROC_<mark class=\"highlight\">NICK</mark>_JRSCB_DECD_COUNT ..." },
        { "id": 480, "database_name": "db2admin", "procedure_name": "proc_nick_sxspb_manage_change", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE db2admin.proc_<mark class=\"highlight\">nick</mark>_sxspb_manage_change ..." }
      ]
    },
    searchDeposit: {
      "count": 5,
      "results": [
        { "id": 1, "database_name": "bak", "procedure_name": "proc_get_deposit_2025", "highlighted_snippet": "...PROC_GET_<mark class=\"highlight\">DEPOSIT</mark>_2025..." },
        { "id": 185, "database_name": "db2admin", "procedure_name": "proc_get_gsywb_deposit", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE <mark class=\"highlight\">DB2ADMIN</mark>.PROC_GET_GSYWB_<mark class=\"highlight\">DEPOSIT</mark>..." },
        { "id": 2, "database_name": "db2admin", "procedure_name": "proc_get_deposit_2025", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE <mark class=\"highlight\">DB2ADMIN</mark>.PROC_GET_<mark class=\"highlight\">DEPOSIT</mark>_2025..." },
        { "id": 617, "database_name": "db2admin", "procedure_name": "proc_get_deposit", "highlighted_snippet": "CREATE OR REPLACE  PROCEDURE <mark class=\"highlight\">DB2ADMIN</mark>.PROC_GET_<mark class=\"highlight\">DEPOSIT</mark>..." },
        { "id": 3, "database_name": "temp", "procedure_name": "proc_get_deposit_2025", "highlighted_snippet": "CREATE OR REPLACE PROCEDURE TEMP.PROC_GET_<mark class=\"highlight\">DEPOSIT</mark>_2025..." }
      ]
    },
    save: {
      "flag": true,
      "procedure_id": 1355,
      "history_id": 1453,
      "version_number": 16,
      "info": "保存成功，DaaS已同步"
    },
    historyDetail: {
      "count": 16,
      "next": "http://localhost:8000/api/spmanager/procedures/history/?limit=10&offset=10&procedure_id=1355",
      "previous": null,
      "results": [
        { "id": 1454, "procedure_id": "1355", "version_number": 17, "modified_by_name": "陈飞", "modified_at": "2026-01-18T10:00:00.000000", "change_summary": "这是一条极长文字记载的测试数据。我们需要验证在版本历史记录的侧边栏中，如果变更说明的文字内容非常多，是否会撑破现有的 UI 布局。这段文字包含了很多业务逻辑的描述，例如：更新了资金清算的对账逻辑，修复了在跨行转账场景下可能出现的金额精度丢失问题，并且针对 2026 年春季的大促活动增加了动态限流插件的初始化配置。", "is_rollback": false },
        { "id": 1453, "procedure_id": "1355", "version_number": 16, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:36:44.286530", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1452, "procedure_id": "1355", "version_number": 15, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:35:24.808971", "change_summary": "回滚到版本 V1 (ID:1352)", "is_rollback": true },
        { "id": 1451, "procedure_id": "1355", "version_number": 14, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:35:16.981360", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1436, "procedure_id": "1355", "version_number": 13, "modified_by_name": "陈飞", "modified_at": "2026-01-13T09:10:58.782295", "change_summary": "回滚到版本 V1 (ID:1352)", "is_rollback": true },
        { "id": 1435, "procedure_id": "1355", "version_number": 12, "modified_by_name": "陈飞", "modified_at": "2026-01-13T08:36:57.486066", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1434, "procedure_id": "1355", "version_number": 11, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-13T08:24:38.137095", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1433, "procedure_id": "1355", "version_number": 10, "modified_by_name": "陈飞", "modified_at": "2026-01-13T08:23:51.810565", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1432, "procedure_id": "1355", "version_number": 9, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-13T08:18:00.997783", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1431, "procedure_id": "1355", "version_number": 8, "modified_by_name": "陈飞", "modified_at": "2026-01-13T08:16:57.371268", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1430, "procedure_id": "1355", "version_number": 7, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-13T08:12:22.844267", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false }
      ]
    },
    historyGlobal: {
      "count": 50,
      "next": "http://localhost:8000/api/spmanager/procedures/history/?limit=10&offset=10",
      "previous": null,
      "results": [
        { "id": 1453, "procedure_id": "1355", "procedure_name": "proc_test", "database_name": "temp", "version_number": 16, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:36:44.286530", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1452, "procedure_id": "1355", "procedure_name": "proc_test", "database_name": "temp", "version_number": 15, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:35:24", "change_summary": "回滚到版本 V1 (ID:1352)", "is_rollback": true },
        { "id": 1451, "procedure_id": "1355", "procedure_name": "proc_test", "database_name": "temp", "version_number": 14, "modified_by_name": "陈飞", "modified_at": "2026-01-17T14:35:16", "change_summary": "测试更新", "is_rollback": false },
        { "id": 1450, "procedure_id": "555", "procedure_name": "sp_e_kmh_competition_ln_zh", "database_name": "db2admin", "version_number": 2, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-16T10:00:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1449, "procedure_id": "554", "procedure_name": "sp_e_kmh_competition_ln_hs", "database_name": "db2admin", "version_number": 4, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-16T09:55:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1448, "procedure_id": "553", "procedure_name": "sp_e_kmh_competition_fin", "database_name": "db2admin", "version_number": 2, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-16T09:50:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1447, "procedure_id": "552", "procedure_name": "sp_e_kmh_2026", "database_name": "db2admin", "version_number": 1, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-15T14:00:00", "change_summary": "DaaS批量同步 - 首次捕获 V1", "is_rollback": false },
        { "id": 1446, "procedure_id": "551", "procedure_name": "sp_e_hundred_point_evaluation_month_nzkh", "database_name": "db2admin", "version_number": 2, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-15T13:30:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1445, "procedure_id": "550", "procedure_name": "sp_e_dpst_ln_temp", "database_name": "db2admin", "version_number": 2, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-15T12:00:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false },
        { "id": 1444, "procedure_id": "549", "procedure_name": "sp_e_bis_bonus_month_rg_2026", "database_name": "db2admin", "version_number": 2, "modified_by_name": "SYNC_SCRIPT", "modified_at": "2026-01-15T11:00:00", "change_summary": "DaaS批量同步 - 内容更新", "is_rollback": false }
      ]
    },
    diff: {
      "content_v1": "CREATE OR REPLACE PROCEDURE TEMP.PROC_TEST (\r\n\t IN P_DATE VARCHAR(10),\r\n    OUT V_OUT_FLAG VARCHAR(500) )\r\nBEGIN\r\n    DECLARE V_OUT_MSG               VARCHAR(100); -- SQLSTATE码\r\n    DECLARE V_ERRNO                 INT ; -- 返回错误码\r\n    DECLARE V_ERR_MSG               VARCHAR(2000);\r\n  \tDECLARE C_YMD\t\t\t\t\tVARCHAR(10); -- 返回错误信息 \r\n    DECLARE EXIT HANDLER FOR SQLEXCEPTION,SQLWARNING\r\n\r\nBEGIN\r\nGET DIAGNOSTICS CONDITION 1 SQLERRM = MESSAGE_TEXT;\r\nVALUES(SQLCODE, SQLSTATE, SQLERRM) INTO V_ERRNO, V_OUT_MSG, V_ERR_MSG;\r\nEND;\r\n\r\nSET C_YMD = P_DATE;\r\nCOMMIT;\r\nSET V_OUT_FLAG ='SUCCESS ' || C_YMD;\r\n\r\nRETURN;\r\nEND;",
      "content_v2": "CREATE OR REPLACE PROCEDURE TEMP.PROC_TEST (\r\n     IN P_DATE VARCHAR(10),\r\n    OUT V_OUT_FLAG VARCHAR(500) )\r\nBEGIN\r\n    DECLARE V_OUT_MSG               VARCHAR(100); -- SQLSTATE码\r\n    DECLARE V_ERRNO                 INT ; -- 返回错误码\r\n    DECLARE V_ERR_MSG               VARCHAR(2000);\r\n    DECLARE C_YMD                   VARCHAR(10); -- 返回错误信息 \r\n    DECLARE EXIT HANDLER FOR SQLEXCEPTION,SQLWARNING\r\n-- test增加备注 by chenfei at 2026-1-12 10:55:41\r\n-- 33333\r\nBEGIN\r\nGET DIAGNOSTICS CONDITION 1 SQLERRM = MESSAGE_TEXT;\r\nVALUES(SQLCODE, SQLSTATE, SQLERRM) INTO V_ERRNO, V_OUT_MSG, V_ERR_MSG;\r\nEND;\r\n\r\nSET C_YMD = P_DATE;\r\nCOMMIT;\r\nSET V_OUT_FLAG ='SUCCESS ' || C_YMD;\r\n\r\nRETURN;\r\nEND;",
      "v1_summary": "V13: 回滚到版本 V1 (ID:1352)",
      "v2_summary": "V4: DaaS批量同步 - 内容更新"
    },
    rollback: {
      "flag": true,
      "id": 1355,
      "history_id": 1454,
      "version_number": 17,
      "message": "回滚成功，新版本已生成"
    }
  }
};
