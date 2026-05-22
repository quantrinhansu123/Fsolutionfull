import React from 'react';
import { Wallet, TrendingUp, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react';

const STAGES_PERCENT = { done: 60, acceptance: 20, golive: 20 };

export const CSSummary = ({ tickets = [], csRate = 0, amcTotal = 0 }) => {
  // Valid CS tickets: customer confirmed AND no error
  const validTickets = tickets.filter(
    (t) => t.khach_xac_nhan && !t.loi_sau_trien_khai
  );

  // Total ticket income = sum of (project pricing * csRate%) for valid tickets only
  const ticketIncome = validTickets.reduce((sum, t) => {
    const projPricing = Number(t.projects?.pricing) || 0;
    return sum + Math.round(projPricing * (csRate / 100));
  }, 0);

  // AMC CS income = 40% of total AMC (Year 1 policy)
  const amcCsIncome = Math.round(amcTotal * 0.4);

  const totalIncome = ticketIncome + amcCsIncome;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);

  // Paid amount based on completed payment stages
  const paidAmount = validTickets.reduce((sum, t) => {
    const projPricing = Number(t.projects?.pricing) || 0;
    const income = Math.round(projPricing * (csRate / 100));

    const completedStages = (t.ticket_payment_stages || [])
      .filter(s => s.da_tra)
      .map(s => s.giai_doan);

    const stagePercent = completedStages.reduce((acc, stage) => {
      return acc + (STAGES_PERCENT[stage] || 0);
    }, 0);

    return sum + Math.round(income * (stagePercent / 100));
  }, 0);

  const remaining = ticketIncome - paidAmount;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tổng hợp thu nhập CS</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Báo cáo thu nhập Customer Success</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-[0.1em] shadow-sm">
            Chính sách 2026–2027
          </span>
        </div>
      </div>

      {/* Info row: cs rate */}
      <div className="px-8 pt-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quy tắc phân bổ thu nhập CS</p>
            <p className="text-sm font-semibold text-slate-600">
              Ticket CS hợp lệ nhận{' '}
              <span className="text-blue-600 font-extrabold">{csRate || 0}%</span>{' '}
              từ doanh thu dự án tương ứng.
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 px-4 bg-white border border-slate-200 rounded-lg shadow-xs self-start md:self-auto">
            <span className="text-xs text-slate-500 font-bold">Ticket hợp lệ:</span>
            <span className="font-extrabold text-sm text-emerald-700">{validTickets.length}</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Ticket Income */}
          <div className="relative group p-6 bg-slate-50 border border-slate-100 rounded-[2rem] transition-all hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <TrendingUp size={18} />
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thu nhập Ticket</p>
            <p className="text-xl font-black text-slate-900 tabular-nums">{formatCurrency(ticketIncome)}</p>
            <p className="text-[10px] font-bold text-slate-400 italic mt-2">Tính theo doanh thu dự án</p>
          </div>

          {/* AMC Income — amber instead of purple (Purple Ban) */}
          <div className="relative group p-6 bg-slate-50 border border-slate-100 rounded-[2rem] transition-all hover:bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                <Calendar size={18} />
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thu nhập AMC (Y1)</p>
            <p className="text-xl font-black text-slate-900 tabular-nums">{formatCurrency(amcCsIncome)}</p>
            <p className="text-[10px] font-bold text-slate-400 italic mt-2">40% tỷ lệ CS từ AMC</p>
          </div>

          {/* Paid */}
          <div className="relative group p-6 bg-emerald-50/60 border border-emerald-100 rounded-[2rem] transition-all hover:bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <ShieldCheck size={18} />
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đã nhận thực tế</p>
            <p className="text-xl font-black text-emerald-700 tabular-nums">{formatCurrency(paidAmount)}</p>
            <p className="text-[10px] font-bold text-slate-400 italic mt-2">Dựa trên chặng giải ngân</p>
          </div>

          {/* Total / Remaining */}
          <div className="relative group p-6 bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:bg-emerald-400 transition-all duration-500">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng dự tính</p>
              <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{formatCurrency(totalIncome)}</p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-700"
                    style={{ width: totalIncome > 0 ? `${Math.min((paidAmount / totalIncome) * 100, 100)}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    {totalIncome > 0 ? `${Math.round((paidAmount / totalIncome) * 100)}% đã nhận` : 'Chưa có dữ liệu'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Còn lại: {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
