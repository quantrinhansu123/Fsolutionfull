import React, { useState, useEffect } from 'react';
import { TicketTable } from './components/TicketTable';
import { BASummary } from './components/BASummary';
import { TicketModal } from './components/TicketModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { useProject } from '../../context/ProjectContext';
import { Plus, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const FALLBACK_PROJECT_FUND = 0;

export default function BAPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);

  // Tải danh sách ticket BA từ Supabase
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tickets')
        .select(`
          *,
          users!phu_trach (
            user_id,
            full_name,
            avatar_url,
            role
          ),
          projects (
            project_id,
            name,
            pricing
          ),
          ticket_payment_stages (
            giai_doan,
            da_tra
          )
        `)
        .eq('bo_phan', 'ba');

      // Nếu không phải chọn tất cả dự án, lọc theo project_id
      if (selectedProject.id !== 'all') {
        query = query.eq('project_id', selectedProject.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching BA tickets:', err);
      setError(err.message || 'Không thể đồng bộ dữ liệu ticket BA từ Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedProject.id]);

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (ticket) => {
    setDeletingTicket(ticket);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingTicket) {
      try {
        const { error: deleteError } = await supabase
          .from('tickets')
          .delete()
          .eq('id', deletingTicket.id);

        if (deleteError) throw deleteError;

        setIsDeleteModalOpen(false);
        setDeletingTicket(null);
        fetchTickets();
      } catch (err) {
        console.error('Error deleting ticket:', err);
        alert('Lỗi khi xóa ticket: ' + err.message);
      }
    }
  };

  const handleSaveTicket = async (formData) => {
    try {
      // Tính toán thu nhập dự tính dựa trên dự án được chọn
      const selectedProj = projects.find(p => p.id === formData.projectId);
      const projRevenue = selectedProj ? selectedProj.revenue : FALLBACK_PROJECT_FUND;
      const calculatedIncome = Math.round(projRevenue * 0.08); // 8% BA Rate

      if (editingTicket) {
        // Cập nhật ticket
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            tieu_de: formData.name,
            project_id: formData.projectId || null,
            tai_lieu_url: formData.docLink || null,
            co_tai_lieu: !!formData.docLink,
            phu_trach: formData.phu_trach || null,
            thu_nhap: calculatedIncome,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTicket.id);

        if (updateError) throw updateError;
      } else {
        // Thêm ticket mới
        const { error: insertError } = await supabase
          .from('tickets')
          .insert([{
            ma_ticket: formData.ticketId,
            tieu_de: formData.name,
            project_id: formData.projectId || null,
            tai_lieu_url: formData.docLink || null,
            co_tai_lieu: !!formData.docLink,
            phu_trach: formData.phu_trach || null,
            bo_phan: 'ba',
            loai: 'ba',
            trang_thai: 'in_progress',
            diem: 0,
            thu_nhap: calculatedIncome,
            so_lan_reopen: 0,
            bug_do_dev: false,
            khach_xac_nhan: false,
            loi_sau_trien_khai: false,
            hop_le: false,
            do_uu_tien: 'medium'
          }]);

        if (insertError) throw insertError;
      }
      
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error('Error saving ticket:', err);
      alert('Lỗi khi lưu ticket: ' + err.message);
    }
  };

  // Xác định Project Fund động cho Page (nếu chọn tất cả thì dùng fallback hoặc tính tổng)
  const currentProjectFund = selectedProject.revenue || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-1">Quy trình nghiệp vụ</p>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản lý Ticket BA/SA</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter size={16} />
            </div>
            <select 
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Thêm Ticket BA</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu ticket BA từ Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 max-w-xl mx-auto text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Không thể tải dữ liệu ticket BA</h3>
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
          <button 
            onClick={fetchTickets}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 active:scale-95 transition-all"
          >
            Kết nối lại
          </button>
        </div>
      ) : (
        <>
          {/* Ticket Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Danh sách Ticket - {selectedProject.name}</h3>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase">
                {tickets.length} Tickets
              </span>
            </div>
            <TicketTable 
              tickets={tickets} 
              projectFund={currentProjectFund} 
              onEdit={handleEditTicket}
              onDelete={handleOpenDeleteModal}
            />
          </div>

          {/* Summary */}
          <BASummary tickets={tickets} projectFund={currentProjectFund} />
        </>
      )}

      {/* Modals */}
      <TicketModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        projects={projects}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        ticketName={deletingTicket?.tieu_de || deletingTicket?.ma_ticket}
      />
    </div>
  );
}
