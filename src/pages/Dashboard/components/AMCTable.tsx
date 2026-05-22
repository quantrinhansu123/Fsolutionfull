import { useProject } from '../../../context/ProjectContext';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(value);
};

export const AMCTable = () => {
  const { selectedProject } = useProject();
  const amc = selectedProject.amc;

  const amcData = [
    { role: 'Sale', percent: 10, y1: amc * 0.1, y2: 0, color: '#6366f1' },
    { role: 'Account', percent: 20, y1: amc * 0.2, y2: amc * 0.2, color: '#3b82f6' },
    { role: 'Technical Support', percent: 50, y1: amc * 0.5, y2: amc * 0.5, color: '#0ea5e9' },
    { role: 'Company Profit', percent: 20, y1: amc * 0.2, y2: amc * 0.2, color: '#10b981' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)]">
      {/* Header Section */}
      <div className="relative p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Phân phối doanh thu vận hành AMC
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm text-slate-500 font-medium">Từ năm 2: Sale không nhận chiết khấu</p>
            </div>
          </div>
          
          <div className="bg-slate-50/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/50 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Tổng doanh thu AMC</p>
            <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
              {formatCurrency(amc)}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-2 pb-2">
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/30">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100/50">
                <th className="pl-8 pr-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cơ cấu vai trò</th>
                <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Tỷ trọng</th>
                <th className="px-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Lợi nhuận Năm 1</th>
                <th className="pl-4 pr-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Duy trì Năm 2+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amcData.map((row, index) => (
                <tr key={index} className="group hover:bg-white transition-all duration-200">
                  <td className="pl-8 pr-4 py-5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1.5 h-6 rounded-full" 
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {row.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      {row.percent}%
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {formatCurrency(row.y1)}
                    </span>
                  </td>
                  <td className="pl-4 pr-8 py-5 text-right">
                    {row.y2 === 0 ? (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Kết thúc</span>
                    ) : (
                      <span className="text-sm font-black text-blue-600/80 tabular-nums">
                        {formatCurrency(row.y2)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer / Tip */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 italic text-center">
          * Các số liệu trên được tính toán dựa trên hợp đồng vận hành AMC hiện tại.
        </p>
      </div>
    </div>
  );
};
