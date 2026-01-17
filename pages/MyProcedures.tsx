
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Clock, Plus, FolderOpen, ArrowRight, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { ProcedureListItem } from '../types';
import { CURRENT_USER } from '../constants';

const MyProcedures: React.FC = () => {
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState<ProcedureListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9; // Grid layout 3x3 works well

  useEffect(() => {
    const fetchMyProcedures = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * pageSize;
        // Pass current user's username to filter
        const data = await api.getProcedures(pageSize, offset, CURRENT_USER.username);
        setProcedures(data.results || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        console.error("Failed to load my procedures", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProcedures();
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading && page === 1 && procedures.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500">正在加载您的资产...</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-blue-600" />
            我的存储过程
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-gray-500 text-sm">管理您负责或创建的数据库程序资产</p>
             <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">{totalCount} 个项目</span>
          </div>
        </div>
        <button 
           onClick={() => navigate('/new')}
           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
           <Plus className="w-4 h-4" />
           新建过程
        </button>
      </div>

      <div className="flex-1">
          {procedures.length === 0 && !loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无数据</h3>
                <p className="text-gray-500 mb-6">您还没有创建任何存储过程。</p>
                <button 
                   onClick={() => navigate('/new')}
                   className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-medium transition-colors"
                >
                   立即创建
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Only show "Create Shortcut" on the first page */}
                {page === 1 && (
                    <div 
                       onClick={() => navigate('/new')}
                       className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group min-h-[160px]"
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-gray-700 group-hover:text-blue-600">新建存储过程</h3>
                    </div>
                )}

                {procedures.map((item) => (
                    <div 
                       key={item.id}
                       onClick={() => navigate(`/editor/${item.id}`)}
                       className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-3">
                             <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                 <span className="bg-blue-50 text-blue-700 text-xs font-mono px-2 py-0.5 rounded border border-blue-100">
                                    {item.database_name}
                                 </span>
                                 {!item.is_active && (
                                     <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">已归档</span>
                                 )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 truncate pr-6" title={item.procedure_name}>
                                {item.procedure_name}
                            </h3>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                            {item.description || "暂无描述信息..."}
                        </p>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                                 <User className="w-3.5 h-3.5" />
                                 {item.owner}
                            </div>
                            <div className="flex items-center gap-1.5">
                                 <Clock className="w-3.5 h-3.5" />
                                 {new Date(item.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 shrink-0 py-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className={`p-2 rounded-lg border ${
              page === 1 || loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-300 border-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-gray-600">
             第 <span className="text-blue-600 font-bold">{page}</span> 页，共 {totalPages} 页
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className={`p-2 rounded-lg border ${
              page === totalPages || loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-300 border-gray-300'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProcedures;
