
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, RotateCw } from 'lucide-react';
import { DiffEditor, loader } from '@monaco-editor/react';
import { api } from '../services/api';
import { DiffResponse } from '../types';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

const Diff: React.FC = () => {
  const { id, v1, v2 } = useParams<{ id: string; v1: string; v2: string }>();
  const navigate = useNavigate();
  const [diffData, setDiffData] = useState<DiffResponse | null>(null);

  useEffect(() => {
    if (v1 && v2) {
      api.getDiff(v1, v2).then(setDiffData).catch(err => console.error("对比加载失败", err));
    }
  }, [v1, v2]);

  const handleRollback = async () => {
    if (!id || !v2) return;
    if (confirm(`确定要回滚到历史版本 (ID:${v2}) 吗？`)) {
        try {
          const res = await api.rollbackProcedure(parseInt(id), parseInt(v2));
          if (res.flag) {
            alert(res.message);
            navigate(`/editor/${id}`);
          }
        } catch (err) {
          alert("回滚失败");
        }
    }
  };

  if (!diffData) return <div className="p-10 text-center">加载对比中...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              版本对比
              <div className="flex items-center gap-1 text-xs font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-500 italic">
                {diffData.v2_summary} <span className="mx-1">→</span> <span className="text-blue-600">{diffData.v1_summary}</span>
              </div>
            </h1>
          </div>
        </div>
        <button onClick={handleRollback} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> 回滚至该历史版本
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-mono">
            <div className="p-2 pl-14 border-r border-gray-200">历史选定版本 (ID: {v2})</div>
            <div className="p-2 pl-14">当前对比版本 (ID: {v1})</div>
        </div>
        <div className="flex-1 relative">
            <DiffEditor
                height="100%"
                language="sql"
                original={diffData.content_v2}
                modified={diffData.content_v1}
                theme="light"
                options={{ originalEditable: false, readOnly: true, fontSize: 13, automaticLayout: true, minimap: { enabled: false } }}
            />
        </div>
      </div>
    </div>
  );
};

export default Diff;
