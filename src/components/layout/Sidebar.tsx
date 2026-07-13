import React from 'react';
import { 
  LayoutDashboard,
  Users,
  Megaphone, 
  Briefcase, 
  FileSearch, 
  FileText,
  Code2, 
  ClipboardList,
  Headphones, 
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout,
  isOpen = true, 
  onClose 
}) => {
  const menuItems: MenuItem[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Customers', label: 'Khách hàng', icon: Users },
    { id: 'Marketing', label: 'Marketing', icon: Megaphone, badge: 2 },
    { id: 'Sale', label: 'Sale', icon: Briefcase },
    { id: 'BaoGia', label: 'Báo giá', icon: FileText },
    { id: 'BA/SA', label: 'BA/SA', icon: FileSearch },
    { id: 'Task', label: 'Task', icon: ClipboardList },
    { id: 'Dev', label: 'Dev', icon: Code2 },
    { id: 'CS', label: 'CS', icon: Headphones },
    { id: 'Settings', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">F-Solution Income</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20" 
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={cn(
                        "transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                      )} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <span className={cn(
                        "flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                        isActive ? "bg-white text-blue-900" : "bg-red-500 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-tight">Nguyễn Văn A</p>
                <p className="text-[11px] text-slate-500 font-medium">Admin</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Đăng xuất hệ thống"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
