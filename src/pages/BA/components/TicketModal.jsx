import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '../../../lib/supabaseClient';

export const TicketModal = ({ isOpen, onClose, onSave, ticket, projects }) => {
  const [formData, setFormData] = useState({
    ticketId: '',
    name: '',
    projectId: '',
    docLink: '',
    phu_trach: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Fetch danh sách users từ Supabase khi mở Modal
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
        if (data) {
          setUsersList(data);
        }
      } catch (err) {
        console.error('Error fetching users in TicketModal:', err);
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Thiết lập dữ liệu form ban đầu
  useEffect(() => {
    if (ticket) {
      setFormData({
        ticketId: ticket.ma_ticket || '',
        name: ticket.tieu_de || '',
        projectId: ticket.project_id || '',
        docLink: ticket.tai_lieu_url || '',
        phu_trach: ticket.phu_trach || '',
      });
    } else {
      setFormData({
        ticketId: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        projectId: projects[0]?.id || '',
        docLink: '',
        phu_trach: '',
      });
    }
  }, [ticket, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">
            {ticket ? 'Chỉnh sửa Ticket BA' : 'Thêm Ticket BA mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mã Ticket</label>
            <input 
              type="text" 
              disabled
              value={formData.ticketId}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tên Ticket *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Đặc tả module Quản lý kho..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dự án *</label>
              <select 
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Người thực hiện *</label>
              <select 
                required
                value={formData.phu_trach}
                onChange={(e) => setFormData({...formData, phu_trach: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">{fetchingUsers ? 'Đang tải...' : 'Chọn nhân viên...'}</option>
                {usersList.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Mngr' : 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Link tài liệu đặc tả (Google Docs/Notion)</label>
            <input 
              type="url" 
              value={formData.docLink}
              onChange={(e) => setFormData({...formData, docLink: e.target.value})}
              placeholder="https://docs.google.com/..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2">
            <AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
              Ticket hợp lệ cần có đầy đủ link tài liệu đặc tả để được phê duyệt nghiệm thu và tính quỹ thu nhập.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
