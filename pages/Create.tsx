
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, FileCode, RotateCcw, User as UserIcon, Database, Terminal } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import { api } from '../services/api';
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

const Create: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [code, setCode] = useState(DEFAULT_TEMPLATE);
  const [owner, setOwner] = useState(CURRENT_USER.username);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parsed metadata
  const [parsedName, setParsedName] = useState<string>('');
  const [parsedDb, setParsedDb] = useState<string>('');

  // Regex to extract schema and name: CREATE ... PROCEDURE [schema].[name]
  useEffect(() => {
    // Simple regex for demonstration. Handles:
    // CREATE [OR REPLACE] PROCEDURE [schema.]name
    const regex = /CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(?:(\w+)\.)?(\w+)/i;
    const match = code.match(regex);
    
    if (match) {
        setParsedDb(match[1] || 'db2admin'); // Default if no schema provided
        setParsedName(match[2]);
    } else {
        setParsedDb('');
        setParsedName('');
    }
  }, [code]);

  const handleSubmit = async () => {
    if (!parsedName) {
      setError("无法从代码中识别存储过程名称，请检查语法 (CREATE PROCEDURE schema.name)");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.createProcedure({
          name: parsedName,
          db: parsedDb || 'db2admin',
          owner: owner,
          content: code
      });
      
      if (response.flag) {
        // Redirect to editor with the new ID
        navigate(`/editor/${response.id}`);
      } else {
        setError(response.message || "创建失败");
      }
    } catch (err: any) {
      setError(err.message || "系统错误");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Go back to the previous page (My Procedures, or Home, etc.) instead of forcing Home
    navigate(-1);
  };

  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    automaticLayout: true,
    scrollBeyondLastLine: false,
  }), []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header / Toolbar */}
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                新建存储过程
            </h1>
            
            {/* Dynamic Parsed Info Chips */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-300">
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${parsedName ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="font-medium">{parsedName || '未识别名称'}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${parsedDb ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    <Database className="w-3.5 h-3.5" />
                    <span className="font-medium">{parsedDb || '默认库'}</span>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Owner Input */}
             <div className="flex items-center gap-2 mr-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="负责人"
                    title="负责人 (Owner)"
                />
             </div>

             <button 
               onClick={handleCancel}
               className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
             >
               取消
             </button>
             <button 
               onClick={handleSubmit}
               disabled={loading || !parsedName}
               className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium shadow-sm transition-all text-sm ${
                 loading || !parsedName ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
               }`}
               title={!parsedName ? "请在代码中定义过程名称 (CREATE PROCEDURE ...)" : "保存并创建"}
             >
               {loading ? <RotateCcw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
               创建
             </button>
          </div>
      </div>
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 px-5 py-2 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 relative">
         <Editor
            height="100%"
            defaultLanguage="sql"
            value={code}
            theme="light"
            onChange={(val) => setCode(val || '')}
            options={editorOptions}
        />
      </div>
    </div>
  );
};

export default Create;
