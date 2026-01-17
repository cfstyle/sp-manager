
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Search from './pages/Search';
import Editor from './pages/Editor';
import Diff from './pages/Diff';
import Activity from './pages/Activity';
import Dashboard from './pages/Dashboard';
import MyProcedures from './pages/MyProcedures';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Search />} />
          <Route path="my-procedures" element={<MyProcedures />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new" element={<Editor />} />
          <Route path="editor/:id" element={<Editor />} />
          <Route path="diff/:id/:v1/:v2" element={<Diff />} />
          <Route path="activity" element={<Activity />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
