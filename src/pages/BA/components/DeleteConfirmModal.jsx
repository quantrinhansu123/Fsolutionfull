import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, ticketName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Warning Icon Area */}
        <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Xác nhận xóa Ticket?</h3>
          <p className="text-sm text-slate-500 px-2 leading-relaxed">
            Bạn đang yêu cầu xóa ticket <span className="font-bold text-slate-700">"{ticketName}"</span>. 
            Hành động này không thể hoàn tác và dữ liệu thu nhập liên quan sẽ bị mất.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>
  );
};
