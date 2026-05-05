import { useState } from 'react';
import { DemoTable } from './components/DemoTable';
import { ContractTable } from './components/ContractTable';
import { DemoModal } from './components/DemoModal';
import { Plus, LayoutGrid, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock data: 4 demo (3 hợp lệ, 1 thiếu biên bản)
const INITIAL_DEMOS = [
  {
    id: 1,
    opportunityName: 'Hệ thống ERP cho ABC Corp',
    customer: 'Công ty ABC',
    demoDate: '15/04/2026',
    minutesLink: 'https://docs.google.com/document/d/demo1',
    activityLog: 'Meeting scheduled via HubSpot',
    missingActivity: false,
    missingMinutes: false,
    isValid: true,
  },
  {
    id: 2,
    opportunityName: 'Phần mềm CRM cho XYZ Ltd',
    customer: 'XYZ Ltd',
    demoDate: '18/04/2026',
    minutesLink: 'https://docs.google.com/document/d/demo2',
    activityLog: 'Demo call logged in CRM',
    missingActivity: false,
    missingMinutes: false,
    isValid: true,
  },
  {
    id: 3,
    opportunityName: 'App quản lý kho cho MNO Inc',
    customer: 'MNO Inc',
    demoDate: '20/04/2026',
    minutesLink: null,
    activityLog: 'Demo completed',
    missingActivity: false,
    missingMinutes: true,
    isValid: false,
  },
  {
    id: 4,
    opportunityName: 'Platform e-commerce cho PQR',
    customer: 'PQR Group',
    demoDate: '22/04/2026',
    minutesLink: 'https://docs.google.com/document/d/demo4',
    activityLog: 'Demo + follow-up logged',
    missingActivity: false,
    missingMinutes: false,
    isValid: true,
  },
];

// Mock data: 4 hợp đồng (2 đã thu đủ, 1 chưa thu, 1 thiếu chứng từ)
const INITIAL_CONTRACTS = [
  {
    id: 1,
    code: 'HD-2026-001',
    customer: 'Công ty ABC',
    contractAmount: 500000000,
    fund: 50000000,
    paidAmount: 15500000,
    document: 'https://docs.google.com/document/d/ct1',
    status: 'paid',
  },
  {
    id: 2,
    code: 'HD-2026-002',
    customer: 'XYZ Ltd',
    contractAmount: 300000000,
    fund: 30000000,
    paidAmount: 9300000,
    document: 'https://docs.google.com/document/d/ct2',
    status: 'paid',
  },
  {
    id: 3,
    code: 'HD-2026-003',
    customer: 'PQR Group',
    contractAmount: 200000000,
    fund: 20000000,
    paidAmount: 0,
    document: 'https://docs.google.com/document/d/ct3',
    status: 'signed',
  },
  {
    id: 4,
    code: 'HD-2026-004',
    customer: 'MNO Inc',
    contractAmount: 150000000,
    fund: 15000000,
    paidAmount: 4650000,
    document: null,
    status: 'missing_docs',
  },
];

const SUB_TABS = [
  { id: 'demo', label: 'Demo', icon: LayoutGrid },
  { id: 'contract', label: 'Hợp đồng & Doanh số', icon: FileText },
];

export default function SalePage() {
  const [activeSubTab, setActiveSubTab] = useState('demo');
  const [demos, setDemos] = useState(INITIAL_DEMOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);

  const handleSaveDemo = (formData) => {
    if (editingDemo) {
      setDemos(demos.map(d => d.id === editingDemo.id ? { ...d, ...formData } : d));
    } else {
      const newDemo = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setDemos([newDemo, ...demos]);
    }
    setIsModalOpen(false);
    setEditingDemo(null);
  };

  const handleDeleteDemo = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Demo này không?')) {
      setDemos(demos.filter(d => d.id !== id));
    }
  };

  const handleEditDemo = (demo) => {
    setEditingDemo(demo);
    setIsModalOpen(true);
  };

  const handleAddDemo = () => {
    setEditingDemo(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shadow-slate-900/20">
              <TrendingUp size={32} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Demo & Hợp đồng</h2>
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Sale Performance Hub</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {SUB_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                    activeSubTab === tab.id
                      ? 'bg-white text-blue-700 shadow-xl shadow-slate-200/50 translate-y-0'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeSubTab === 'demo' && (
            <button 
              onClick={handleAddDemo}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Plus size={20} />
              <span>Thêm Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
        {activeSubTab === 'demo' ? (
          <DemoTable 
            demos={demos} 
            onEdit={handleEditDemo}
            onDelete={handleDeleteDemo}
          />
        ) : (
          <ContractTable contracts={INITIAL_CONTRACTS} />
        )}
      </div>

      <DemoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDemo}
        demo={editingDemo}
      />
    </div>
  );
}
