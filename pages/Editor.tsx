
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, GitBranch, Clock, AlertCircle, CheckCircle2, RotateCcw, Split, User as UserIcon, ArrowLeft, Copy, Check, X, FileCode, Terminal, Database } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import { api } from '../services/api';
import { ProcedureDetail, HistoryItem } from '../types';
import { CURRENT_USER } from '../constants';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

const DEFAULT_TEMPLATE = `-- 请输入存储过程定义
-- 系统将自动识别名称和数据库
CREATE OR REPLACE PROCEDURE db2admin.new_procedure
(
    -- Add parameters here
    -- IN p_id INT
)
LANGUAGE SQL
BEGIN
    -- Business logic here
END;`;

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreating = !id;

  // --- Shared State ---
  const [code, setCode] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(!isCreating); // Creating starts loaded (template)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Dynamic Parsing State (Used for BOTH Create and Edit) ---
  const [parsedName, setParsedName] = useState('');
  const [parsedDb, setParsedDb] = useState('');

  // --- Edit Mode Specific State ---
  const [detail, setDetail] = useState<ProcedureDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewingVersion, setViewingVersion] = useState<HistoryItem | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1. Initial Load (Effect)
  useEffect(() => {
    if (isCreating) {
      // Create Mode Initialization
      setCode(DEFAULT_TEMPLATE);
      setLoading(false);
      setDetail(null);
      setHistory([]);
    } else {
      // Edit Mode Initialization
      const loadData = async () => {
        setError(null);
        setLoading(true);
        try {
          const detailData = await api.getProcedureDetail(id!);
          setDetail(detailData);
          setCode(detailData.latest_content || '');
          
          const historyData = await api.getHistory({ procedure_id: id });
          setHistory(historyData.results || []);
        } catch (err: any) {
          console.error("加载失败", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, isCreating]);

  // 2. Parse Code Metadata (Effect - Always Run)
  // This ensures the header title is always in sync with the code content
  useEffect(() => {
    // Simple regex: CREATE [OR REPLACE] PROCEDURE [schema.]name
    const regex = /CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(?:(\w+)\.)?(\w+)/i;
    const match = code.match(regex);
    
    if (match) {
        setParsedDb(match[1] || 'db2admin'); // Default if no schema
        setParsedName(match[2]);
    } else {
        // If parsing fails (e.g. empty code), fallback to detail if available, or empty
        if (!isCreating && detail) {
             // Optional: Decide if we want to fallback to DB record or show empty
             // Here we keep it responsive to code. If code is invalid, chips show empty/invalid.
             setParsedDb('');
             setParsedName('');
        } else {
            setParsedDb('');
            setParsedName('');
        }
    }
  }, [code, isCreating, detail]);

  // 3. Actions
  const handleSaveClick = () => {
    if (isCreating) {
      handleCreate();
    } else {
      if (!detail || !code.trim()) return;
      setSaveError(null);
      setShowSaveModal(true);
    }
  };

  const handleCreate = async () => {
    if (!parsedName) {
      setNotification({ type: 'error', msg: "无法识别存储过程名称，请检查代码" });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.createProcedure({
          name: parsedName,
          db: parsedDb || 'db2admin',
          owner: CURRENT_USER.username, // Fixed to current user
          content: code
      });
      if (response.flag) {
        // Replace history so we don't go back to /new
        navigate(`/editor/${response.id}`, { replace: true });
        setNotification({ type: 'success', msg: "创建成功" });
      } else {
        setError(response.message || "创建失败");
      }
    } catch (err: any) {
      setError(err.message || "系统错误");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUpdate = async () => {
    if (!detail) return;
    let changeSummary = summary.trim();
    if (!changeSummary) return;

    // --- Special Logic: Detect Rename/Move ---
    // If the parsed name/db in code differs from the original DB record
    if (parsedName && (parsedName !== detail.procedure_name || (parsedDb && parsedDb !== detail.database_name))) {
       const oldIdentity = `${detail.database_name}.${detail.procedure_name}`;
       const newIdentity = `${parsedDb || 'db2admin'}.${parsedName}`;
       changeSummary += `\n[系统自动追加] 标识符变更: 从 ${oldIdentity} 变更为 ${newIdentity}`;
    }

    setSubmitting(true);
    setSaveError(null);
    
    try {
      // Note: In a real app, you might also want to send the new name/db to an update endpoint
      // Here we assume saving content updates the DB definition implicitly via the SQL execution
      const result = await api.saveProcedure(detail.id, code, changeSummary);
      if (result.flag) {
        setNotification({ type: 'success', msg: result.info });
        setIsDirty(false);
        setSummary('');
        setSaveError(null);
        setShowSaveModal(false);
        
        // Refresh History & Detail to sync the new name if changed
        const historyData = await api.getHistory({ procedure_id: detail.id });
        setHistory(historyData.results || []);
        
        // Optimistically update local detail state if name changed
        if (parsedName) {
            setDetail(prev => prev ? ({ ...prev, procedure_name: parsedName, database_name: parsedDb || prev.database_name }) : null);
        }
        
        setTimeout(() => setNotification(null), 5000);
      } else {
        setSaveError(result.info || '保存失败');
      }
    } catch (err: any) {
      setSaveError(err.message || '系统错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompare = (h1_id: number, h2_id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) navigate(`/diff/${id}/${h1_id}/${h2_id}`);
  };

  const handleViewVersion = (item: HistoryItem) => {
    setViewingVersion(item);
    setCode(item.content || '-- No content available --');
    setIsDirty(false);
  };

  const handleBackToLatest = () => {
    if (detail) {
      setViewingVersion(null);
      setCode(detail.latest_content);
      setIsDirty(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setNotification({ type: 'error', msg: '复制失败' });
    }
  };

  const handleCancelCreate = () => {
    navigate(-1);
  };

  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    automaticLayout: true,
    readOnly: !!viewingVersion,
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true
  }), [viewingVersion]);

  // Loading / Error States
  if (error && !isCreating) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">返回列表</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
         <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 text-sm">正在加载代码...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Banner for Viewing History (Edit Mode Only) */}
        {viewingVersion && !isCreating && (
          <div className="bg-amber-50 px-5 py-2 border-b border-amber-200 text-amber-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>正在查看历史版本 <strong>V{viewingVersion.version_number}</strong> - 只读模式</span>
            </div>
            <button 
              onClick={handleBackToLatest}
              className="px-3 py-1 bg-white border border-amber-300 rounded text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> 返回最新版本
            </button>
          </div>
        )}

        {/* Toolbar Header */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-4 overflow-hidden">
             {/* Unified Title Area: Always uses parsed data from code */}
              <div className="flex items-center gap-2 shrink-0">
                  <FileCode className={`w-5 h-5 ${isCreating ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`text-lg font-bold ${isCreating ? 'text-gray-800' : 'text-gray-700'}`}>
                    {isCreating ? '新建过程' : '编辑过程'}
                  </span>
              </div>
              
              {/* Dynamic Chips - Showing parsed DB and Name */}
              <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-300 overflow-x-auto">
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${parsedName ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="font-medium">{parsedName || '未识别名称'}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${parsedDb ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    <Database className="w-3.5 h-3.5" />
                    <span className="font-medium">{parsedDb || '默认库'}</span>
                </div>
                {/* Dirty state indicator */}
                {!isCreating && isDirty && !viewingVersion && (
                     <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse shrink-0">
                        未保存修改
                     </span>
                )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             {/* Notification Toast */}
             {notification && (
                <div className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-300 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                  <span className="hidden sm:inline">{notification.msg}</span>
                </div>
             )}

             {/* Creator Badge (Read-Only) */}
             <div className="flex items-center gap-2 mr-2 hidden sm:flex bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-gray-500 text-xs cursor-default" title="创建人 (不可修改)">
                <UserIcon className="w-3 h-3" />
                <span className="font-medium">
                    {isCreating ? CURRENT_USER.name : (detail?.creator || 'Unknown')}
                </span>
             </div>

             {/* Cancel Button (Create Mode Only) */}
             {isCreating && (
                <button 
                    onClick={handleCancelCreate}
                    className="px-3 py-1.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                    取消
                </button>
             )}

             {/* Action Button: Create or Save */}
             {!viewingVersion && (
                <button 
                  onClick={handleSaveClick}
                  disabled={(isCreating && !parsedName) || (!isCreating && !isDirty) || submitting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    (isCreating && parsedName) || (!isCreating && isDirty) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title={isCreating && !parsedName ? "请在代码中定义过程名称" : ""}
                >
                  {submitting ? <RotateCcw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                  {isCreating ? '创建' : '保存'}
                </button>
             )}
          </div>
        </div>
        
        {/* Error Banner for Create Mode */}
        {error && isCreating && (
            <div className="bg-red-50 px-5 py-2 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <div className="flex-1 relative group">
           <button
             onClick={handleCopy}
             className="absolute top-4 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md shadow-sm hover:bg-white text-xs font-medium text-gray-600 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
             title="复制全部代码"
           >
             {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
             {copied ? '已复制' : '复制'}
           </button>
           
           <Editor
             key={viewingVersion ? 'read-only' : 'editable'} 
             height="100%"
             defaultLanguage="sql"
             value={code}
             theme="light"
             onChange={(val) => { 
                if (!viewingVersion) {
                  setCode(val || ''); 
                  if (!isCreating) setIsDirty(true); 
                }
             }}
             options={editorOptions}
           />
        </div>
      </div>

      {/* Sidebar - History (Only for Edit Mode) */}
      {!isCreating && (
        <div className="w-full md:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 shrink-0 h-16 flex items-center">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-base"><GitBranch className="w-5 h-5" />历史记录</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {history.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">暂无历史记录</div>
            ) : (
                history.map((ver, idx) => {
                  const isLatest = idx === 0;
                  const isViewing = viewingVersion ? viewingVersion.id === ver.id : isLatest;
                  
                  return (
                    <div 
                      key={ver.id} 
                      onClick={() => isLatest ? handleBackToLatest() : handleViewVersion(ver)}
                      className={`p-4 rounded-lg border relative cursor-pointer transition-all ${
                        isViewing 
                          ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200' 
                          : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${isViewing ? 'text-blue-700' : 'text-gray-700'}`}>V{ver.version_number}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(ver.modified_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 italic line-clamp-2">"{ver.change_summary}"</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{ver.modified_by_name}</span>
                        {!isLatest && history.length > 0 && (
                          <button 
                            onClick={(e) => handleCompare(history[0].id, ver.id, e)}
                            className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            <Split className="w-3 h-3" />对比
                          </button>
                        )}
                        {isLatest && <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">Latest</span>}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Save Confirmation Modal (Only for Edit Mode) */}
      {showSaveModal && !isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-semibold text-gray-800">保存变更</h3>
                 <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">变更说明 (Change Summary)</label>
                 <textarea 
                    autoFocus
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={4}
                    placeholder="请输入修改内容的简要说明 (必填)..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                 />
                 
                 {/* Auto-detected changes notice */}
                 {detail && parsedName && (parsedName !== detail.procedure_name || (parsedDb && parsedDb !== detail.database_name)) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <strong>检测到定义变更：</strong> 系统将自动在提交说明后追加：
                            <br/>
                            "标识符变更: 从 {detail.database_name}.{detail.procedure_name} 变更为 {parsedDb || 'db2admin'}.{parsedName}"
                        </div>
                    </div>
                 )}
                 
                 {saveError ? (
                   <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>保存失败</span>
                      </div>
                      {saveError}
                   </div>
                 ) : (
                   <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-2 rounded text-center">
                      提示：保存后将生成新的历史版本 V{(detail?.latest_history_id ? Math.floor(detail.latest_history_id/1000) : 0) + 1}.x
                   </div>
                 )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                 <button 
                   onClick={() => setShowSaveModal(false)}
                   className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={confirmUpdate}
                   disabled={submitting || !summary.trim()}
                   className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
                      submitting || !summary.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                   }`}
                 >
                   {submitting && <RotateCcw className="w-4 h-4 animate-spin"/>}
                   确认保存
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
