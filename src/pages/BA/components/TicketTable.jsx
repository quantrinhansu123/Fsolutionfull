import React from 'react';
import { ExternalLink, XCircle, MoreHorizontal, Info, Edit2, Trash2 } from 'lucide-react';
import { PaymentStages } from './PaymentStages';
import { cn } from '../../../lib/utils';

const BA_RATE = 0.08;

const getTicketStatus = (ticket) => {
  if (ticket.rejected) return { label: 'REJECT', rowClass: 'bg-red-50/30', badgeClass: 'bg-red-100 text-red-700 border-red-200' };
  if (ticket.status === 'In Progress') return { label: 'ĐANG XỬ LÝ', rowClass: 'bg-slate-50/50', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
  if (ticket.status === 'Done' && !ticket.docLink) return { label: 'THIẾU TÀI LIỆU', rowClass: 'bg-orange-50/30', badgeClass: 'bg-orange-100 text-orange-700 border-orange-200' };
  if (ticket.status === 'Done' && ticket.docLink && ticket.type === 'BA') return { label: 'HỢP LỆ', rowClass: 'bg-emerald-50/30', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  return { label: 'CHỜ', rowClass: 'bg-slate-50', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
};

export const TicketTable = ({ tickets, projectFund, onEdit, onDelete }) => {
  const ticketIncome = Math.round(projectFund * BA_RATE);

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Ticket ID</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Người thực hiện</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Tên ticket</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Link tài liệu</th>
            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái</th>
            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Thu nhập dự tính</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[300px]">Tiến độ giải ngân</th>
            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => {
            const statusInfo = getTicketStatus(ticket);
            const isValid = statusInfo.label === 'HỢP LỆ';

            return (
              <tr
                key={ticket.id}
                className={cn(
                  "transition-all duration-200 hover:bg-slate-50/80",
                  statusInfo.rowClass
                )}
              >
                {/* ID */}
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-400">#{ticket.ticketId}</td>
                
                {/* Owner */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{ticket.owner.name}</p>
                    </div>
                  </div>
                </td>

                {/* Name */}
                <td className={cn(
                  "px-6 py-4 text-sm font-semibold max-w-[250px]",
                  isValid ? 'text-slate-800' : ticket.rejected ? 'text-red-400 line-through' : 'text-slate-500'
                )}>
                  {ticket.name}
                </td>

                {/* Doc Link */}
                <td className="px-6 py-4 text-sm">
                  {ticket.docLink ? (
                    <a
                      href={ticket.docLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition-all"
                    >
                      <div className="p-1 rounded bg-blue-50 group-hover:bg-blue-100">
                        <ExternalLink size={12} />
                      </div>
                      <span className="text-xs">Xem Spec</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-1.5 text-orange-400 italic">
                      <div className="p-1 rounded bg-orange-50">
                        <XCircle size={12} />
                      </div>
                      <span className="text-[11px] font-bold">Chưa có link</span>
                    </div>
                  )}
                </td>

                {/* Status & Reject Reason */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider",
                      statusInfo.badgeClass.split(' ')[1] // Chỉ lấy màu chữ (text-xxx-700)
                    )}>
                      {statusInfo.label}
                    </span>
                    {ticket.rejected && ticket.rejectReason && (
                      <div className="group relative">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 cursor-help transition-colors">
                          <Info size={12} />
                          <span>Lý do</span>
                        </div>
                        {/* Tooltip Content */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                          <p className="leading-relaxed">{ticket.rejectReason}</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Income */}
                <td className={cn(
                  "px-6 py-4 text-sm font-black text-right",
                  isValid ? 'text-emerald-700' : ticket.rejected ? 'text-red-600' : 'text-slate-400'
                )}>
                  {isValid ? ticketIncome.toLocaleString('vi-VN') : 0}đ
                </td>

                {/* Payment Stages */}
                <td className="px-6 py-4">
                  <PaymentStages fund={ticketIncome} completedStages={ticket.completedStages} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="group relative inline-block">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                    {/* Floating Actions Menu */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50 p-1">
                      <button 
                        onClick={() => onEdit(ticket)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button 
                        onClick={() => onDelete(ticket)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Xóa bỏ</span>
                      </button>
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
