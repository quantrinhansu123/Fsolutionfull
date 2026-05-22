import { useState, useEffect } from 'react';
import { RotateCcw, Save, RefreshCw, CheckCircle, XCircle, Filter } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useProject } from '../../../context/ProjectContext';

const DEFAULT_DEV_POINTS = [
  { key: 'dev_module_lon', label: 'Module lớn', bo_phan: 'dev', value: 8 },
  { key: 'dev_module_nho', label: 'Module nhỏ', bo_phan: 'dev', value: 5 },
  { key: 'dev_cai_tien',   label: 'Cải tiến',   bo_phan: 'dev', value: 3 },
  { key: 'dev_bug_lon',    label: 'Bug lớn',     bo_phan: 'dev', value: 2 },
  { key: 'dev_bug_nho',    label: 'Bug nhỏ',     bo_phan: 'dev', value: 1 },
];

const DEFAULT_CS_POINTS = [
  { key: 'cs_test',     label: 'Test',     bo_phan: 'cs', value: 1 },
  { key: 'cs_training', label: 'Training', bo_phan: 'cs', value: 2 },
  { key: 'cs_deploy',   label: 'Deploy',   bo_phan: 'cs', value: 3 },
];

const PointTable = ({ title, color, items, onChange, disabled }) => (
  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
      <div className={`w-1.5 h-5 rounded-full ${color}`} />
      <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="p-4 space-y-3">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600 min-w-[110px] flex-1">{item.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={item.value}
              disabled={disabled}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) onChange(item.key, val);
              }}
              className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-right text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
            />
            <span className="text-xs font-bold text-slate-400 w-10">point</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PointConfig = () => {
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const [devPoints, setDevPoints] = useState(DEFAULT_DEV_POINTS);
  const [csPoints, setCsPoints]   = useState(DEFAULT_CS_POINTS);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const isAllMode = selectedProject.id === 'all';

  // Tải cấu hình point từ Supabase theo project
  const fetchPoints = async () => {
    if (isAllMode) return; // Không tải khi xem tất cả
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('point_config')
        .select('loai_ticket, diem')
        .eq('project_id', selectedProject.id);
      if (error) throw error;

      if (data && data.length > 0) {
        setDevPoints(prev => prev.map(p => {
          const found = data.find(d => d.loai_ticket === p.key);
          return found ? { ...p, value: Number(found.diem) } : p;
        }));
        setCsPoints(prev => prev.map(p => {
          const found = data.find(d => d.loai_ticket === p.key);
          return found ? { ...p, value: Number(found.diem) } : p;
        }));
      } else {
        // DB chưa có config cho project này → dùng default
        setDevPoints(DEFAULT_DEV_POINTS);
        setCsPoints(DEFAULT_CS_POINTS);
      }
    } catch (err) {
      console.warn('point_config fetch failed, using defaults:', err);
      setDevPoints(DEFAULT_DEV_POINTS);
      setCsPoints(DEFAULT_CS_POINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPoints(); }, [selectedProject.id]);

  const handleDevChange = (key, value) => {
    setDevPoints(prev => prev.map(p => p.key === key ? { ...p, value } : p));
    setSaveStatus(null);
  };

  const handleCsChange = (key, value) => {
    setCsPoints(prev => prev.map(p => p.key === key ? { ...p, value } : p));
    setSaveStatus(null);
  };

  const handleReset = () => {
    setDevPoints(DEFAULT_DEV_POINTS);
    setCsPoints(DEFAULT_CS_POINTS);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    if (isAllMode) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const allPoints = [...devPoints, ...csPoints];

      // Xóa config cũ của project này, rồi insert lại toàn bộ (đảm bảo sạch)
      const { error: deleteError } = await supabase
        .from('point_config')
        .delete()
        .eq('project_id', selectedProject.id);
      if (deleteError) throw deleteError;

      const insertData = allPoints.map(p => ({
        project_id: selectedProject.id,
        loai_ticket: p.key,
        bo_phan: p.bo_phan,
        diem: p.value,
      }));

      const { error: insertError } = await supabase
        .from('point_config')
        .insert(insertData);
      if (insertError) throw insertError;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Save point_config error:', err);
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
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Cấu hình giá Point</h3>
          <p className="text-sm text-slate-500 mt-0.5">Thiết lập số điểm cho từng loại công việc theo từng dự án</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={fetchPoints}
            disabled={loading || isAllMode}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleReset}
            disabled={isAllMode}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Reset mặc định
          </button>
        </div>
      </div>

      <div className="p-6">
        {isAllMode ? (
          <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-semibold flex items-center gap-2">
            <Filter size={14} />
            Chọn một dự án cụ thể để xem và chỉnh sửa cấu hình point.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <PointTable
                title="Dev"
                color="bg-blue-500"
                items={devPoints}
                onChange={handleDevChange}
                disabled={loading}
              />
              <PointTable
                title="CS"
                color="bg-violet-500"
                items={csPoints}
                onChange={handleCsChange}
                disabled={loading}
              />
            </div>

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
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-wide hover:bg-blue-600 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                Lưu cấu hình
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
