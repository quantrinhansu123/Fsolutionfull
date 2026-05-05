import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Link, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const DemoModal = ({ isOpen, onClose, onSave, demo }) => {
  const [formData, setFormData] = useState({
    opportunityName: '',
    customer: '',
    demoDate: '',
    minutesLink: '',
    activityLog: '',
    missingActivity: false,
    missingMinutes: false,
  });

  useEffect(() => {
    if (demo) {
      setFormData({
        opportunityName: demo.opportunityName,
        customer: demo.customer,
        demoDate: demo.demoDate,
        minutesLink: demo.minutesLink || '',
        activityLog: demo.activityLog || '',
        missingActivity: demo.missingActivity,
        missingMinutes: demo.missingMinutes,
      });
    } else {
      setFormData({
        opportunityName: '',
        customer: '',
        demoDate: new Date().toLocaleDateString('vi-VN'),
        minutesLink: '',
        activityLog: '',
        missingActivity: false,
        missingMinutes: false,
      });
    }
  }, [demo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      isValid: !formData.missingActivity && !formData.missingMinutes && !!formData.minutesLink
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {demo ? 'Cập nhật Demo' : 'Thêm Demo mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên cơ hội *</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FileText size={16} />
              </div>
              <input 
                type="text" 
                required
                value={formData.opportunityName}
                onChange={(e) => setFormData({...formData, opportunityName: e.target.value})}
                placeholder="Ví dụ: Hệ thống ERP cho ABC Corp"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Khách hàng *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngày Demo *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar size={16} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.demoDate}
                  onChange={(e) => setFormData({...formData, demoDate: e.target.value})}
                  placeholder="DD/MM/YYYY"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Biên bản cuộc họp (Minutes)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Link size={16} />
              </div>
              <input 
                type="url" 
                value={formData.minutesLink}
                onChange={(e) => setFormData({...formData, minutesLink: e.target.value})}
                placeholder="https://docs.google.com/..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ghi chú hoạt động (CRM Log)</label>
            <textarea 
              rows={3}
              value={formData.activityLog}
              onChange={(e) => setFormData({...formData, activityLog: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-4">
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
              Lưu Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
