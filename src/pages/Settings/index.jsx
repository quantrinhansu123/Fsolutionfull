import { RateConfig } from './components/RateConfig';
import { PointConfig } from './components/PointConfig';
import { ViolationLog } from './components/ViolationLog';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">Cấu hình</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Cấu hình tỷ lệ, giá point và quản lý vi phạm</p>
      </div>

      <RateConfig />
      <PointConfig />
      <ViolationLog />
    </div>
  );
}
