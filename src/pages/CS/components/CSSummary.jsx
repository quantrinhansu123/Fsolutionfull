import React from 'react';
import { Wallet, TrendingUp, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const CSSummary = ({ tickets }) => {
  const pointConfig = {
    test: 1,
    training: 2,
    deploy: 3,
  };

  // Calculate income from tickets (only confirmed and no error)
  const ticketIncome = tickets
    .filter((ticket) => !ticket.hasError && ticket.customerConfirmed)
    .reduce((sum, ticket) => {
      const points = pointConfig[ticket.type] || 0;
      return sum + points * 100000;
    }, 0);

  // Default AMC for display (Assuming Year 1)
  const amcIncome = 480000;
  const totalIncome = ticketIncome + amcIncome;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tổng hợp thu nhập CS</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Báo cáo thu nhập CS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-[0.1em] shadow-sm">
            Chính sách 2026-2027
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Ticket Income */}
          <div className="relative group p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] transition-all hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <TrendingUp size={20} />
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thu nhập Ticket</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(ticketIncome)}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase">Hợp lệ</span>
              <p className="text-[10px] font-bold text-slate-400 italic">Σ (point) × 100k</p>
            </div>
          </div>

          {/* AMC Income */}
          <div className="relative group p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] transition-all hover:bg-white hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <Calendar size={20} />
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thu nhập AMC (Y1)</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(amcIncome)}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 uppercase">Vận hành</span>
              <p className="text-[10px] font-bold text-slate-400 italic">40% tỷ lệ CS</p>
            </div>
          </div>

          {/* Total */}
          <div className="relative group p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:bg-emerald-400 transition-all duration-500">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng thực nhận dự tính</p>
              <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{formatCurrency(totalIncome)}</p>
              <div className="mt-6 flex flex-col gap-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sẵn sàng thanh toán</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Dự kiến: 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
