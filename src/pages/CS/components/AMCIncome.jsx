import { useState } from 'react';

export const AMCIncome = () => {
  const [activeYear, setActiveYear] = useState('year1');

  const amcData = {
    revenue: 1000000,
    csRatio: 0.4,
    income: 400000,
  };

  const years = ['year1', 'year2', 'year3'];
  const yearLabels = { year1: 'Năm 1', year2: 'Năm 2', year3: 'Năm 3' };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Doanh thu AMC</h3>

      <div className="space-y-4">
        {/* Revenue */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Doanh thu AMC:</span>
          <span className="text-lg font-semibold text-gray-900">
            {amcData.revenue.toLocaleString('vi-VN')}đ/năm
          </span>
        </div>

        {/* CS Ratio */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Tỷ lệ CS:</span>
          <span className="text-lg font-semibold text-gray-900">{(amcData.csRatio * 100).toFixed(0)}%</span>
        </div>

        {/* CS Income */}
        <div className="flex justify-between items-center py-3 bg-emerald-50 px-3 rounded-lg border border-emerald-200">
          <span className="text-sm font-medium text-gray-700">Thu nhập từ AMC:</span>
          <span className="text-2xl font-bold text-emerald-600">
            {amcData.income.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Year Tabs */}
      <div className="mt-6 flex gap-2 border-t border-gray-200 pt-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activeYear === year
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {yearLabels[year]}
          </button>
        ))}
      </div>
    </div>
  );
};
