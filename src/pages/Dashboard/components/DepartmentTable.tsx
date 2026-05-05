import React from 'react';
import { useProject } from '../../../context/ProjectContext';
import { cn } from '../../../lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

export const DepartmentTable = () => {
  const { selectedProject } = useProject();
  const fund = selectedProject.revenue * 0.6;

  const departments = [
    { name: 'Marketing', percent: 2.5, paid: 0, status: 'Đang xử lý', color: '#f43f5e' },
    { name: 'Sale', percent: 32, paid: 2000000, status: 'Hoàn thành', color: '#6366f1' },
    { name: 'BA', percent: 8, paid: 0, status: 'Chờ duyệt', color: '#f59e0b' },
    { name: 'Product', percent: 12, paid: 500000, status: 'Đang xử lý', color: '#10b981' },
    { name: 'Dev', percent: 37, paid: 1000000, status: 'Hoàn thành', color: '#3b82f6' },
    { name: 'CS', percent: 10, paid: 0, status: 'Chờ duyệt', color: '#8b5cf6' },
  ].map(dept => ({
    ...dept,
    estimated: (fund * dept.percent) / 100,
    remaining: (fund * dept.percent) / 100 - dept.paid
  }));

  const totalEstimated = departments.reduce((sum, d) => sum + d.estimated, 0);
  const totalPaid = departments.reduce((sum, d) => sum + d.paid, 0);
  const totalRemaining = departments.reduce((sum, d) => sum + d.remaining, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Phân phối thu nhập bộ phận
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Chi tiết hạn mức và giải ngân theo từng phòng ban</p>
          </div>
          <div className="hidden sm:block">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
              Quỹ: 60% Doanh thu
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-2 pb-2">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="pl-8 pr-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bộ phận</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Tỷ lệ</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Tạm tính</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Đã trả</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Còn lại</th>
              <th className="pl-4 pr-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((dept, index) => (
              <tr key={index} className="group hover:bg-slate-50/50 transition-all duration-200">
                <td className="pl-8 pr-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {dept.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5 text-sm text-slate-500 text-right font-medium">{dept.percent}%</td>
                <td className="px-4 py-5 text-sm text-slate-900 font-bold text-right tabular-nums">
                  {formatCurrency(dept.estimated)}
                </td>
                <td className="px-4 py-5 text-sm text-slate-500 text-right tabular-nums">{formatCurrency(dept.paid)}</td>
                <td className="px-4 py-5 text-right">
                  <span className="text-sm font-black text-blue-600 tabular-nums">
                    {formatCurrency(dept.remaining)}
                  </span>
                </td>
                <td className="pl-4 pr-8 py-5 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                    dept.status === 'Hoàn thành' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    dept.status === 'Đang xử lý' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    "bg-amber-50 text-amber-600 border border-amber-100"
                  )}>
                    {dept.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80 font-bold border-t border-slate-200/60">
              <td className="pl-8 pr-4 py-6 text-sm text-slate-900 uppercase tracking-wider">Tổng cộng</td>
              <td className="px-4 py-6 text-sm text-slate-900 text-right">100%</td>
              <td className="px-4 py-6 text-sm text-slate-900 text-right">{formatCurrency(totalEstimated)}</td>
              <td className="px-4 py-6 text-sm text-slate-900 text-right">{formatCurrency(totalPaid)}</td>
              <td className="px-4 py-6 text-sm text-blue-700 text-right font-black tabular-nums">{formatCurrency(totalRemaining)}</td>
              <td className="pl-4 pr-8 py-6"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
