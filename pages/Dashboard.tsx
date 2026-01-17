import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MOCK_STATS } from '../constants';
import { Database, TrendingUp, Users, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const data = [
    { name: '周一', new: 2, updates: 4 },
    { name: '周二', new: 1, updates: 8 },
    { name: '周三', new: 3, updates: 5 },
    { name: '周四', new: 0, updates: 12 },
    { name: '周五', new: 4, updates: 6 },
    { name: '周六', new: 1, updates: 2 },
    { name: '周日', new: 0, updates: 1 },
  ];

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        {/* Increased font sizes */}
        <p className="text-gray-500 text-base font-medium mb-1.5">{title}</p>
        <h3 className="text-4xl font-bold text-gray-800">{value}</h3>
        <p className={`text-sm mt-2 font-medium ${sub.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{sub}</p>
      </div>
      <div className={`p-3.5 rounded-xl ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">系统概览</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="存储过程总数" 
          value={MOCK_STATS.total} 
          sub="+12 本月" 
          icon={Database} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="活跃开发者" 
          value={MOCK_STATS.activeDevelopers} 
          sub="当前在线: 3" 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="近30天变更" 
          value={MOCK_STATS.changedThisMonth} 
          sub="+15% 环比上月" 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
        <StatCard 
          title="发布失败" 
          value="2" 
          sub="需要关注" 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6">活动趋势 (本周)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1"/>
                {/* Increased tick font size */}
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 14}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 14}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '14px'}}
                />
                <Area type="monotone" dataKey="updates" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUpdates)" name="变更量" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white p-7 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">变更类型分布</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1"/>
                         <XAxis dataKey="name" hide />
                         <Tooltip contentStyle={{fontSize: '14px'}} />
                         <Legend wrapperStyle={{fontSize: '14px', paddingTop: '10px'}} />
                         <Bar dataKey="new" stackId="a" fill="#10b981" name="新增" radius={[0, 0, 4, 4]} />
                         <Bar dataKey="updates" stackId="a" fill="#3b82f6" name="修改" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;