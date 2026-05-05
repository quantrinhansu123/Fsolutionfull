const BA_RATE = 0.08;

export const BASummary = ({ projectFund, tickets }) => {
  const ticketIncome = Math.round(projectFund * BA_RATE);
  const validTickets = tickets.filter((t) => t.status === 'Done' && t.docLink && t.type === 'BA' && !t.rejected);
  const totalIncome = validTickets.length * ticketIncome;

  // Calculate paid amount based on completed stages
  const paidAmount = tickets.reduce((sum, t) => {
    if (t.status === 'Done' && t.docLink && t.type === 'BA' && !t.rejected) {
      const stagePercent = t.completedStages.reduce((acc, stage) => {
        if (stage === 'done') return acc + 60;
        if (stage === 'acceptance') return acc + 20;
        if (stage === 'golive') return acc + 20;
        return acc;
      }, 0);
      return sum + Math.round(ticketIncome * (stagePercent / 100));
    }
    return sum;
  }, 0);

  const remaining = totalIncome - paidAmount;

  return (
    <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng kết BA</h2>

      {/* Formula */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-2">Công thức tính thu nhập BA</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Quỹ dự án:</span>
            <span className="font-bold text-gray-900">{projectFund.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">× 8% (tỷ lệ BA)</span>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-300 pt-1 mt-1">
            <span className="text-gray-700">=</span>
            <span className="font-bold text-emerald-700">{ticketIncome.toLocaleString('vi-VN')}đ</span>
            <span className="text-gray-500">/ticket hợp lệ</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Ticket hợp lệ</p>
          <p className="text-2xl font-bold text-blue-600">{validTickets.length}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-gray-600 mb-1">Tổng thu nhập BA</p>
          <p className="text-sm font-medium text-gray-700 mb-1">{validTickets.length} × {ticketIncome.toLocaleString('vi-VN')}đ</p>
          <p className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Đã nhận</p>
          <p className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Còn lại</p>
          <p className="text-2xl font-bold text-orange-600">{remaining.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>
    </div>
  );
};
