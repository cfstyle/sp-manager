
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Database, ArrowRight, Clock } from 'lucide-react';
import { api } from '../services/api';
import { SearchResultItem, ProcedureListItem } from '../types';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [recentProcedures, setRecentProcedures] = useState<ProcedureListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 初始化加载列表
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const data = await api.getProcedures(10);
        setRecentProcedures(data.results || []);
      } catch (err) {
        console.error("加载数据失败", err);
      }
    };
    loadInitial();
  }, []);

  // 搜索逻辑
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchProcedures(query);
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("搜索失败", err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">存储过程检索</h1>
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className={`h-6 w-6 transition-colors ${loading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-4 py-5 bg-white border border-gray-200 rounded-full shadow-sm text-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            placeholder="输入名称、定义或逻辑关键词进行搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-5">
        {query ? (
          searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/editor/${item.id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      {item.procedure_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.database_name}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-all" />
                </div>
                
                {/* 渲染后端返回的高亮 HTML 片段 */}
                <div 
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm font-mono text-gray-600 overflow-hidden line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.highlighted_snippet }}
                />
              </div>
            ))
          ) : !loading && (
            <div className="text-center py-16 text-gray-500 text-lg">未找到匹配的存储过程</div>
          )
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">最近更新的存储过程</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProcedures.map(sp => (
                <div 
                  key={sp.id}
                  onClick={() => navigate(`/editor/${sp.id}`)}
                  className="bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-300 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{sp.procedure_name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(sp.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400">{sp.database_name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
