import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, User, Hash, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TICKET_TYPES = [
  { label: 'Module lớn', points: 8 },
  { label: 'Module nhỏ', points: 5 },
  { label: 'Cải tiến', points: 3 },
  { label: 'Bug lớn', points: 2 },
  { label: 'Bug nhỏ', points: 1 },
];

export const DevTicketModal = ({ isOpen, onClose, onSave, ticket }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Module nhỏ',
    point: 5,
    status: 'Done',
    reopen: 0,
    isBugByDev: false,
    developedBy: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData(ticket);
    } else {
      setFormData({
        id: `TK-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        type: 'Module nhỏ',
        point: 5,
        status: 'Done',
        reopen: 0,
        isBugByDev: false,
        developedBy: '',
      });
    }
  }, [ticket, isOpen]);

  const handleTypeChange = (type) => {
    const selectedType = TICKET_TYPES.find(t => t.label === type);
    setFormData({
      ...formData,
      type,
      point: selectedType ? selectedType.points : 0
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
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
              {ticket ? 'Cập nhật Ticket Dev' : 'Thêm Ticket Dev mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã Ticket</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash size={16} />
                </div>
                <input 
                  type="text" 
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loại Ticket *</label>
              <select 
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {TICKET_TYPES.map(t => (
                  <option key={t.label} value={t.label}>{t.label} ({t.points}đ)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên Ticket / Tính năng *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Phát triển API Login, UI Dashboard..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người thực hiện</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.developedBy}
                  onChange={(e) => setFormData({...formData, developedBy: e.target.value})}
                  placeholder="Tên Dev..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số lần Reopen</label>
              <input 
                type="number" 
                min="0"
                value={formData.reopen}
                onChange={(e) => setFormData({...formData, reopen: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormData({...formData, isBugByDev: !formData.isBugByDev})}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              formData.isBugByDev 
                ? "bg-red-50 border-red-100 text-red-700" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                formData.isBugByDev ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-slate-200 text-slate-400"
              )}>
                <Bug size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest">Lỗi chủ quan do Dev</span>
                <span className="text-[9px] font-bold opacity-60">Sẽ bị loại bỏ khỏi danh sách tính thu nhập</span>
              </div>
            </div>
            <div className={cn(
              "w-10 h-5 rounded-full relative transition-all",
              formData.isBugByDev ? "bg-red-500" : "bg-slate-300"
            )}>
              <div className={cn(
                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                formData.isBugByDev ? "right-1" : "left-1"
              )} />
            </div>
          </button>

          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-start gap-3">
            <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-orange-700/80 leading-relaxed italic">
              Ticket có số lần Reopen {'>'} 1 hoặc bị đánh dấu là "Lỗi chủ quan" sẽ không được tính thu nhập.
            </p>
          </div>

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
              Lưu Ticket Dev
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
