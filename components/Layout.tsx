
import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database, Search, LayoutDashboard, Activity, LogOut, User as UserIcon, Plus, FolderGit2 } from 'lucide-react';
import { CURRENT_USER } from '../constants';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleNew = () => {
    navigate('/new');
  };

  // Determine if the current page requires full width (Editor and Diff views)
  const isFullWidthPage = location.pathname.startsWith('/editor') || location.pathname.startsWith('/diff') || location.pathname.startsWith('/new');

  // Increased text-sm to text-base for better readability in navigation
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-md transition-colors text-base font-medium ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-18">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">存储过程管理平台</span>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navClass} end>
              <Search className="w-5 h-5" />
              <span>检索</span>
            </NavLink>
            <NavLink to="/my-procedures" className={navClass}>
              <FolderGit2 className="w-5 h-5" />
              <span>我的代码</span>
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span>统计看板</span>
            </NavLink>
            <NavLink to="/activity" className={navClass}>
              <Activity className="w-5 h-5" />
              <span>近期活动</span>
            </NavLink>
          </nav>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-4">
             <button 
                onClick={handleNew}
                className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
             >
                <Plus className="w-4 h-4" />
                新建
             </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                {/* Increased font sizes */}
                <p className="text-base font-semibold text-gray-800 leading-none">{CURRENT_USER.name}</p>
                <p className="text-sm text-gray-500 mt-1">管理员</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <img src={CURRENT_USER.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 py-8 ${isFullWidthPage ? 'w-full px-4' : 'container mx-auto px-6'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
