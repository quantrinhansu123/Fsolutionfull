import { RateConfig } from './components/RateConfig';
import { PointConfig } from './components/PointConfig';
import { ViolationLog } from './components/ViolationLog';
import { Settings2, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shadow-slate-900/20">
            <Settings2 size={32} />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cấu hình hệ thống</h2>
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">System Configuration</p>
        </div>
      </div>

      {/* Tỷ lệ chia quỹ */}
      <RateConfig />

      {/* Cấu hình giá point */}
      <PointConfig />

      {/* Log vi phạm */}
      <ViolationLog />
    </div>
  );
}
