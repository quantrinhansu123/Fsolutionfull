import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface BaoGiaContext {
  opportunity_id?: string;
  lead_id?: string;
  sale_id?: string;
  ten_khach?: string;
  ten_sale?: string;
}

export default function BaoGiaPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const initIframe = async (context: BaoGiaContext) => {
    if (!context.opportunity_id) {
      // Không có context → chỉ mở form trống bình thường
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'INIT_BAOGIA', ten_khach: context.ten_khach || '', ten_sale: context.ten_sale || 'Chưa rõ', lan_bao_gia: 1, history: [] },
        '*'
      );
      return;
    }

    // Đếm số lần và lấy lịch sử báo giá cho cơ hội này
    const { data: history, count } = await supabase
      .from('bao_gia')
      .select('id, lan_bao_gia, so_tien, ngay_bao_gia, noi_dung_json, ghi_chu', { count: 'exact' })
      .eq('opportunity_id', context.opportunity_id)
      .order('lan_bao_gia', { ascending: true });

    const lanMoi = (count || 0) + 1;

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'INIT_BAOGIA',
        ten_khach: context.ten_khach || '',
        ten_sale: context.ten_sale || 'Chưa rõ',
        lan_bao_gia: lanMoi,
        opportunity_id: context.opportunity_id,
        lead_id: context.lead_id,
        sale_id: context.sale_id,
        history: history || [],
      },
      '*'
    );
  };

  useEffect(() => {
    // Đọc context Sale đã set khi bấm "Báo giá" từ bảng Demo
    const raw = localStorage.getItem('baogia_context');
    const context: BaoGiaContext = raw ? JSON.parse(raw) : {};


    // Lắng nghe message từ iframe
    const handleMessage = async (e: MessageEvent) => {
      if (!e.data) return;

      // iframe đã load xong → gửi context vào
      if (e.data.type === 'BAOGIA_READY') {
        await initIframe(context);
        return;
      }

      // Sale bấm "LƯU BÁO GIÁ"
      if (e.data.type === 'SAVE_QUOTE') {
        if (!context.opportunity_id) {
          showToast('⚠️ Không tìm thấy cơ hội Demo liên kết. Vui lòng mở Báo Giá từ tab Sale.');
          return;
        }

        setSaving(true);
        try {
          const { total, payload } = e.data;

          // Tính lần báo giá tại thời điểm lưu (tránh race condition)
          const { count } = await supabase
            .from('bao_gia')
            .select('id', { count: 'exact', head: true })
            .eq('opportunity_id', context.opportunity_id);

          const lanBaoGia = (count || 0) + 1;

          const { error } = await supabase.from('bao_gia').insert({
            opportunity_id: context.opportunity_id,
            lead_id: context.lead_id || null,
            sale_id: context.sale_id || null,
            lan_bao_gia: lanBaoGia,
            tong_tien: Number(total) || 0,
            so_tien: Number(total) || 0,
            noi_dung_json: payload,
            trang_thai: 'draft',
            ngay_bao_gia: payload.general?.date ? new Date(payload.general.date + 'T12:00:00+07:00').toISOString() : new Date().toISOString(),
          });

          if (error) throw error;

          showToast(`✅ Đã lưu Báo giá Lần ${lanBaoGia} thành công!`);

          // Lấy danh sách lịch sử mới nhất sau khi lưu thành công
          const { data: updatedHistory } = await supabase
            .from('bao_gia')
            .select('id, lan_bao_gia, so_tien, ngay_bao_gia, noi_dung_json, ghi_chu')
            .eq('opportunity_id', context.opportunity_id)
            .order('lan_bao_gia', { ascending: true });

          // Cập nhật badge và lịch sử trong iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'INIT_BAOGIA',
              ten_khach: context.ten_khach || '',
              ten_sale: context.ten_sale || 'Chưa rõ',
              lan_bao_gia: lanBaoGia + 1, // lần tiếp theo nếu Sale muốn làm lại
              opportunity_id: context.opportunity_id,
              lead_id: context.lead_id,
              sale_id: context.sale_id,
              history: updatedHistory || [],
            },
            '*'
          );
        } catch (err: any) {
          console.error('Lỗi khi lưu báo giá:', err);
          showToast('❌ Lỗi khi lưu: ' + err.message);
        } finally {
          setSaving(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-[240px] z-30 bg-slate-200">
      <iframe
        ref={iframeRef}
        src="/baogia.html?v=4"
        title="Báo giá F-Solution"
        className="w-full h-full border-0"
      />

      {/* Toast thông báo */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            background: toast.startsWith('✅') ? '#10b981' : toast.startsWith('⚠️') ? '#f59e0b' : '#ef4444',
            color: 'white',
            padding: '14px 22px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            zIndex: 9999,
            maxWidth: '360px',
          }}
        >
          {toast}
        </div>
      )}

      {/* Overlay khi đang lưu */}
      {saving && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
          }}
        >
          <div style={{ background: 'white', padding: '24px 40px', borderRadius: '16px', fontWeight: 700, fontSize: '16px' }}>
            💾 Đang lưu báo giá...
          </div>
        </div>
      )}
    </div>
  );
}
