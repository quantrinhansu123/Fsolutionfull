import React, { useState } from 'react';
import {
  Info,
  History,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Hash,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const STAGES = [
  { key: 'done', label: 'Done', percent: 60 },
  { key: 'acceptance', label: 'Nghiệm thu', percent: 20 },
  { key: 'golive', label: 'Go-live 7d', percent: 20 },
];

const TYPE_CONFIG = {
  test:        { label: 'Cấu hình', textColor: 'text-slate-600' },
  training:    { label: 'Đào tạo',  textColor: 'text-blue-700'  },
  deploy:      { label: 'Triển khai', textColor: 'text-orange-700' },
  cs_test:     { label: 'Cấu hình', textColor: 'text-slate-600' },
  cs_training: { label: 'Đào tạo',  textColor: 'text-blue-700'  },
  cs_deploy:   { label: 'Triển khai', textColor: 'text-orange-700' },
};

export const CSTicketTable = ({ tickets, csRate, onEdit, onDelete }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
          <Info size={32} />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="font-bold text-slate-800 text-base">Chưa có ticket CS nào</h3>
          <p className="text-sm text-slate-400">
            Dự án này chưa có công việc CS/Triển khai nào được ghi nhận.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="pl-8 pr-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket ID</th>
            <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Người thực hiện</th>
            <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên công việc</th>
            <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại</th>
            <th className="px-4 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Xác nhận</th>
            <th className="px-4 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thanh toán</th>
            <th className="px-4 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thu nhập</th>
            <th className="pl-4 pr-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => {
            const customerConfirmed = ticket.khach_xac_nhan;
            const hasError = ticket.loi_sau_trien_khai;
            const isInvalid = !customerConfirmed || hasError;

            // Income = project pricing * CS rate %
            const projPricing = Number(ticket.projects?.pricing) || 0;
            const income = isInvalid ? 0 : Math.round(projPricing * (csRate / 100));

            const typeConf = TYPE_CONFIG[ticket.loai] || TYPE_CONFIG['test'];

            // Payment stages from ticket_payment_stages join
            const completedStages = (ticket.ticket_payment_stages || [])
              .filter(s => s.da_tra)
              .map(s => s.giai_doan);

            return (
              <tr
                key={ticket.id}
                className={cn(
                  'group transition-all duration-300',
                  isInvalid ? 'bg-red-50/20 hover:bg-red-50/40' : 'bg-white hover:bg-slate-50/80'
                )}
              >
                {/* Ticket ID */}
                <td className="pl-8 pr-4 py-6">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-slate-300" />
                    <span className="text-sm font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                      {ticket.ma_ticket}
                    </span>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-4 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                      {ticket.users?.full_name
                        ? ticket.users.full_name.charAt(0).toUpperCase()
                        : <User size={12} />}
                    </div>
                    <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {ticket.users?.full_name || 'Chưa phân công'}
                    </p>
                  </div>
                </td>

                {/* Task name + project */}
                <td className="px-4 py-6">
                  <div className="max-w-[280px]">
                    <p className={cn(
                      'text-sm font-bold leading-relaxed transition-all',
                      isInvalid ? 'text-slate-400 line-through' : 'text-slate-800'
                    )}>
                      {ticket.tieu_de}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase truncate mt-0.5">
                      {ticket.projects?.name || 'Dự án không tên'}
                    </p>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-6">
                  <span className={cn(
                    'text-[10px] font-black uppercase tracking-widest inline-block',
                    typeConf.textColor
                  )}>
                    {typeConf.label}
                  </span>
                </td>

                {/* Confirmation status */}
                <td className="px-4 py-6">
                  <div className="flex flex-col items-center gap-1.5">
                    {customerConfirmed ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-black tracking-tight">XÁC NHẬN</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock size={12} />
                        <span className="text-[10px] font-black tracking-tight">CHỜ DUYỆT</span>
                      </div>
                    )}
                    {hasError && (
                      <div className="flex items-center gap-1 text-red-600 animate-pulse">
                        <XCircle size={12} />
                        <span className="text-[10px] font-black tracking-tight uppercase">CÓ LỖI</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Payment Stages progress bar */}
                <td className="px-6 py-4 min-w-[280px]">
                  <div className="w-full flex flex-col gap-1.5 py-1">
                    <div className="flex w-full h-[10px] rounded-full overflow-hidden bg-slate-100/50 border border-slate-100">
                      {STAGES.map((stage, idx) => {
                        const isDone = completedStages.includes(stage.key);
                        const currentIdx = STAGES.findIndex(s => !completedStages.includes(s.key));
                        const isProcessing = idx === currentIdx;
                        return (
                          <div
                            key={stage.key}
                            style={{ width: `${stage.percent}%` }}
                            className={cn(
                              'relative group/stage h-full transition-all duration-500 border-r border-white/40 last:border-0',
                              isDone
                                ? 'bg-emerald-500'
                                : isProcessing
                                  ? 'bg-emerald-200 animate-pulse'
                                  : 'bg-slate-100'
                            )}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/stage:opacity-100 invisible group-hover/stage:visible transition-all duration-200 z-[100] pointer-events-none">
                              <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl min-w-[140px] border border-white/10 text-center">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    {stage.label}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400">{stage.percent}%</span>
                                </div>
                                <div className="text-[11px] font-black text-white tabular-nums">
                                  {formatCurrency(income * (stage.percent / 100))}
                                </div>
                                <div className="mt-2 flex items-center justify-center gap-1.5">
                                  <div className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    isDone ? 'bg-emerald-500' : isProcessing ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                                  )} />
                                  <span className="text-[8px] font-bold uppercase tracking-tighter">
                                    {isDone ? 'Hoàn thành' : isProcessing ? 'Đang thực hiện' : 'Chờ'}
                                  </span>
                                </div>
                              </div>
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-0.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Done (60%)</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Nghiệm thu (20%)</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Go-live (20%)</span>
                    </div>
                  </div>
                </td>

                {/* Income */}
                <td className="px-4 py-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      'text-base font-black tabular-nums tracking-tighter',
                      isInvalid ? 'text-slate-300' : 'text-emerald-600'
                    )}>
                      {formatCurrency(income)}
                    </span>
                    {!isInvalid && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dự tính</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="pl-4 pr-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem lịch sử">
                      <History size={18} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === ticket.id ? null : ticket.id)}
                        className={cn(
                          'p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all',
                          activeMenu === ticket.id ? 'bg-slate-100' : 'hover:bg-slate-100'
                        )}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === ticket.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => { onEdit(ticket); setActiveMenu(null); }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <Edit2 size={14} />
                                <span>Chỉnh sửa</span>
                              </div>
                              <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                            <button
                              onClick={() => { onDelete(ticket); setActiveMenu(null); }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <Trash2 size={14} />
                                <span>Xóa Ticket</span>
                              </div>
                              <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
