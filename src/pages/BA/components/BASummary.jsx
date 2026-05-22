import React from 'react';

const BA_RATE = 0.08;

export const BASummary = ({ projectFund, tickets = [] }) => {
  // Lọc các ticket BA hợp lệ (Done, có tài liệu)
  const validTickets = tickets.filter(
    (t) => t.trang_thai === 'done' && t.tai_lieu_url && t.bo_phan === 'ba'
  );

  // Tính tổng thu nhập dự tính dựa vào pricing của từng dự án tương ứng của ticket
  const totalIncome = validTickets.reduce((sum, t) => {
    const projRevenue = Number(t.projects?.pricing) || projectFund;
    const ticketIncome = Math.round(projRevenue * BA_RATE);
    return sum + ticketIncome;
  }, 0);

  // Tính toán số tiền đã nhận dựa trên các giai đoạn thanh toán đã trả (da_tra = true)
  const paidAmount = tickets.reduce((sum, t) => {
    // Chỉ tính cho ticket hợp lệ (Done, có tài liệu)
    if (t.trang_thai === 'done' && t.tai_lieu_url && t.bo_phan === 'ba') {
      const projRevenue = Number(t.projects?.pricing) || projectFund;
      const ticketIncome = Math.round(projRevenue * BA_RATE);

      const completedStages = (t.ticket_payment_stages || [])
        .filter(stage => stage.da_tra)
        .map(stage => stage.giai_doan);

      const stagePercent = completedStages.reduce((acc, stage) => {
        if (stage === 'done') return acc + 60;
        if (stage === 'acceptance' || stage === 'nghiem_thu') return acc + 20;
        if (stage === 'golive') return acc + 20;
        return acc;
      }, 0);

      return sum + Math.round(ticketIncome * (stagePercent / 100));
    }
    return sum;
  }, 0);

  const remaining = totalIncome - paidAmount;

  // Tính trung bình giá trị 1 ticket
  const averageTicketIncome = Math.round(projectFund * BA_RATE);

  return (
    <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
      <h2 className="text-base font-bold text-slate-800 mb-4">Tổng kết tài chính bộ phận BA/SA</h2>

      {/* Formula & Policy Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quy tắc phân bổ & tính quỹ BA</p>
          <p className="text-sm font-semibold text-slate-600">
            Mỗi ticket BA hợp lệ nhận <span className="text-blue-600 font-extrabold">8%</span> từ ngân quỹ của dự án tương ứng.
          </p>
        </div>
        <div className="flex items-center gap-2 p-2 px-4 bg-white border border-slate-200 rounded-lg shadow-xs self-start md:self-auto">
          <span className="text-xs text-slate-500 font-bold">Thu nhập chuẩn (Dự án hiện tại):</span>
          <span className="font-extrabold text-sm text-emerald-700">{averageTicketIncome.toLocaleString('vi-VN')}đ</span>
          <span className="text-[10px] font-bold text-slate-400">/ ticket</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ticket hợp lệ</p>
          <div className="mt-2">
            <p className="text-3xl font-black text-blue-600 tabular-nums">{validTickets.length}</p>
            <p className="text-[10px] text-blue-400 font-semibold leading-none mt-1">Đã được phê duyệt & duyệt Spec</p>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tổng thu nhập BA</p>
          <div className="mt-2">
            <p className="text-2xl font-black text-emerald-700 tabular-nums">{totalIncome.toLocaleString('vi-VN')}đ</p>
            <p className="text-[10px] text-emerald-500 font-semibold leading-none mt-1">Tính theo doanh thu từng dự án</p>
          </div>
        </div>

        <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Đã nhận thực tế</p>
          <div className="mt-2">
            <p className="text-2xl font-black text-green-700 tabular-nums">{paidAmount.toLocaleString('vi-VN')}đ</p>
            <p className="text-[10px] text-green-500 font-semibold leading-none mt-1">Dựa trên chặng thanh toán thực tế</p>
          </div>
        </div>

        <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-100 flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Còn lại giải ngân</p>
          <div className="mt-2">
            <p className="text-2xl font-black text-orange-700 tabular-nums">{remaining.toLocaleString('vi-VN')}đ</p>
            <p className="text-[10px] text-orange-500 font-semibold leading-none mt-1">Chờ bàn giao, nghiệm thu & Go-live</p>
          </div>
        </div>
      </div>
    </div>
  );
};
