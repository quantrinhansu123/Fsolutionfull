import React from 'react';
import { cn } from '../../../lib/utils';

const STAGES = [
  { 
    key: 'done', 
    label: 'Done', 
    percent: 60,
    description: 'Đặc tả được phê duyệt'
  },
  { 
    key: 'acceptance', 
    label: 'Nghiệm thu', 
    percent: 20,
    description: 'Nghiệm thu tính năng'
  },
  { 
    key: 'golive', 
    label: 'Go-live 7d', 
    percent: 20,
    description: 'Hệ thống chạy ổn định'
  },
];

export const PaymentStages = ({ fund, completedStages = [] }) => {
  // Determine current stage index to identify "Processing" state
  let currentIdx = STAGES.findIndex(s => !completedStages.includes(s.key));
  if (currentIdx === -1) currentIdx = STAGES.length; // All completed

  return (
    <div className="w-full flex flex-col gap-1.5 py-1">
      <div className="flex w-full h-[10px] rounded-full overflow-visible bg-slate-100/50 border border-slate-100">
        {STAGES.map((stage, idx) => {
          const isCompleted = completedStages.includes(stage.key);
          const isProcessing = idx === currentIdx;
          const stageAmount = Math.round(fund * (stage.percent / 100));
          
          return (
            <div 
              key={stage.key}
              style={{ width: `${stage.percent}%` }}
              className="relative group h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
            >
              {/* Segment Bar */}
              <div 
                className={cn(
                  "w-full h-full transition-all duration-500",
                  idx !== STAGES.length - 1 && "border-r border-white/40",
                  isCompleted ? "bg-green-500" : 
                  isProcessing ? "bg-green-200 animate-pulse" : 
                  "bg-slate-100"
                )}
              />

              {/* Label inside bar (optional, only if visible, but 10px is small) */}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-[100] pointer-events-none">
                <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl min-w-[140px] border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                      {stage.label}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {stage.percent}%
                    </span>
                  </div>
                  <div className="text-[11px] font-black text-white tabular-nums mb-1">
                    {stageAmount.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-[9px] text-slate-400 leading-tight">
                    {stage.description}
                  </div>
                  {/* Status Indicator */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isCompleted ? "bg-green-500" : isProcessing ? "bg-green-400 animate-ping" : "bg-slate-500"
                    )} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">
                      {isCompleted ? 'Hoàn thành' : isProcessing ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                    </span>
                  </div>
                </div>
                {/* Tooltip Arrow */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto" />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend / Small Labels under the bar */}
      <div className="flex justify-between px-0.5">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Done (60%)</span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Nghiệm thu (20%)</span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Go-live (20%)</span>
      </div>
    </div>
  );
};
