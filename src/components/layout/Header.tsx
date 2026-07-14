import React from 'react';
import { Search, Bell, User, ChevronRight, Menu } from 'lucide-react';
import type { FlowUser } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
  activeTab: string;
  currentUser?: FlowUser | null;
}

const roleLabel = (user?: FlowUser | null) => {
  if (!user) return '';
  return user.accessRole === 'admin' ? 'Admin' : (user.role || 'Nhân viên');
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick, activeTab, currentUser }) => {
  return (
    <header className="sticky top-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-slate-900 font-bold text-lg hidden sm:block border-r border-slate-200 pr-4 mr-2">
          F-Solution Income System
        </h1>
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>Home</span>
          <ChevronRight size={14} />
          <span className="text-blue-600">{activeTab}</span>
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 sm:mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Projects / Tasks..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 text-sm rounded-lg"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{currentUser?.fullName || 'Chưa chọn tài khoản'}</p>
            <p className="text-xs text-slate-500 font-medium">{roleLabel(currentUser)}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 flex items-center justify-center text-white font-bold text-lg rounded-lg overflow-hidden shadow-sm">
            {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={20} />}
          </div>
        </div>
      </div>
    </header>
  );
};
