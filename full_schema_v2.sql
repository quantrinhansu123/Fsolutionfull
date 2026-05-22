<USER_REQUEST>
-- ============================================================
-- F-SOLUTION DATABASE SCHEMA V2
-- Dùng UUID, tích hợp Supabase Auth
-- Bảng users & projects đã có → KHÔNG tạo lại
-- ============================================================


-- ============================================================
-- PHẦN 1: CẤU HÌNH THU NHẬP
-- ============================================================

-- Cấu hình tỷ lệ % phân phối thu nhập theo dự án
CREATE TABLE income_rate_config (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID                NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,  -- ma_du_an
    bo_phan         TEXT                NOT NULL CHECK (bo_phan IN ('marketing','sale','ba','product','dev','cs')),  -- ten_bo_phan
    ty_le           NUMERIC(5,2)        NOT NULL,   -- phan_tram_ty_le (VD: 8.00, 32.00)
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, bo_phan)
);

COMMENT ON TABLE  income_rate_config                IS 'cau_hinh_ty_le_thu_nhap_tung_bo_phan';
COMMENT ON COLUMN income_rate_config.bo_phan        IS 'ten_bo_phan';
COMMENT ON COLUMN income_rate_config.ty_le          IS 'phan_tram_ty_le';

-- ============================================================

-- Cấu hình giá point cho Dev và CS theo dự án
CREATE TABLE point_config (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID                NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,  -- ma_du_an
    loai_ticket     TEXT                NOT NULL,   -- loai_ticket (module_lon, module_nho, cai_tien, bug_lon, bug_nho, test, training, deploy)
    bo_phan         TEXT                NOT NULL CHECK (bo_phan IN ('dev','cs')),  -- bo_phan_ap_dung
    diem            INT                 NOT NULL,   -- so_diem_quy_doi
    created_at      TIMESTAMPTZ 
<truncated 27976 bytes>
uon);
CREATE INDEX idx_leads_created_at      ON leads(created_at);

-- Opportunities
CREATE INDEX idx_oppo_giai_doan        ON opportunities(giai_doan);
CREATE INDEX idx_oppo_sale             ON opportunities(sale_phu_trach);

-- Contracts
CREATE INDEX idx_contracts_trang_thai  ON contracts(trang_thai);
CREATE INDEX idx_contracts_project     ON contracts(project_id);

-- Tickets
CREATE INDEX idx_tickets_bo_phan       ON tickets(bo_phan);
CREATE INDEX idx_tickets_trang_thai    ON tickets(trang_thai);
CREATE INDEX idx_tickets_phu_trach     ON tickets(phu_trach);
CREATE INDEX idx_tickets_project       ON tickets(project_id);

-- FB raw data
CREATE INDEX idx_fb_raw_posts_da_xu_ly     ON fb_raw_posts(da_xu_ly);
CREATE INDEX idx_fb_raw_posts_group        ON fb_raw_posts(group_id);
CREATE INDEX idx_fb_raw_comments_da_xu_ly  ON fb_raw_comments(da_xu_ly);

-- FB leads
CREATE INDEX idx_fb_lead_trang_thai    ON fb_lead_data(trang_thai);
CREATE INDEX idx_fb_lead_phu_trach     ON fb_lead_data(phu_trach);

-- Income
CREATE INDEX idx_income_user           ON income_summary(user_id);
CREATE INDEX idx_income_project        ON income_summary(project_id);
CREATE INDEX idx_income_thang          ON income_summary(thang);

-- Violations
CREATE INDEX idx_violations_user       ON violations(user_id);
CREATE INDEX idx_violations_loai       ON violations(loai_vi_pham); đây còn thiếu nhé nếu tab nào cần bảng nào tôi gửi thêm bạn nghiên cứu đi
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-05-22T20:56:37+07:00.

The user's current state is as follows:
Active Document: d:\TT\Fsolutionfull\src\pages\BA\components\TicketModal.jsx (LANGUAGE_JAVASCRIPT)
Cursor is on line: 1
Other open documents:
- d:\TT\Fsolutionfull\src\pages\BA\components\TicketModal.jsx (LANGUAGE_JAVASCRIPT)
- d:\TT\Fsolutionfull\.env (LANGUAGE_UNSPECIFIED)
Running terminal commands:
- npm run dev (in d:\BackendNode\Fsolusion_code, running for 50m29s)
- npm run dev (in d:\TT\Fsolutionfull, running for 7m8s)
</ADDITIONAL_METADATA>