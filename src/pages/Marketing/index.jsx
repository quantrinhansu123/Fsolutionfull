import { useState } from 'react';
import { Plus } from 'lucide-react';
import { LeadTable } from './components/LeadTable';
import { MarketingSummary } from './components/MarketingSummary';
import { LeadFormModal } from './components/LeadFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

// Mock data: 5 dòng (3 hợp lệ, 1 thiếu ảnh, 1 trùng)
const MOCK_LEADS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    source: 'Facebook Ads',
    image: 'https://example.com/image1.jpg',
    status: 'qualified',
    income: 30000,
    warnings: [],
  },
  {
    id: 2,
    name: 'Trần Thị B',
    phone: '0912345678',
    source: 'Google Ads',
    image: 'https://example.com/image2.jpg',
    status: 'qualified',
    income: 30000,
    warnings: [],
  },
  {
    id: 3,
    name: 'Lê Hoàng C',
    phone: '0901234567',
    source: 'TikTok',
    image: null,
    status: 'disqualified',
    income: 0,
    warnings: ['missing_image'],
  },
  {
    id: 4,
    name: 'Phạm Quốc D',
    phone: '0988888888',
    source: 'Facebook Ads',
    image: 'https://example.com/image4.jpg',
    status: 'qualified',
    income: 30000,
    warnings: [],
  },
  {
    id: 5,
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    source: 'Facebook Ads',
    image: 'https://example.com/image1-duplicate.jpg',
    status: 'disqualified',
    income: 0,
    warnings: ['duplicate'],
  },
];

export default function MarketingPage() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [formModal, setFormModal] = useState({ isOpen: false, mode: 'add', lead: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, lead: null });

  const handleAddLead = () => {
    setFormModal({ isOpen: true, mode: 'add', lead: null });
  };

  const handleEditLead = (lead) => {
    setFormModal({ isOpen: true, mode: 'edit', lead });
  };

  const handleDeleteLead = (lead) => {
    setDeleteModal({ isOpen: true, lead });
  };

  const handleFormSubmit = (formData) => {
    if (formModal.mode === 'add') {
      // Thêm lead mới
      const newLead = {
        ...formData,
        id: Math.max(...leads.map(l => l.id), 0) + 1,
        income: formData.status === 'qualified' ? 30000 : 0,
        warnings: formData.image ? [] : ['missing_image'],
      };
      setLeads([...leads, newLead]);
    } else {
      // Cập nhật lead
      setLeads(
        leads.map(l =>
          l.id === formModal.lead.id
            ? {
                ...l,
                ...formData,
                income: formData.status === 'qualified' ? 30000 : 0,
                warnings: formData.image ? [] : ['missing_image'],
              }
            : l
        )
      );
    }
  };

  const handleConfirmDelete = (leadId) => {
    setLeads(leads.filter(l => l.id !== leadId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketing - Quản lý Lead</h1>
          <p className="text-gray-600 mt-2">Theo dõi và quản lý các lead từ các chiến dịch marketing</p>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Danh sách Lead</h2>
            <button
              onClick={handleAddLead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Thêm Lead
            </button>
          </div>
          <LeadTable leads={leads} onEdit={handleEditLead} onDelete={handleDeleteLead} />
        </div>

        {/* Marketing Summary */}
        <MarketingSummary leads={leads} />
      </div>

      {/* Form Modal */}
      <LeadFormModal
        isOpen={formModal.isOpen}
        lead={formModal.lead}
        mode={formModal.mode}
        onClose={() => setFormModal({ isOpen: false, mode: 'add', lead: null })}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        lead={deleteModal.lead}
        onClose={() => setDeleteModal({ isOpen: false, lead: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
