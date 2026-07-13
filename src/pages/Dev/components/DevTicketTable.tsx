import { useState } from 'react';
import { XCircle, CheckCircle2, User, Hash, MoreHorizontal, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

export interface Ticket {
  id: string;          // UUID trong DB (dùng cho CRUD)
  ma_ticket: string;   // Mã task hiển thị vd "TK-4088"
  name: string;        // tieu_de
  type: string;        // label tiếng Việt (đã convert từ loai)
  point: number;       // diem
  status: string;      // trang_thai
  reopen: number;      // so_lan_reopen
  isBugByDev: boolean; // bug_do_dev
  developedBy: string; // full_name của users!phu_trach
  phu_trach: string;   // UUID của users (để edit modal)
  projectId?: string;  // project_id
  featureId?: string;  // feature_id trong schema tasks
}

interface DevTicketTableProps {
  tickets: Ticket[];
  pricePerPoint: number;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
}

export const DevTicketTable = ({ tickets, pricePerPoint, onEdit, onDelete }: DevTicketTableProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-8 border-b border-slate-100/80 bg-slate-50/30">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh sách Task Dev</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Chi tiết thực hiện và điểm thưởng theo từng task</p>
        </div>
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
            <Hash size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Không tìm thấy Task Dev nào</h3>
            <p className="text-sm text-slate-400">Dự án hiện tại chưa có task phát triển nào được khởi tạo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Danh sách Task Dev</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Chi tiết thực hiện và điểm thưởng theo từng task</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hợp lệ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bị loại</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="pl-8 pr-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mã Task</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Người thực hiện</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tên Task</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Point</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Reopen</th>
              <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Thu nhập dự tính</th>
              <th className="pl-4 pr-8 py-5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => {
              const isInvalid = ticket.reopen > 1 || ticket.isBugByDev;
              const income = isInvalid ? 0 : ticket.point * pricePerPoint;

              return (
                <tr
                  key={ticket.id}
                  className={cn(
                    'group transition-all duration-200',
                    isInvalid ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-slate-50/80'
                  )}
                >
                  <td className="pl-8 pr-4 py-5">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-slate-300" />
                      <span className="text-sm font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                        {ticket.ma_ticket}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{ticket.developedBy || 'Chưa phân công'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="max-w-[250px]">
                      <p className={cn('text-sm font-bold transition-all line-clamp-1', isInvalid ? 'text-slate-400 line-through' : 'text-slate-800')}>
                        {ticket.name}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ticket.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black bg-slate-100 text-slate-600 tabular-nums">
                      {ticket.point}pt
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{ticket.status}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        'text-sm font-black tabular-nums',
                        ticket.reopen > 1 ? 'text-red-500' : ticket.reopen > 0 ? 'text-orange-500' : 'text-slate-400'
                      )}>
                        {ticket.reopen}
                      </span>
                      {ticket.isBugByDev && (
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter mt-0.5">Bug Dev</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className={cn('text-sm font-black tabular-nums tracking-tight', isInvalid ? 'text-slate-300' : 'text-emerald-600')}>
                        {formatCurrency(income)}
                      </span>
                      {isInvalid ? (
                        <XCircle size={16} className="text-red-300" />
                      ) : (
                        <CheckCircle2 size={16} className="text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] rounded-full" />
                      )}
                    </div>
                  </td>
                  <td className="pl-4 pr-8 py-5 text-center">
                    <div className="relative inline-block">
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
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
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
                              onClick={() => { onDelete(ticket.id); setActiveMenu(null); }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <Trash2 size={14} />
                                <span>Xóa Task</span>
                              </div>
                              <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
