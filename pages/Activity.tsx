
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HistoryItem } from '../types';
import { CURRENT_USER } from '../constants';
import { Edit3, RotateCcw, ArrowRight, Split, Clock, User as UserIcon, Database, ExternalLink } from 'lucide-react';

const Activity: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        // Use getHistory without procedure_id to get global activity
        const data = await api.getHistory({ limit: 30 });
        setActivities(data.results || []);
      } catch (err) {
        console.error("加载活动失败", err);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  const handleDiffClick = (log: HistoryItem) => {
    if (!log.procedure_id) return;
    // For mock purposes, assume previous ID is id - 1. 
    // In real scenario, we'd need the specific previous history ID.
    const prevId = log.id - 1; 
    navigate(`/diff/${log.procedure_id}/${log.id}/${prevId}`);
  };

  const filteredActivities = activities.filter(log => {
    if (filter === 'mine') {
      return log.modified_by_name === CURRENT_USER.name;
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          近期活动记录
          <span className="hidden sm:inline-block text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">系统全库日志</span>
        </h1>
        
        <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'mine' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            我的
          </button>
        </div>
      </div>

      <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 pb-10">
        {filteredActivities.map((log) => (
          <div key={log.id} className="relative pl-8 group">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${log.is_rollback ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                    {log.is_rollback ? <RotateCcw className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {log.procedure_name}
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border">{log.database_name}</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-gray-700"><UserIcon className="w-3 h-3" /> {log.modified_by_name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.modified_at).toLocaleString()}</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">V{log.version_number}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/editor/${log.procedure_id}`)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="查看源码"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              
              <div 
                onClick={() => handleDiffClick(log)}
                className={`text-sm p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  log.is_rollback 
                    ? 'bg-orange-50/50 border-orange-100 text-orange-800 hover:bg-orange-100' 
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200'
                }`}
                title="点击查看变更详情"
              >
                <div className="flex items-center justify-between">
                    <span>{log.change_summary}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="pl-8 py-4 text-gray-400">正在同步云端日志...</div>}
        {!loading && activities.length === 0 && <div className="pl-8 py-4 text-gray-400">暂无活动记录</div>}
        {!loading && activities.length > 0 && filteredActivities.length === 0 && (
           <div className="pl-8 py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
             没有找到与您相关的活动记录
           </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
