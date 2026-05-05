import { useState } from 'react';

export const MarketingSummary = ({ leads }) => {
  const [showReason, setShowReason] = useState(false);

  const totalSubmitted = leads.length;
  const qualified = leads.filter((lead) => lead.status === 'qualified').length;
  const disqualified = totalSubmitted - qualified;
  const totalIncome = qualified * 30000;

  const disqualifiedReasons = leads
    .filter((lead) => lead.status !== 'qualified')
    .map((lead) => ({
      name: lead.name,
      warnings: lead.warnings || [],
    }));

  return (
    <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng kết</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Submitted */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Tổng lead submitted</p>
          <p className="text-3xl font-bold text-blue-600">{totalSubmitted}</p>
        </div>

        {/* Qualified */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Lead qualified (hợp lệ)</p>
          <p className="text-3xl font-bold text-green-600">{qualified}</p>
        </div>

        {/* Disqualified */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Lead bị loại</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-red-600">{disqualified}</p>
            {disqualified > 0 && (
              <button
                onClick={() => setShowReason(!showReason)}
                className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300"
              >
                {showReason ? 'Ẩn' : 'Xem'} lý do
              </button>
            )}
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-300">
          <p className="text-sm text-gray-600 mb-1">Công thức tính</p>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {qualified} × 30.000 = <span className="font-semibold">{(qualified * 30000).toLocaleString('vi-VN')}</span> đ
          </p>
          <div className="pt-2 border-t border-emerald-300">
            <p className="text-xs text-gray-600">Tổng thu nhập</p>
            <p className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </div>

      {/* Disqualified Reasons */}
      {showReason && disqualified > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-3">Lý do các lead bị loại:</h3>
          <ul className="space-y-2">
            {disqualifiedReasons.map((item, idx) => (
              <li key={idx} className="text-sm text-red-800">
                <span className="font-medium">{idx + 1}. {item.name}:</span>
                {item.warnings.length > 0 ? (
                  <div className="ml-4 mt-1 text-xs space-y-1">
                    {item.warnings.map((warning, wIdx) => {
                      const warningText = {
                        missing_phone: 'Thiếu số điện thoại',
                        missing_image: 'Thiếu ảnh nhu cầu',
                        duplicate: 'Lead trùng',
                        missing_source: 'Thiếu source_id',
                      };
                      return (
                        <div key={wIdx} className="text-red-700">
                          • {warningText[warning] || warning}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ml-4 text-xs text-red-700">• Không đủ điều kiện</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
