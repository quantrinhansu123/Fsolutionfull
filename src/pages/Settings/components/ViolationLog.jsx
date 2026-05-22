import { useState, useEffect } from 'react';
import { Download, Filter, RefreshCw, AlertTriangle, ShieldAlert, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const PENALTY_CONFIG = {
  no_pay:    { text: 'Không tính tiền', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  deduct_100: { text: 'Trừ 100%',       color: 'bg-orange-100 text-orange-800 border-orange-200' },
  terminate:  { text: 'Dừng hợp tác',   color: 'bg-red-100 text-red-800 border-red-200' },
};

const DEPARTMENTS = ['Tất cả', 'dev', 'marketing', 'sale', 'ba', 'product', 'cs'];
const DEPT_LABELS  = { dev: 'Dev', marketing: 'Marketing', sale: 'Sale', ba: 'BA / SA', product: 'Product', cs: 'CS' };

const EMPTY_FORM = {
  bo_phan: 'dev',
  nguoi_vi_pham: '',
  loai_vi_pham: '',
  muc_phat: 'no_pay',
  xu_ly: '',
};

export const ViolationLog = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [filterDept, setFilterDept] = useState('Tất cả');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  // Tải danh sách vi phạm từ Supabase
  const fetchViolations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterDept !== 'Tất cả') {
        query = query.eq('bo_phan', filterDept);
      }

      const { data, error } = await query;
      if (error) throw error;
      setViolations(data || []);
    } catch (err) {
      console.error('Fetch violations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViolations(); }, [filterDept]);

  // Thêm vi phạm mới
  const handleAddViolation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('violations')
        .insert([{
          bo_phan: formData.bo_phan,
          nguoi_vi_pham: formData.nguoi_vi_pham,
          loai_vi_pham: formData.loai_vi_pham,
          muc_phat: formData.muc_phat,
          xu_ly: formData.xu_ly,
        }]);
      if (error) throw error;
      setShowAddModal(false);
      setFormData(EMPTY_FORM);
      fetchViolations();
    } catch (err) {
      console.error('Add violation error:', err);
      alert('Lỗi khi thêm vi phạm: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Xóa vi phạm
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản ghi vi phạm này?')) return;
    try {
      const { error } = await supabase.from('violations').delete().eq('id', id);
      if (error) throw error;
      fetchViolations();
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  // Xuất CSV
  const handleExport = () => {
    if (violations.length === 0) return;
    const headers = 'Thời gian,Bộ phận,Người vi phạm,Loại vi phạm,Mức phạt,Xử lý';
    const rows = violations.map(v => {
      const penalty = PENALTY_CONFIG[v.muc_phat]?.text || v.muc_phat;
      const time = v.created_at ? new Date(v.created_at).toLocaleString('vi-VN') : '';
      return `"${time}","${DEPT_LABELS[v.bo_phan] || v.bo_phan}","${v.nguoi_vi_pham}","${v.loai_vi_pham}","${penalty}","${v.xu_ly || ''}"`;
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `violation_log_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Log vi phạm</h3>
            <p className="text-sm text-slate-500 mt-0.5">Lịch sử vi phạm và hình thức xử lý</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bộ lọc bộ phận */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Filter size={14} /></div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d === 'Tất cả' ? 'Tất cả bộ phận' : (DEPT_LABELS[d] || d)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchViolations}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            disabled={violations.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Download size={14} />
            Xuất CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
          >
            <Plus size={14} />
            Ghi nhận vi phạm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold">Đang tải dữ liệu...</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={28} />
            </div>
            <div>
              <p className="font-bold text-slate-700">Chưa có vi phạm nào</p>
              <p className="text-sm text-slate-400 mt-1">Không tìm thấy bản ghi vi phạm nào {filterDept !== 'Tất cả' ? `ở bộ phận ${DEPT_LABELS[filterDept] || filterDept}` : ''}.</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Bộ phận</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Người vi phạm</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Loại vi phạm</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Mức phạt</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Xử lý</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {violations.map(v => {
                const penalty = PENALTY_CONFIG[v.muc_phat] || { text: v.muc_phat, color: 'bg-slate-100 text-slate-600 border-slate-200' };
                const time = v.created_at ? new Date(v.created_at).toLocaleString('vi-VN') : '';
                return (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400 whitespace-nowrap">{time}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                        {DEPT_LABELS[v.bo_phan] || v.bo_phan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{v.nguoi_vi_pham}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-orange-400 shrink-0" />
                      {v.loai_vi_pham}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${penalty.color}`}>
                        {penalty.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[220px] truncate">{v.xu_ly}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Violation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl"><ShieldAlert size={18} /></div>
                <h3 className="text-lg font-extrabold text-slate-800">Ghi nhận vi phạm</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddViolation} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bộ phận *</label>
                  <select
                    required
                    value={formData.bo_phan}
                    onChange={e => setFormData({ ...formData, bo_phan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    {DEPARTMENTS.filter(d => d !== 'Tất cả').map(d => (
                      <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mức phạt *</label>
                  <select
                    required
                    value={formData.muc_phat}
                    onChange={e => setFormData({ ...formData, muc_phat: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    {Object.entries(PENALTY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.text}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Người vi phạm *</label>
                <input
                  required
                  type="text"
                  placeholder="Tên nhân viên..."
                  value={formData.nguoi_vi_pham}
                  onChange={e => setFormData({ ...formData, nguoi_vi_pham: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Loại vi phạm *</label>
                <input
                  required
                  type="text"
                  placeholder="Vd: Sai dữ liệu ticket, Lead trùng..."
                  value={formData.loai_vi_pham}
                  onChange={e => setFormData({ ...formData, loai_vi_pham: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Xử lý cụ thể</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả cách xử lý vi phạm..."
                  value={formData.xu_ly}
                  onChange={e => setFormData({ ...formData, xu_ly: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                  Ghi nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
