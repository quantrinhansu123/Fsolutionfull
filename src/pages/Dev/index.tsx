import { useState, useEffect } from 'react';
import { DevTicketTable } from './components/DevTicketTable';
import type { Ticket } from './components/DevTicketTable';
import { DevSummary } from './components/DevSummary';
import { PointReference } from './components/PointReference';
import { DevTicketModal, TICKET_TYPE_MAP } from './components/DevTicketModal';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Filter, Code2, Sparkles, User, RefreshCw, AlertTriangle } from 'lucide-react';

// Tỷ lệ mặc định bộ phận Dev nếu không có trong income_rate_config
const DEFAULT_DEV_RATE = 37;
// Tổng điểm chuẩn của dự án
const TOTAL_STANDARD_POINTS = 27;

export default function DevPage() {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devRate, setDevRate] = useState(DEFAULT_DEV_RATE);

  const [selectedDev, setSelectedDev] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // ─── Fetch tỷ lệ bộ phận Dev từ income_rate_config ───────────────────────
  const fetchDevRate = async () => {
    try {
      let query = supabase
        .from('income_rate_config')
        .select('ty_le')
        .eq('bo_phan', 'dev');

      if (selectedProject.id !== 'all') {
        query = query.eq('project_id', selectedProject.id);
      }

      const { data, error: rErr } = await query;
      if (rErr) throw rErr;

      if (data && data.length > 0) {
        const avgRate = data.reduce((sum: number, r: any) => sum + Number(r.ty_le), 0) / data.length;
        setDevRate(avgRate);
      } else {
        setDevRate(DEFAULT_DEV_RATE);
      }
    } catch (err) {
      console.warn('Không tải được income_rate_config, dùng tỷ lệ mặc định 37%:', err);
      setDevRate(DEFAULT_DEV_RATE);
    }
  };

  // ─── Fetch danh sách task Dev từ Supabase ─────────────────────────────────
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
            name
          )
        `)
        .eq('bo_phan', 'dev');

      if (selectedProject.id !== 'all') {
        query = query.eq('project_id', selectedProject.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      if (fetchError) throw fetchError;

      if (data) {
        const mapped: Ticket[] = data.map((t: any) => {
          // Convert loai DB code → label tiếng Việt
          const typeInfo = TICKET_TYPE_MAP.find(tm => tm.dbCode === t.loai);
          const typeLabel = typeInfo ? typeInfo.label : (t.loai || 'Không xác định');
          const point = typeInfo ? typeInfo.points : (Number(t.diem) || 0);

          return {
            id: t.id,
            ma_ticket: t.ma_ticket || '',
            name: t.tieu_de || '',
            type: typeLabel,
            point,
            status: t.trang_thai || 'done',
            reopen: Number(t.so_lan_reopen) || 0,
            isBugByDev: !!t.bug_do_dev,
            developedBy: t.users?.full_name || 'Chưa phân công',
            phu_trach: t.phu_trach || '',
            projectId: t.project_id || '',
          };
        });
        setTickets(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching Dev tickets:', err);
      setError(err.message || 'Không thể đồng bộ dữ liệu task Dev từ Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchDevRate();
  }, [selectedProject.id]);

  // ─── CRUD Handlers ────────────────────────────────────────────────────────

  const handleSaveTicket = async (formData: any) => {
    try {
      const typeInfo = TICKET_TYPE_MAP.find(t => t.label === formData.type || t.dbCode === formData.dbLoai);
      const diem = typeInfo ? typeInfo.points : formData.point || 0;
      const loai = typeInfo ? typeInfo.dbCode : formData.dbLoai || null;

      if (editingTicket) {
        // Cập nhật task
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            tieu_de: formData.name,
            loai,
            diem,
            so_lan_reopen: formData.reopen || 0,
            bug_do_dev: !!formData.isBugByDev,
            phu_trach: formData.phu_trach || null,
            project_id: formData.projectId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTicket.id);

        if (updateError) throw updateError;
      } else {
        // Thêm mới task
        const { error: insertError } = await supabase
          .from('tickets')
          .insert([{
            ma_ticket: formData.ma_ticket || `TK-${Math.floor(1000 + Math.random() * 9000)}`,
            tieu_de: formData.name,
            loai,
            diem,
            bo_phan: 'dev',
            trang_thai: 'done',
            so_lan_reopen: formData.reopen || 0,
            bug_do_dev: !!formData.isBugByDev,
            phu_trach: formData.phu_trach || null,
            project_id: formData.projectId || null,
            hop_le: false,
            co_tai_lieu: false,
            khach_xac_nhan: false,
            loi_sau_trien_khai: false,
            thu_nhap: 0,
            do_uu_tien: 'medium',
          }]);

        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (err: any) {
      console.error('Error saving Dev ticket:', err);
      alert('Lỗi khi lưu task: ' + err.message);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Task này không?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      fetchTickets();
    } catch (err: any) {
      console.error('Error deleting Dev ticket:', err);
      alert('Lỗi khi xóa task: ' + err.message);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  // ─── Lọc & Tính toán ─────────────────────────────────────────────────────

  // Lấy danh sách Dev duy nhất từ tickets thực tế
  const developers = Array.from(new Set(tickets.map(t => t.developedBy))).filter(d => d !== 'Chưa phân công');

  const filteredTickets = tickets.filter(t => {
    return selectedDev === 'all' || t.developedBy === selectedDev;
  });

  const totalValidPoints = filteredTickets
    .filter(t => t.reopen <= 1 && !t.isBugByDev)
    .reduce((sum, t) => sum + t.point, 0);

  const projectFund = selectedProject.revenue * 0.6;
  const devFund = projectFund * (devRate / 100);
  const pricePerPoint = TOTAL_STANDARD_POINTS > 0 ? devFund / TOTAL_STANDARD_POINTS : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-600/20">
              <Code2 size={32} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng hợp thu nhập Dev</h2>
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Development Performance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Nút làm mới */}
          <button
            onClick={() => { fetchTickets(); fetchDevRate(); }}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Project Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <Filter size={18} />
            </div>
            <select
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[200px]"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Dev Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
              <User size={18} />
            </div>
            <select
              value={selectedDev}
              onChange={(e) => setSelectedDev(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[180px]"
            >
              <option value="all">Tất cả Dev</option>
              {developers.map(dev => (
                <option key={dev} value={dev}>{dev}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddTicket}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Plus size={20} />
            <span>Thêm Task Dev</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu task Dev từ Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Không thể tải dữ liệu task Dev</h3>
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
          {/* Ticket Table */}
          <div className="w-full">
            <DevTicketTable
              tickets={filteredTickets}
              pricePerPoint={pricePerPoint}
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-full">
              <DevSummary
                totalValidPoints={totalValidPoints}
                totalStandardPoints={TOTAL_STANDARD_POINTS}
              />
            </div>
            <div className="h-full">
              <PointReference />
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <DevTicketModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTicket(null); }}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        projects={projects}
      />
    </div>
  );
}
