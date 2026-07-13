import { useState, useEffect, type FormEvent } from 'react';
import { X, Save, Calculator, User, Hash, AlertTriangle, Bug, FolderOpen, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '../../../lib/supabaseClient';
import type { Ticket } from './DevTicketTable';

// Bảng ánh xạ label UI ↔ mã DB
export const TICKET_TYPE_MAP: { label: string; dbCode: string; points: number }[] = [
  { label: 'Module lớn', dbCode: 'dev_module_lon', points: 8 },
  { label: 'Module nhỏ', dbCode: 'dev_module_nho', points: 5 },
  { label: 'Cải tiến',   dbCode: 'dev_cai_tien',   points: 3 },
  { label: 'Bug lớn',    dbCode: 'dev_bug_lon',     points: 2 },
  { label: 'Bug nhỏ',    dbCode: 'dev_bug_nho',     points: 1 },
];

interface DevTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  ticket: Ticket | null;
  projects: { id: string; name: string }[];
}

export const DevTicketModal = ({ isOpen, onClose, onSave, ticket, projects }: DevTicketModalProps) => {
  const [formData, setFormData] = useState({
    ma_ticket: '',
    name: '',
    type: 'Module nhỏ',
    dbLoai: 'dev_module_nho',
    point: 5,
    reopen: 0,
    isBugByDev: false,
    phu_trach: '',
    projectId: '',
  });

  const [usersList, setUsersList] = useState<{ user_id: string; full_name: string; role: string }[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Tải danh sách users khi Modal mở
  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        const { data, error } = await supabase
          .from('users')
          .select('user_id, full_name, role')
          .order('full_name', { ascending: true });
        if (error) throw error;
        setUsersList(data || []);
      } catch (err) {
        console.error('Error fetching users in DevTicketModal:', err);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, [isOpen]);

  // Thiết lập form khi mở modal (edit hoặc add new)
  useEffect(() => {
    if (!isOpen) return;
    if (ticket) {
      // Edit mode: map ticket (giao diện) về form
      const typeInfo = TICKET_TYPE_MAP.find(t => t.label === ticket.type) || TICKET_TYPE_MAP[1];
      setFormData({
        ma_ticket: ticket.ma_ticket || '',
        name: ticket.name || '',
        type: ticket.type || 'Module nhỏ',
        dbLoai: typeInfo.dbCode,
        point: ticket.point || 5,
        reopen: ticket.reopen || 0,
        isBugByDev: ticket.isBugByDev || false,
        phu_trach: ticket.phu_trach || '',
        projectId: ticket.projectId || '',
      });
    } else {
      // Add new mode
      setFormData({
        ma_ticket: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        type: 'Module nhỏ',
        dbLoai: 'dev_module_nho',
        point: 5,
        reopen: 0,
        isBugByDev: false,
        phu_trach: '',
        projectId: projects[0]?.id || '',
      });
    }
  }, [ticket, isOpen, projects]);

  const handleTypeChange = (label: string) => {
    const selected = TICKET_TYPE_MAP.find(t => t.label === label);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        type: selected.label,
        dbLoai: selected.dbCode,
        point: selected.points,
      }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
              <Calculator size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {ticket ? 'Cập nhật Task Dev' : 'Thêm Task Dev mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Row 1: Mã Task & Loại Task */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã Task</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash size={16} />
                </div>
                <input
                  type="text"
                  value={formData.ma_ticket}
                  disabled={!!ticket}
                  onChange={(e) => setFormData({ ...formData, ma_ticket: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loại Task *</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {TICKET_TYPE_MAP.map(t => (
                  <option key={t.dbCode} value={t.label}>{t.label} ({t.points}pt)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tên Task */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên Task / Tính năng *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Phát triển API Login, UI Dashboard..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Row 3: Dự án & Người thực hiện */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dự án *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FolderOpen size={16} />
                </div>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">Chọn dự án...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người thực hiện *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {fetchingUsers ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                </div>
                <select
                  required
                  value={formData.phu_trach}
                  onChange={(e) => setFormData({ ...formData, phu_trach: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">{fetchingUsers ? 'Đang tải...' : 'Chọn Dev...'}</option>
                  {usersList.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Quản lý' : 'Nhân viên'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Số lần Reopen */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số lần Reopen</label>
            <input
              type="number"
              min="0"
              value={formData.reopen}
              onChange={(e) => setFormData({ ...formData, reopen: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Toggle Bug do Dev */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isBugByDev: !formData.isBugByDev })}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
              formData.isBugByDev
                ? 'bg-red-50 border-red-100 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', formData.isBugByDev ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-200 text-slate-400')}>
                <Bug size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest">Lỗi chủ quan do Dev</span>
                <span className="text-[9px] font-bold opacity-60">Sẽ bị loại bỏ khỏi danh sách tính thu nhập</span>
              </div>
            </div>
            <div className={cn('w-10 h-5 rounded-full relative transition-all', formData.isBugByDev ? 'bg-red-500' : 'bg-slate-300')}>
              <div className={cn('absolute top-1 w-3 h-3 bg-white rounded-full transition-all', formData.isBugByDev ? 'right-1' : 'left-1')} />
            </div>
          </button>

          {/* Cảnh báo */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-start gap-3">
            <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-orange-700/80 leading-relaxed italic">
              Task có số lần Reopen {'>'} 1 hoặc bị đánh dấu là "Lỗi chủ quan" sẽ không được tính thu nhập.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save size={20} />
              Lưu Task Dev
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
