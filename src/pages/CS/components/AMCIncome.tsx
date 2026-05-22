import { useState } from 'react';
import { Calendar, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AMCIncomeProps {
  amcTotal: number;
}

export const AMCIncome = ({ amcTotal = 0 }: AMCIncomeProps) => {
  const [activeYear, setActiveYear] = useState('year1');

  // CS policy: only Year 1 is eligible; Year 2+ goes to Sale only
  const csRatio = 0.4;
  const isEligible = activeYear === 'year1';
  const income = isEligible ? Math.round(amcTotal * csRatio) : 0;

  const years = [
    { id: 'year1', label: 'Năm 1' },
    { id: 'year2', label: 'Năm 2' },
    { id: 'year3', label: 'Năm 3' },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-sm">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Doanh thu AMC</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Annual Maintenance Contract</p>
          </div>
        </div>
        <div className="hidden sm:flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
          {years.map((year) => (
            <button
              key={year.id}
              onClick={() => setActiveYear(year.id)}
              className={cn(
                'px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300',
                activeYear === year.id
                  ? 'bg-white text-blue-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {year.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tổng AMC</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">{formatCurrency(amcTotal)}</p>
                {amcTotal === 0 && (
                  <p className="text-[10px] text-slate-400 italic mt-1">Chưa nhập dữ liệu</p>
                )}
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tỷ lệ CS</p>
                <p className="text-xl font-black text-blue-600 tracking-tighter">40.0%</p>
              </div>
            </div>

            {/* Mobile year tab */}
            <div className="sm:hidden flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
              {years.map((year) => (
                <button
                  key={year.id}
                  onClick={() => setActiveYear(year.id)}
                  className={cn(
                    'flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
                    activeYear === year.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {year.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <Info size={16} className="text-blue-600 shrink-0" />
              <p className="text-xs font-bold text-blue-700/80 leading-relaxed italic">
                * Thu nhập AMC của CS được tính 40% từ giá trị hợp đồng AMC năm đầu tiên. Từ năm 2 trở đi chỉ Sale nhận.
              </p>
            </div>
          </div>

          {/* Right: Result Card */}
          <div className="relative">
            <div className={cn(
              'p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden group',
              isEligible
                ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-slate-900/20'
                : 'bg-slate-50 border-slate-200 grayscale'
            )}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Thu nhập CS dự tính</p>
                    <h4 className="text-white text-xl font-black">Quyết toán AMC</h4>
                  </div>
                  <div className={cn(
                    'p-3 rounded-2xl',
                    isEligible ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  )}>
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className={cn(
                    'text-4xl sm:text-5xl font-black tracking-tighter tabular-nums',
                    isEligible ? 'text-emerald-400' : 'text-slate-400'
                  )}>
                    {formatCurrency(income)}
                  </p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {activeYear === 'year1' ? 'Hợp lệ thanh toán' : 'Không thuộc phạm vi CS'}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Trạng thái: {isEligible ? 'HOẠT ĐỘNG' : 'KHÓA'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {amcTotal > 0 ? 'Dữ liệu thật' : 'Chờ nhập AMC'}
                  </span>
                </div>
              </div>
            </div>

            {!isEligible && (
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-white/10 backdrop-blur-[2px] rounded-[2.5rem] animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 text-center max-w-[240px] transform -rotate-1">
                  <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
                  <p className="text-xs font-black text-slate-900 leading-relaxed uppercase tracking-tighter">
                    Chính sách 2026: Từ năm thứ 2 AMC chỉ áp dụng cho bộ phận Sale.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
