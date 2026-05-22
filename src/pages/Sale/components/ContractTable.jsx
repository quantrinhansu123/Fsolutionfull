import { ExternalLink, AlertTriangle } from 'lucide-react';
import { PaymentProgressBar } from './PaymentProgressBar';

const SALE_PERCENT = 0.31;

export const ContractTable = ({ contracts }) => {
  const signedContracts = contracts.filter((c) => c.status === 'signed' || c.status === 'paid');
  const totalRevenue = signedContracts.reduce((sum, c) => sum + c.contractAmount, 0);
  const totalSaleIncome = signedContracts.reduce((sum, c) => sum + Math.round(c.fund * SALE_PERCENT), 0);
  const totalPaid = contracts.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalOwed = totalSaleIncome - totalPaid;

  const statusConfig = {
    signed: { text: 'Đã ký', color: 'bg-blue-100 text-blue-800' },
    paid: { text: 'Đã thu đủ', color: 'bg-green-100 text-green-800' },
    missing_docs: { text: 'Thiếu chứng từ', color: 'bg-orange-100 text-orange-800' },
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã HĐ</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Doanh thu HĐ</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quỹ chia</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thu nhập Sale (31%)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Đã thu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Chứng từ</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Tiến độ thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => {
              const saleIncome = Math.round(contract.fund * SALE_PERCENT);
              const config = statusConfig[contract.status] || statusConfig.signed;

              return (
                <tr
                  key={contract.id}
                  className={`border-b border-gray-200 transition-colors ${
                    contract.status === 'missing_docs' ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{contract.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{contract.customer}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {contract.contractAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {contract.fund.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-700">
                    {saleIncome.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {contract.paidAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {contract.document ? (
                      <a
                        href={contract.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        <ExternalLink size={14} />
                        Xem
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                        <AlertTriangle size={14} />
                        Thiếu
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      {config.text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentProgressBar
                      contractAmount={contract.contractAmount}
                      paidAmount={
                        contract.status === 'paid'
                          ? contract.contractAmount
                          : contract.contractAmount * 0.5
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng kết</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Tổng doanh thu HĐ đã ký</p>
            <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Tổng thu nhập Sale</p>
            <p className="text-sm font-medium text-gray-700 mb-1">Σ(Quỹ × 31%)</p>
            <p className="text-2xl font-bold text-emerald-600">{totalSaleIncome.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Tổng đã trả</p>
            <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Còn phải trả</p>
            <p className="text-2xl font-bold text-red-600">{totalOwed.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
