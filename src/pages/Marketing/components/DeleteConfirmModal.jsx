import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, lead, onClose, onConfirm }) => {
  if (!isOpen || !lead) return null;

  const handleConfirm = () => {
    onConfirm(lead.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn xóa lead <span className="font-semibold text-red-600">"{lead.name}"</span>?
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Số điện thoại:</span>
              <span className="font-medium text-gray-900">{lead.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Source:</span>
              <span className="font-medium text-gray-900">{lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span
                className={`font-medium px-2 py-0.5 rounded text-xs ${
                  lead.status === 'qualified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {lead.status === 'qualified' ? 'Hợp lệ' : 'Loại'}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
