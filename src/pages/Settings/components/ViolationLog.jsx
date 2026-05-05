import { useState } from 'react';
import { Download, Filter } from 'lucide-react';

const PENALTY_CONFIG = {
  no_pay: { text: 'Không tính tiền', color: 'bg-yellow-100 text-yellow-800' },
  deduct_100: { text: 'Trừ 100%', color: 'bg-orange-100 text-orange-800' },
  terminate: { text: 'Dừng hợp tác', color: 'bg-red-100 text-red-800' },
};

const MOCK_VIOLATIONS = [
  {
    id: 1,
    time: '25/04/2026 14:30',
    department: 'Dev',
    person: 'Nguyễn Văn X',
    type: 'Sai dữ liệu ticket',
    penalty: 'no_pay',
    action: 'Đã xác nhận, không tính thu nhập ticket TK-104',
  },
  {
    id: 2,
    time: '20/04/2026 09:15',
    department: 'Marketing',
    person: 'Trần Thị Y',
    type: 'Lead trùng',
    penalty: 'no_pay',
    action: 'Lead bị loại, không tính thu nhập',
  },
  {
    id: 3,
    time: '12/04/2026 16:45',
    department: 'Sale',
    person: 'Lê Hoàng Z',
    type: 'Gian lận hợp đồng',
    penalty: 'deduct_100',
    action: 'Trừ 100% thu nhập HĐ HD-2026-005 + Dừng hợp tác',
  },
];

const DEPARTMENTS = ['Tất cả', 'Dev', 'Marketing', 'Sale', 'BA', 'CS', 'Product'];
const VIOLATION_TYPES = ['Tất cả', 'Sai dữ liệu ticket', 'Lead trùng', 'Gian lận hợp đồng'];
const MONTHS = ['Tất cả', '04/2026', '03/2026', '02/2026'];

export const ViolationLog = () => {
  const [filterDept, setFilterDept] = useState('Tất cả');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('Tất cả');

  const filtered = MOCK_VIOLATIONS.filter((v) => {
    if (filterDept !== 'Tất cả' && v.department !== filterDept) return false;
    if (filterType !== 'Tất cả' && v.type !== filterType) return false;
    if (filterMonth !== 'Tất cả' && !v.time.includes(filterMonth.replace('Tất cả', ''))) return false;
    return true;
  });

  const handleExport = () => {
    const headers = 'Thời gian,Bộ phận,Người,Loại vi phạm,Mức phạt,Xử lý';
    const rows = filtered.map((v) =>
      `${v.time},${v.department},${v.person},${v.type},${PENALTY_CONFIG[v.penalty].text},${v.action}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'violation_log.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Log vi phạm</h3>
          <p className="text-sm text-gray-500 mt-1">Lịch sử vi phạm và xử lý</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
        >
          <Download size={14} />
          Xuất báo cáo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
        >
          {VIOLATION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600"
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bộ phận</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại vi phạm</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Mức phạt</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Không có vi phạm nào phù hợp bộ lọc
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const penalty = PENALTY_CONFIG[v.penalty];
                return (
                  <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{v.time}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{v.person}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{v.type}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${penalty.color}`}>
                        {penalty.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.action}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
