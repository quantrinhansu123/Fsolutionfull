import { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';

const DEFAULT_DEV_POINTS = [
  { key: 'module_large', label: 'Module lớn', value: 8 },
  { key: 'module_small', label: 'Module nhỏ', value: 5 },
  { key: 'improvement', label: 'Cải tiến', value: 3 },
  { key: 'bug_large', label: 'Bug lớn', value: 2 },
  { key: 'bug_small', label: 'Bug nhỏ', value: 1 },
];

const DEFAULT_CS_POINTS = [
  { key: 'test', label: 'Test', value: 1 },
  { key: 'training', label: 'Training', value: 2 },
  { key: 'deploy', label: 'Deploy', value: 3 },
];

const PointTable = ({ title, items, onChange }) => (
  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
    <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">{title}</h4>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 min-w-[100px]">{item.label}</label>
          <input
            type="number"
            min="0"
            value={item.value}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) onChange(item.key, val);
            }}
            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-right font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <span className="text-xs text-gray-500">point</span>
        </div>
      ))}
    </div>
  </div>
);

export const PointConfig = () => {
  const [devPoints, setDevPoints] = useState(DEFAULT_DEV_POINTS);
  const [csPoints, setCsPoints] = useState(DEFAULT_CS_POINTS);

  const handleDevChange = (key, value) => {
    setDevPoints((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));
  };

  const handleCsChange = (key, value) => {
    setCsPoints((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));
  };

  const handleReset = () => {
    setDevPoints(DEFAULT_DEV_POINTS);
    setCsPoints(DEFAULT_CS_POINTS);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cấu hình giá Point</h3>
          <p className="text-sm text-gray-500 mt-1">Thiết lập giá trị point cho từng loại công việc</p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
        >
          <RotateCcw size={14} />
          Reset mặc định
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PointTable title="DEV" items={devPoints} onChange={handleDevChange} />
        <PointTable title="CS" items={csPoints} onChange={handleCsChange} />
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
          <Save size={16} />
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
};
