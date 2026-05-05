import React from 'react';
import { useProject } from '../../../context/ProjectContext';
import { Calculator, Wallet } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

interface DevSummaryProps {
  totalValidPoints: number;
  totalStandardPoints: number;
}

export const DevSummary = ({ totalValidPoints, totalStandardPoints }: DevSummaryProps) => {
  const { selectedProject } = useProject();
  const projectFund = selectedProject.revenue * 0.6;
  const devFund = projectFund * 0.37;
  
  // Price per point calculation
  const pricePerPoint = totalStandardPoints > 0 ? devFund / totalStandardPoints : 0;
  const totalIncome = totalValidPoints * pricePerPoint;

  const progress = [
    { label: 'Done', value: 60, color: '#10b981' },
    { label: 'Nghiệm thu', value: 20, color: '#3b82f6' },
    { label: 'Go-live', value: 20, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Calculator size={20} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Tổng hợp thu nhập Dev</h3>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        {/* Financials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng point hợp lệ</p>
            <p className="text-2xl font-black text-slate-800 tabular-nums">{totalValidPoints} <span className="text-sm font-bold text-slate-400">POINT</span></p>
          </div>
          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Quỹ Dev (37%)</p>
            <p className="text-2xl font-black text-blue-700 tabular-nums">{formatCurrency(devFund)}</p>
          </div>
        </div>

        {/* Calculation Logic */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={80} />
          </div>
          <div className="relative">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cách tính thực nhận</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Giá trị mỗi Point:</span>
                <span className="font-bold text-blue-400 tabular-nums">{formatCurrency(pricePerPoint)}/pt</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-400 font-medium">Thực nhận:</span>
                <span className="text-3xl font-black text-emerald-400 tabular-nums tracking-tighter">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ giai đoạn</p>
            <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">TIÊU CHUẨN</span>
          </div>
          
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
            {progress.map((p, i) => (
              <div 
                key={i} 
                style={{ width: `${p.value}%`, backgroundColor: p.color }} 
                className="transition-all duration-500 hover:brightness-110"
                title={`${p.label}: ${p.value}%`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {progress.map((p, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{p.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 pl-3.5">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
