import { useState } from 'react';
import { Save, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DEFAULT_RATES = [
  { key: 'marketing', label: 'Marketing', value: 2.5 },
  { key: 'sale', label: 'Sale', value: 32 },
  { key: 'ba', label: 'BA', value: 8 },
  { key: 'product', label: 'Product', value: 12 },
  { key: 'dev', label: 'Dev', value: 37 },
  { key: 'cs', label: 'CS', value: 10 },
];

export const RateConfig = () => {
  const [rates, setRates] = useState(DEFAULT_RATES);

  const total = rates.reduce((sum, r) => sum + r.value, 0);
  const diff = Math.abs(total - 100).toFixed(1);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleChange = (key, newValue) => {
    const val = parseFloat(newValue);
    if (isNaN(val) || val < 0 || val > 100) return;
    setRates((prev) => prev.map((r) => (r.key === key ? { ...r, value: val } : r)));
  };

  const statusBadge = isValid ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      <CheckCircle size={14} />
      Hợp lệ ✓
    </span>
  ) : total < 100 ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
      <AlertTriangle size={14} />
      Còn thiếu {diff}%
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
      <XCircle size={14} />
      Vượt quá {diff}%
    </span>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ chia quỹ</h3>
          <p className="text-sm text-gray-500 mt-1">Cấu hình tỷ lệ % thu nhập cho từng bộ phận</p>
        </div>
        {statusBadge}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rates.map((rate) => (
          <div key={rate.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-sm font-medium text-gray-700 min-w-[80px]">{rate.label}</label>
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rate.value}
                onChange={(e) => handleChange(rate.key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-sm text-gray-500 font-medium">%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">Tổng tỷ lệ</span>
          <span className={`text-sm font-bold ${isValid ? 'text-green-700' : total < 100 ? 'text-orange-600' : 'text-red-600'}`}>
            {total.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isValid ? 'bg-green-500' : total < 100 ? 'bg-orange-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(total, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={!isValid}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={16} />
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
};
