import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Headphones, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const CSTicketModal = ({ isOpen, onClose, onSave, ticket, projects, users = [] }) => {
  const [formData, setFormData] = useState({
    ticketId: '',
    name: '',
    projectId: '',
    type: 'cs_test',
    customerConfirmed: true,
    hasError: false,
    phuTrach: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        ticketId: ticket.ma_ticket || '',
        name: ticket.tieu_de || '',
        projectId: ticket.project_id || '',
        type: ticket.loai || 'cs_test',
        customerConfirmed: ticket.khach_xac_nhan ?? true,
        hasError: ticket.loi_sau_trien_khai ?? false,
        phuTrach: ticket.phu_trach || '',
      });
    } else {
      setFormData({
        ticketId: `TK-${Math.floor(800 + Math.random() * 200)}`,
        name: '',
        projectId: projects.filter(p => p.id !== 'all')[0]?.id || '',
        type: 'cs_test',
        customerConfirmed: true,
        hasError: false,
        phuTrach: '',
      });
    }
  }, [ticket, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
              <Headphones size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {ticket ? 'Cập nhật Ticket CS' : 'Tạo mới Ticket CS'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Ticket ID (readonly) */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã Ticket</label>
              <input
                type="text"
                disabled
                value={formData.ticketId}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
            {/* Project */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dự án *</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">— Chọn dự án —</option>
                {projects.filter(p => p.id !== 'all').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Task name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nội dung công việc CS *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Đào tạo vận hành module kho..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loại Ticket</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              >
                <option value="cs_test">Cấu hình / Test</option>
                <option value="cs_training">Đào tạo / HD</option>
                <option value="cs_deploy">Triển khai thực tế</option>
              </select>
            </div>

            {/* Assignee dropdown (real users) */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người thực hiện</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User size={14} />
                </div>
                <select
                  value={formData.phuTrach}
                  onChange={(e) => setFormData({ ...formData, phuTrach: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">— Chưa phân công —</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customerConfirmed: !formData.customerConfirmed })}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                formData.customerConfirmed
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Khách hàng xác nhận</span>
              </div>
              <div className={cn(
                'w-8 h-4 rounded-full relative transition-all',
                formData.customerConfirmed ? 'bg-emerald-500' : 'bg-slate-300'
              )}>
                <div className={cn(
                  'absolute top-1 w-2 h-2 bg-white rounded-full transition-all',
                  formData.customerConfirmed ? 'right-1' : 'left-1'
                )} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasError: !formData.hasError })}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
                formData.hasError
                  ? 'bg-red-50 border-red-100 text-red-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ghi nhận lỗi</span>
              </div>
              <div className={cn(
                'w-8 h-4 rounded-full relative transition-all',
                formData.hasError ? 'bg-red-500' : 'bg-slate-300'
              )}>
                <div className={cn(
                  'absolute top-1 w-2 h-2 bg-white rounded-full transition-all',
                  formData.hasError ? 'right-1' : 'left-1'
                )} />
              </div>
            </button>
          </div>

          {/* Info note */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-blue-700/80 leading-relaxed italic">
              Ticket chỉ được tính thu nhập khi đã có xác nhận của khách hàng và không ghi nhận lỗi trong quá trình triển khai.
            </p>
          </div>

          {/* Footer Actions */}
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
              className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save size={20} />
              Lưu Ticket CS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
