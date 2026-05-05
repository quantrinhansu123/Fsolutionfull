import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Headphones, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const CSTicketModal = ({ isOpen, onClose, onSave, ticket, projects }) => {
  const [formData, setFormData] = useState({
    ticketId: '',
    name: '',
    projectId: '',
    type: 'test',
    customerConfirmed: true,
    hasError: false,
    ownerName: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        id: ticket.id,
        ticketId: ticket.ticketId,
        name: ticket.name,
        projectId: ticket.projectId,
        type: ticket.type,
        customerConfirmed: ticket.customerConfirmed,
        hasError: ticket.hasError,
        ownerName: ticket.owner.name,
      });
    } else {
      setFormData({
        ticketId: `TK-${Math.floor(800 + Math.random() * 200)}`,
        name: '',
        projectId: projects[0]?.id || 'all',
        type: 'test',
        customerConfirmed: true,
        hasError: false,
        ownerName: '',
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
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã Ticket</label>
              <input 
                type="text" 
                disabled
                value={formData.ticketId}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dự án *</label>
              <select 
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              >
                <option value="all">Tất cả dự án</option>
                {projects.filter(p => p.id !== 'all').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nội dung công việc CS *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Đào tạo vận hành module kho..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loại Ticket</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              >
                <option value="test">Cấu hình / Test</option>
                <option value="training">Đào tạo / HD</option>
                <option value="deploy">Triển khai thực tế</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người thực hiện</label>
              <input 
                type="text" 
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                placeholder="Tên nhân viên CS..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, customerConfirmed: !formData.customerConfirmed})}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                formData.customerConfirmed 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Khách hàng xác nhận</span>
              </div>
              <div className={cn(
                "w-8 h-4 rounded-full relative transition-all",
                formData.customerConfirmed ? "bg-emerald-500" : "bg-slate-300"
              )}>
                <div className={cn(
                  "absolute top-1 w-2 h-2 bg-white rounded-full transition-all",
                  formData.customerConfirmed ? "right-1" : "left-1"
                )} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({...formData, hasError: !formData.hasError})}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                formData.hasError 
                  ? "bg-red-50 border-red-100 text-red-700" 
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ghi nhận lỗi</span>
              </div>
              <div className={cn(
                "w-8 h-4 rounded-full relative transition-all",
                formData.hasError ? "bg-red-500" : "bg-slate-300"
              )}>
                <div className={cn(
                  "absolute top-1 w-2 h-2 bg-white rounded-full transition-all",
                  formData.hasError ? "right-1" : "left-1"
                )} />
              </div>
            </button>
          </div>

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
              className="flex-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
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
