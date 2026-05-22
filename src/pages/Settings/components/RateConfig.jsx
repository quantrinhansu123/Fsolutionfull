import { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useProject } from '../../../context/ProjectContext';

const BO_PHAN_LIST = [
  { key: 'marketing', label: 'Marketing', color: 'bg-pink-500' },
  { key: 'sale',      label: 'Sale',      color: 'bg-indigo-500' },
  { key: 'ba',        label: 'BA / SA',   color: 'bg-amber-500' },
  { key: 'product',   label: 'Product',   color: 'bg-emerald-500' },
  { key: 'dev',       label: 'Dev',       color: 'bg-blue-500' },
  { key: 'cs',        label: 'CS',        color: 'bg-violet-500' },
];

export const RateConfig = () => {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [rates, setRates] = useState(
    BO_PHAN_LIST.map(b => ({ ...b, value: 0, recordId: null }))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Tải tỷ lệ từ Supabase theo project được chọn
  const fetchRates = async () => {
    if (selectedProject.id === 'all') {
      // Khi chọn "Tất cả": lấy trung bình tỷ lệ từ tất cả project
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('income_rate_config')
          .select('bo_phan, ty_le, id, project_id');
        if (error) throw error;

        const avgRates = BO_PHAN_LIST.map(b => {
          const matches = (data || []).filter(r => r.bo_phan === b.key);
          const avg = matches.length > 0
            ? matches.reduce((sum, r) => sum + Number(r.ty_le), 0) / matches.length
            : 0;
          return { ...b, value: parseFloat(avg.toFixed(1)), recordId: null };
        });
        setRates(avgRates);
      } catch (err) {
        console.error('Fetch rates error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('income_rate_config')
        .select('id, bo_phan, ty_le')
        .eq('project_id', selectedProject.id);
      if (error) throw error;

      const mapped = BO_PHAN_LIST.map(b => {
        const found = (data || []).find(r => r.bo_phan === b.key);
        return { ...b, value: found ? parseFloat(found.ty_le) : 0, recordId: found ? found.id : null };
      });
      setRates(mapped);
    } catch (err) {
      console.error('Fetch rates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, [selectedProject.id]);

  const total = rates.reduce((sum, r) => sum + r.value, 0);
  const diff = Math.abs(total - 100).toFixed(1);
  const isValid = Math.abs(total - 100) < 0.1;
  const isAllMode = selectedProject.id === 'all';

  const handleChange = (key, newValue) => {
    if (isAllMode) return; // read-only khi xem tất cả
    const val = parseFloat(newValue);
    if (isNaN(val) || val < 0 || val > 100) return;
    setRates(prev => prev.map(r => r.key === key ? { ...r, value: val } : r));
    setSaveStatus(null);
  };

  const handleSave = async () => {
    if (!isValid || isAllMode) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      for (const rate of rates) {
        if (rate.recordId) {
          // Update existing record
          const { error } = await supabase
            .from('income_rate_config')
            .update({ ty_le: rate.value, updated_at: new Date().toISOString() })
            .eq('id', rate.recordId);
          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('income_rate_config')
            .insert([{
              project_id: selectedProject.id,
              bo_phan: rate.key,
              ty_le: rate.value,
            }]);
          if (error) throw error;
        }
      }
      setSaveStatus('success');
      fetchRates(); // Reload để lấy ID mới nếu vừa insert
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Save rates error:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Tỷ lệ chia quỹ bộ phận</h3>
          <p className="text-sm text-slate-500 mt-0.5">Cấu hình % thu nhập cho từng bộ phận theo từng dự án</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project selector */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Filter size={15} /></div>
            <select
              value={selectedProject.id}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px]"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {isAllMode && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-semibold flex items-center gap-2">
            <AlertTriangle size={14} />
            Đang xem trung bình tỷ lệ của tất cả dự án. Chọn một dự án cụ thể để chỉnh sửa.
          </div>
        )}

        {/* Rate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rates.map(rate => (
            <div key={rate.key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
              <div className={`w-1.5 h-10 rounded-full ${rate.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rate.label}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={rate.value}
                    onChange={e => handleChange(rate.key, e.target.value)}
                    disabled={isAllMode || loading}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-right text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                  />
                  <span className="text-sm font-bold text-slate-400 shrink-0">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Tổng tỷ lệ</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black tabular-nums ${isValid ? 'text-emerald-600' : total < 100 ? 'text-orange-500' : 'text-red-500'}`}>
                {total.toFixed(1)}%
              </span>
              {isValid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <CheckCircle size={12} /> Hợp lệ
                </span>
              ) : total < 100 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  <AlertTriangle size={12} /> Còn thiếu {diff}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  <XCircle size={12} /> Vượt quá {diff}%
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isValid ? 'bg-emerald-500' : total < 100 ? 'bg-orange-400' : 'bg-red-500'}`}
              style={{ width: `${Math.min(total, 100)}%` }}
            />
          </div>
        </div>

        {/* Save action */}
        <div className="flex items-center justify-between">
          {saveStatus === 'success' && (
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} /> Đã lưu thành công!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm font-bold text-red-600 flex items-center gap-1">
              <XCircle size={14} /> Lưu thất bại. Thử lại!
            </span>
          )}
          {!saveStatus && <span />}
          <button
            onClick={handleSave}
            disabled={!isValid || isAllMode || saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
              isValid && !isAllMode
                ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};
