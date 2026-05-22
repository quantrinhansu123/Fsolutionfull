import { Info, HelpCircle } from 'lucide-react';

export const PointReference = () => {
  const references = [
    { type: 'Module lớn', point: 8, color: 'bg-blue-600' },
    { type: 'Module nhỏ', point: 5, color: 'bg-blue-400' },
    { type: 'Cải tiến', point: 3, color: 'bg-purple-500' },
    { type: 'Bug lớn', point: 2, color: 'bg-orange-500' },
    { type: 'Bug nhỏ', point: 1, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-slate-100/80 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Info size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Bảng quy đổi Point</h3>
          </div>
          <HelpCircle size={20} className="text-slate-300" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Loại ticket</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Giá trị Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {references.map((ref, index) => (
                <tr key={index} className="group hover:bg-slate-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-6 rounded-full ${ref.color}`} />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {ref.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 tabular-nums">
                      {ref.point}đ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
          * Point được tính dựa trên độ phức tạp và ảnh hưởng của tính năng.<br/>
          Số point hợp lệ sẽ được dùng để tính toán thu nhập thực nhận.
        </p>
      </div>
    </div>
  );
};
