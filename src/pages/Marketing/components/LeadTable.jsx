import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { LeadWarningBadge } from './LeadWarningBadge';

const getDisqualificationReasons = (warnings) => {
  const reasons = {
    missing_phone: 'Khách hàng chưa có số điện thoại',
    missing_image: 'Khách hàng chưa cung cấp ảnh nhu cầu',
    duplicate: 'Lead này trùng với lead khác trong hệ thống',
    missing_source: 'Chưa xác định được nguồn tiếp cận',
  };

  return warnings
    .filter((w) => reasons[w])
    .map((w) => reasons[w]);
};

export const LeadTable = ({ leads, onEdit, onDelete }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [actionTooltip, setActionTooltip] = useState({ visible: false, x: 0, y: 0, text: '', type: '' });

  const handleWarningClick = (e, warnings) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const reasons = getDisqualificationReasons(warnings);

    setTooltip({
      visible: true,
      x: rect.left,
      y: rect.bottom + 5,
      content: reasons.join('; '),
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
    setActionTooltip({ ...actionTooltip, visible: false });
  };

  const handleActionHover = (e, type, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActionTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5,
      text,
      type,
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">STT</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên khách</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SĐT</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source/Campaign</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người xử lý</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ảnh nhu cầu</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thu nhập</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-12">Cảnh báo</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => {
            const isInvalid = lead.status !== 'qualified';
            const income = isInvalid ? 0 : lead.income;
            const hasWarnings = lead.warnings && lead.warnings.length > 0;

            return (
              <tr
                key={lead.id}
                className={`border-b border-gray-200 transition-colors ${
                  isInvalid ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                <td
                  className={`px-4 py-3 text-sm font-medium ${
                    isInvalid ? 'text-red-600 line-through' : 'text-gray-900'
                  }`}
                >
                  {lead.name}
                </td>
                <td className={`px-4 py-3 text-sm ${isInvalid ? 'text-red-600 line-through' : ''}`}>
                  {lead.phone || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{lead.source}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className={lead.handlerId ? 'font-medium text-gray-900' : 'text-gray-400'}>
                    {lead.handler || 'Chưa có người xử lý'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {lead.image ? (
                    <a
                      href={lead.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Link
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'qualified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {lead.status === 'qualified' ? 'Hợp lệ' : 'Loại'}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-sm font-semibold text-right ${
                    isInvalid ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {income.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-4 py-3 text-center">
                  {hasWarnings && (
                    <div className="relative">
                      <button
                        onClick={(e) => handleWarningClick(e, lead.warnings)}
                        onMouseLeave={handleMouseLeave}
                        className="text-yellow-600 hover:text-yellow-800 text-lg cursor-help"
                        title="Xem lý do bị loại"
                      >
                        ⚠️
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      onClick={() => onEdit && onEdit(lead)}
                      onMouseEnter={(e) => handleActionHover(e, 'edit', 'Chỉnh sửa')}
                      onMouseLeave={handleMouseLeave}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(lead)}
                      onMouseEnter={(e) => handleActionHover(e, 'delete', 'Xóa Lead')}
                      onMouseLeave={handleMouseLeave}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 max-w-xs"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="font-semibold mb-1">Lý do bị loại:</div>
          <div>{tooltip.content}</div>
          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Action Tooltip */}
      {actionTooltip.visible && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
          style={{
            left: `${actionTooltip.x - 25}px`,
            top: `${actionTooltip.y}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseLeave={handleMouseLeave}
        >
          {actionTooltip.text}
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-900 transform -translate-x-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
