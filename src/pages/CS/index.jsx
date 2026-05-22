import React, { useState, useEffect } from 'react';
import { CSTicketTable } from './components/CSTicketTable';
import { AMCIncome } from './components/AMCIncome';
import { CSSummary } from './components/CSSummary';
import { CSTicketModal } from './components/CSTicketModal';
import { useProject } from '../../context/ProjectContext';
import { Plus, Filter, Headphones, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function CSPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [csRate, setCsRate] = useState(0);
  const [amcTotal, setAmcTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Fetch real users list for dropdown
  const fetchUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('user_id, full_name, role')
        .order('full_name', { ascending: true });
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch CS income rate from income_rate_config
  const fetchCsRate = async () => {
    try {
      const query = supabase
        .from('income_rate_config')
        .select('ty_le')
        .eq('bo_phan', 'cs');

      // If a specific project is selected, filter by it; otherwise take first CS rate found
      if (selectedProject.id !== 'all') {
        query.eq('project_id', selectedProject.id);
      }

      const { data, error: fetchError } = await query.limit(1).maybeSingle();
      if (fetchError) throw fetchError;
      setCsRate(data ? Number(data.ty_le) : 0);
    } catch (err) {
      console.error('Error fetching CS rate:', err);
      setCsRate(0);
    }
  };

  // Fetch AMC total for Year 1 CS eligibility
  const fetchAmcTotal = async () => {
    try {
      let query = supabase
        .from('amc_payments')
        .select('tong_amc');

      if (selectedProject.id !== 'all') {
        query = query.eq('project_id', selectedProject.id);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      const total = (data || []).reduce((sum, row) => sum + (Number(row.tong_amc) || 0), 0);
      setAmcTotal(total);
    } catch (err) {
      console.error('Error fetching AMC payments:', err);
      setAmcTotal(0);
    }
  };

  // Fetch CS tickets from Supabase
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
        .eq('bo_phan', 'cs');

      if (selectedProject.id !== 'all') {
        query = query.eq('project_id', selectedProject.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      if (fetchError) throw fetchError;

      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching CS tickets:', err);
      setError(err.message || 'Không thể đồng bộ dữ liệu ticket CS từ Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    fetchTickets();
    fetchCsRate();
    fetchAmcTotal();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    refreshAll();
  }, [selectedProject.id]);

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (ticket) => {
    setDeletingTicket(ticket);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTicket) return;
    try {
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', deletingTicket.id);
      if (deleteError) throw deleteError;
      setIsDeleteConfirmOpen(false);
      setDeletingTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Error deleting CS ticket:', err);
      alert('Lỗi khi xóa ticket: ' + err.message);
    }
  };

  const handleSaveTicket = async (formData) => {
    try {
      // Income = project pricing * cs rate (%)
      const selectedProj = projects.find(p => p.id === formData.projectId);
      const projPricing = selectedProj ? (selectedProj.revenue || 0) : 0;
      const calculatedIncome = Math.round(projPricing * (csRate / 100));

      if (editingTicket) {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            tieu_de: formData.name,
            project_id: formData.projectId || null,
            loai: formData.type,
            phu_trach: formData.phuTrach || null,
            khach_xac_nhan: formData.customerConfirmed,
            loi_sau_trien_khai: formData.hasError,
            thu_nhap: calculatedIncome,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTicket.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('tickets')
          .insert([{
            ma_ticket: formData.ticketId,
            tieu_de: formData.name,
            project_id: formData.projectId || null,
            loai: formData.type,
            bo_phan: 'cs',
            phu_trach: formData.phuTrach || null,
            trang_thai: 'in_progress',
            khach_xac_nhan: formData.customerConfirmed,
            loi_sau_trien_khai: formData.hasError,
            thu_nhap: calculatedIncome,
            diem: 0,
            so_lan_reopen: 0,
            bug_do_dev: false,
            co_tai_lieu: false,
            hop_le: false,
            do_uu_tien: 'medium',
          }]);
        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error('Error saving CS ticket:', err);
      alert('Lỗi khi lưu ticket: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header / Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
              <Headphones size={28} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hỗ trợ & Triển khai CS</h2>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Customer Success Operations</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Refresh button */}
          <button
            onClick={refreshAll}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <Filter size={18} />
            </div>
            <select
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[200px]"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={20} />
            <span>Tạo Ticket CS</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu ticket CS từ Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 p-12 max-w-xl mx-auto text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Không thể tải dữ liệu ticket CS</h3>
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
          <button
            onClick={refreshAll}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 active:scale-95 transition-all"
          >
            Kết nối lại
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Full Width Ticket Table */}
          <div className="w-full">
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh sách Ticket — {selectedProject.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium italic">Theo dõi tiến độ triển khai và xác nhận của khách hàng</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl">
                  <span className="text-sm font-black tabular-nums">{tickets.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tickets</span>
                </div>
              </div>
              <CSTicketTable
                tickets={tickets}
                csRate={csRate}
                onEdit={handleEditTicket}
                onDelete={handleOpenDeleteConfirm}
              />
            </div>
          </div>

          {/* AMC Income Section */}
          <div className="w-full">
            <AMCIncome amcTotal={amcTotal} />
          </div>
        </div>
      )}

      {/* Summary Section */}
      {!loading && !error && (
        <div className="pt-4">
          <CSSummary tickets={tickets} csRate={csRate} amcTotal={amcTotal} />
        </div>
      )}

      {/* Create / Edit Modal */}
      <CSTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        projects={projects}
        users={users}
      />

      {/* Delete Confirm Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Xóa Ticket CS?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Ticket <span className="font-bold text-slate-700">"{deletingTicket?.tieu_de || deletingTicket?.ma_ticket}"</span> sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setDeletingTicket(null); }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
