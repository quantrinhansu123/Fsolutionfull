import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { LeadTable } from './components/LeadTable';
import { MarketingSummary } from './components/MarketingSummary';
import { LeadFormModal } from './components/LeadFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { supabase } from '../../lib/supabaseClient';

export default function MarketingPage() {
  const [leads, setLeads] = useState([]);
  const [formModal, setFormModal] = useState({ isOpen: false, mode: 'add', lead: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, lead: null });

  // Fetch leads from Supabase database
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedLeads = (data || []).map((l) => {
        // Tự động tính toán các cảnh báo cảnh báo khi đọc
        const warnings = [];
        if (!l.so_dien_thoai) warnings.push('missing_phone');
        if (!l.anh_nhu_cau_url) warnings.push('missing_image');
        if (l.la_trung) warnings.push('duplicate');
        if (!l.nguon) warnings.push('missing_source');

        return {
          id: l.id, // UUID
          name: l.ho_ten || '',
          phone: l.so_dien_thoai || '',
          source: l.source_id || l.nguon || '',
          image: l.anh_nhu_cau_url || '',
          status: l.trang_thai === 'qualified' ? 'qualified' : 'disqualified',
          income: Number(l.thu_nhap) || 0,
          warnings,
        };
      });
      setLeads(mappedLeads);
    } catch (err) {
      console.error('Lỗi khi tải danh sách leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = () => {
    setFormModal({ isOpen: true, mode: 'add', lead: null });
  };

  const handleEditLead = (lead) => {
    setFormModal({ isOpen: true, mode: 'edit', lead });
  };

  const handleDeleteLead = (lead) => {
    setDeleteModal({ isOpen: true, lead });
  };

  const handleFormSubmit = async (formData) => {
    try {
      const isQualified = formData.status === 'qualified';
      const trang_thai = isQualified ? 'qualified' : 'unqualified';
      const hop_le = isQualified;
      const thu_nhap = isQualified ? 30000 : 0;

      // Ánh xạ nguồn sang Database enum hợp lệ
      const adsSources = ['Facebook Ads', 'Google Ads', 'TikTok', 'Instagram', 'Zalo'];
      const nguon = adsSources.includes(formData.source) ? 'ads' : 'manual';
      const source_id = formData.source;

      if (formModal.mode === 'add') {
        // Thêm lead mới
        const { error } = await supabase
          .from('leads')
          .insert([{
            ho_ten: formData.name,
            so_dien_thoai: formData.phone,
            nguon,
            source_id,
            anh_nhu_cau_url: formData.image || null,
            trang_thai,
            hop_le,
            thu_nhap,
          }]);

        if (error) throw error;
      } else {
        // Cập nhật lead
        const { error } = await supabase
          .from('leads')
          .update({
            ho_ten: formData.name,
            so_dien_thoai: formData.phone,
            nguon,
            source_id,
            anh_nhu_cau_url: formData.image || null,
            trang_thai,
            hop_le,
            thu_nhap,
            updated_at: new Date().toISOString(),
          })
          .eq('id', formModal.lead.id);

        if (error) throw error;
      }

      await fetchLeads();
    } catch (err) {
      console.error('Lỗi khi lưu lead:', err);
      alert('Lỗi khi lưu lead: ' + err.message);
    }
  };

  const handleConfirmDelete = async (leadId) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      await fetchLeads();
    } catch (err) {
      console.error('Lỗi khi xóa lead:', err);
      alert('Lỗi khi xóa lead: ' + err.message);
    }
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
