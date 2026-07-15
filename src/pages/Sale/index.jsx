import { useState, useEffect } from 'react';
import { DemoTable } from './components/DemoTable';
import { ContractTable } from './components/ContractTable';
import { DemoModal } from './components/DemoModal';
import { Plus, LayoutGrid, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const SUB_TABS = [
  { id: 'demo', label: 'Demo', icon: LayoutGrid },
  { id: 'contract', label: 'Hợp đồng & Doanh số', icon: FileText },
];

const parseDateToDB = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

const formatDateToUI = (dateStr) => {
  if (!dateStr) return '';
  const cleanDate = dateStr.substring(0, 10);
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function SalePage({ onTabChange }) {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('demo');
  const [demos, setDemos] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);
  const isAdmin = currentUser?.accessRole === 'admin';
  const currentUserId = currentUser?.userId;

  const fetchLeads = async () => {
    try {
      if (!isAdmin && !currentUserId) {
        setLeads([]);
        return;
      }

      let query = supabase
        .from('leads')
        .select('id, ho_ten, so_dien_thoai');

      if (!isAdmin) {
        query = query.or(`phu_trach.eq.${currentUserId},created_by_staff_id.eq.${currentUserId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách leads:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name, role')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân sự:', err);
    }
  };

  const fetchDemos = async () => {
    try {
      if (!isAdmin && !currentUserId) {
        setDemos([]);
        return;
      }

      let query = supabase
        .from('opportunities')
        .select('*, users:sale_phu_trach(user_id, full_name)');

      if (!isAdmin) {
        query = query.eq('sale_phu_trach', currentUserId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedDemos = (data || []).map((o) => {
        const missingActivity = !o.ghi_chu || !o.ghi_chu.trim();
        const missingMinutes = !o.link_bien_ban || !o.link_bien_ban.trim();
        const isValid = !missingActivity && !missingMinutes;

        return {
          id: o.id,
          opportunityName: o.ten_co_hoi || '',
          customer: o.ten_khach || '',
          leadId: o.lead_id || '',
          demoDate: formatDateToUI(o.ngay_demo),
          minutesLink: o.link_bien_ban || '',
          activityLog: o.ghi_chu || '',
          missingActivity,
          missingMinutes,
          isValid,
          assignedRepId: o.sale_phu_trach || '',
          assignedRepName: o.users ? o.users.full_name : '',
        };
      });

      setDemos(mappedDemos);
    } catch (err) {
      console.error('Lỗi khi tải danh sách demo:', err);
    }
  };

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedContracts = (data || []).map((c) => {
        const status = !c.chung_tu_url
          ? 'missing_docs'
          : c.trang_thai === 'paid'
          ? 'paid'
          : 'signed';

        const paidAmount = c.thu_nhap_sale !== null && c.thu_nhap_sale !== undefined
          ? Number(c.thu_nhap_sale)
          : (c.trang_thai === 'paid' ? Math.round(Number(c.quy_chia || 0) * 0.31) : 0);

        return {
          id: c.id,
          code: c.ma_hop_dong || '',
          customer: c.ten_khach || '',
          contractAmount: Number(c.doanh_thu) || 0,
          fund: Number(c.quy_chia) || 0,
          paidAmount,
          document: c.chung_tu_url || '',
          status,
        };
      });

      setContracts(mappedContracts);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hợp đồng:', err);
    }
  };

  useEffect(() => {
    fetchDemos();
    fetchContracts();
    fetchUsers();
    fetchLeads();
  }, [currentUserId, isAdmin]);

  const handleSaveDemo = async (formData) => {
    try {
      const dbDate = parseDateToDB(formData.demoDate);
      const thu_nhap_demo = formData.isValid ? 50000 : 0;

      if (editingDemo) {
        let query = supabase
          .from('opportunities')
          .update({
            ten_co_hoi: formData.opportunityName,
            ten_khach: formData.customer,
            lead_id: formData.leadId || null,
            ngay_demo: dbDate,
            link_bien_ban: formData.minutesLink || null,
            ghi_chu: formData.activityLog || null,
            thu_nhap_demo,
            sale_phu_trach: isAdmin ? formData.salePhuTrach || null : currentUserId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDemo.id);

        if (!isAdmin) {
          query = query.eq('sale_phu_trach', currentUserId);
        }

        const { error } = await query;

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert([{
            ten_co_hoi: formData.opportunityName,
            ten_khach: formData.customer,
            lead_id: formData.leadId || null,
            ngay_demo: dbDate,
            link_bien_ban: formData.minutesLink || null,
            ghi_chu: formData.activityLog || null,
            thu_nhap_demo,
            sale_phu_trach: isAdmin ? formData.salePhuTrach || null : currentUserId || null,
            giai_doan: 'demo',
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingDemo(null);
      await fetchDemos();
    } catch (err) {
      console.error('Lỗi khi lưu demo:', err);
      alert('Lỗi khi lưu demo: ' + err.message);
    }
  };

  const handleDeleteDemo = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Demo này không?')) {
      try {
        let query = supabase
          .from('opportunities')
          .delete()
          .eq('id', id);

        if (!isAdmin) {
          query = query.eq('sale_phu_trach', currentUserId);
        }

        const { error } = await query;

        if (error) throw error;

        await fetchDemos();
      } catch (err) {
        console.error('Lỗi khi xóa demo:', err);
        alert('Lỗi khi xóa demo: ' + err.message);
      }
    }
  };

  const handleEditDemo = (demo) => {
    setEditingDemo(demo);
    setIsModalOpen(true);
  };

  const handleAddDemo = () => {
    setEditingDemo(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shadow-slate-900/20">
              <TrendingUp size={32} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Demo & Hợp đồng</h2>
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Sale Performance Hub</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {SUB_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                    activeSubTab === tab.id
                      ? 'bg-white text-blue-700 shadow-xl shadow-slate-200/50 translate-y-0'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeSubTab === 'demo' && (
            <button 
              onClick={handleAddDemo}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Plus size={20} />
              <span>Thêm Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
        {activeSubTab === 'demo' ? (
          <DemoTable 
            demos={demos} 
            onEdit={handleEditDemo}
            onDelete={handleDeleteDemo}
            onQuote={(demo) => {
              // Truyền đầy đủ context để BaoGia page biết đang báo giá cho ai
              localStorage.setItem('baogia_context', JSON.stringify({
                opportunity_id: demo.id,
                lead_id: demo.leadId || null,
                sale_id: demo.assignedRepId || null,
                ten_khach: demo.customer,
                ten_sale: demo.assignedRepName || 'Chưa rõ',
              }));
              if (onTabChange) {
                onTabChange('BaoGia');
              }
            }}
          />
        ) : (
          <ContractTable contracts={contracts} />
        )}
      </div>

      <DemoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDemo}
        demo={editingDemo}
        users={users}
        leads={leads}
      />
    </div>
  );
}
