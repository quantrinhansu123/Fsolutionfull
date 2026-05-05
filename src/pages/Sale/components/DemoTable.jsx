import React, { useState } from 'react';
import { ExternalLink, MoreHorizontal, Edit2, Trash2, ChevronRight, Hash, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const DEMO_INCOME = 50000;

export const DemoTable = ({ demos, onEdit, onDelete }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const validDemos = demos.filter((d) => d.isValid);
  const totalIncome = validDemos.length * DEMO_INCOME;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="pl-6 pr-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">STT</th>
              <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cơ hội / Khách hàng</th>
              <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian</th>
              <th className="px-4 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tài liệu</th>
              <th className="px-4 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Hoạt động</th>
              <th className="px-4 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thu nhập</th>
              <th className="pl-4 pr-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demos.map((demo, idx) => {
              const isInvalid = !demo.isValid;
              
              return (
                <tr
                  key={demo.id}
                  className={cn(
                    "group transition-all duration-300",
                    isInvalid ? 'bg-red-50/20 hover:bg-red-50/40' : 'bg-white hover:bg-slate-50/80'
                  )}
                >
                  <td className="pl-6 pr-4 py-6">
                    <span className="text-sm font-black text-slate-400">{idx + 1}</span>
                  </td>
                  
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <p className={cn(
                        "text-sm font-black transition-all",
                        isInvalid ? 'text-slate-400 line-through' : 'text-slate-800'
                      )}>
                        {demo.opportunityName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-bold text-[11px]">
                        <User size={12} className="text-slate-300" />
                        {demo.customer}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-6">
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
                      <Calendar size={12} />
                      {demo.demoDate}
                    </div>
                  </td>

                  <td className="px-4 py-6 text-center">
                    {demo.minutesLink ? (
                      <a
                        href={demo.minutesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100/50"
                      >
                        <ExternalLink size={12} />
                        Biên bản
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-red-400">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase">Trống</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-6">
                    <div className="max-w-[200px]">
                      <p className="text-[11px] font-bold text-slate-500 line-clamp-1 italic">
                        {demo.activityLog || 'Chưa ghi nhận activity'}
                      </p>
                      {!demo.isValid && (
                        <div className="flex gap-1 mt-1">
                          {demo.missingActivity && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Thiếu Activity</span>}
                          {demo.missingMinutes && <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Thiếu Biên bản</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-6 text-right">
                    <span className={cn(
                      "text-base font-black tabular-nums tracking-tighter",
                      isInvalid ? 'text-slate-300' : 'text-emerald-600'
                    )}>
                      {formatCurrency(demo.isValid ? DEMO_INCOME : 0)}
                    </span>
                  </td>

                  <td className="pl-4 pr-8 py-6 text-center">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === demo.id ? null : demo.id)}
                        className={cn(
                          "p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all",
                          activeMenu === demo.id ? "bg-slate-100" : "hover:bg-slate-100"
                        )}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === demo.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                              onClick={() => {
                                onEdit(demo);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <Edit2 size={14} />
                                <span>Chỉnh sửa</span>
                              </div>
                              <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                            <button 
                              onClick={() => {
                                onDelete(demo.id);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors group/item"
                            >
                              <div className="flex items-center gap-2">
                                <Trash2 size={14} />
                                <span>Xóa bỏ</span>
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

      {/* Summary Card */}
      <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tổng kết Demo</p>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-black tracking-tighter">
                {validDemos.length} <span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Demo hợp lệ</span>
              </p>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Đơn giá</span>
                <span className="text-sm font-black text-emerald-400">{formatCurrency(DEMO_INCOME)} / Demo</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Thu nhập dự tính</p>
            <p className="text-5xl font-black text-white tabular-nums tracking-tighter">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
