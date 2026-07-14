import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Edit3,
  KeyRound,
  LockKeyhole,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const EMPTY_FORM = {
  user_id: '',
  full_name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
  department: '',
  access_role: 'worker',
  status: 'active',
  enabled: true,
};

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', shortLabel: 'Dash' },
  { key: 'customers', label: 'Khách hàng', shortLabel: 'KH' },
  { key: 'marketing', label: 'Marketing', shortLabel: 'MKT' },
  { key: 'sale', label: 'Sale', shortLabel: 'Sale' },
  { key: 'bao_gia', label: 'Báo giá', shortLabel: 'BG' },
  { key: 'task', label: 'Task', shortLabel: 'Task' },
  { key: 'ba_sa', label: 'BA/SA', shortLabel: 'BA/SA' },
  { key: 'dev', label: 'Dev', shortLabel: 'Dev' },
  { key: 'cs', label: 'CS', shortLabel: 'CS' },
  { key: 'settings', label: 'Cấu hình', shortLabel: 'CFG' },
  { key: 'accounts', label: 'Quản lý tài khoản', shortLabel: 'TK' },
];

const DEFAULT_ROLES = [
  {
    role_key: 'admin',
    label: 'Admin',
    description: 'Toàn quyền quản trị hệ thống, tài khoản, phân quyền và mọi module.',
    is_system: true,
  },
  {
    role_key: 'worker',
    label: 'Nhân viên',
    description: 'Quyền vận hành cơ bản: xem các module nghiệp vụ chung, không vào quản trị.',
    is_system: true,
  },
];

const DEFAULT_PERMISSIONS = [
  ...MODULES.map((module) => ({
    role_key: 'admin',
    module_key: module.key,
    can_view: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_manage: true,
  })),
  ...['dashboard', 'customers', 'marketing', 'sale', 'bao_gia', 'task'].map((moduleKey) => ({
    role_key: 'worker',
    module_key: moduleKey,
    can_view: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_manage: false,
  })),
];

const EMPTY_ROLE_FORM = {
  role_key: '',
  role_name: '',
  description: '',
  modules: [],
};

const normalizeUser = (row) => ({
  ...EMPTY_FORM,
  ...row,
  user_id: row.user_id || '',
  enabled: row.enabled !== false && row.status !== 'inactive',
  status: row.status || (row.enabled === false ? 'inactive' : 'active'),
  access_role: row.access_role || (row.role === 'admin' ? 'admin' : 'worker'),
});

const makeUserId = (form) => {
  const base = form.username || form.email || form.phone || form.full_name || `user-${Date.now()}`;
  return String(base)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || `user-${Date.now()}`;
};

function StatusBadge({ user }) {
  const active = user.enabled !== false && user.status !== 'inactive';
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
    )}>
      {active ? 'Hoạt động' : 'Đã tắt'}
    </span>
  );
}

function RoleBadge({ accessRole }) {
  const admin = accessRole === 'admin';
  const worker = accessRole === 'worker' || !accessRole;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
      admin ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600',
    )}>
      {admin ? 'Admin' : worker ? 'Nhân viên' : accessRole}
    </span>
  );
}

export default function AccountManagementPage() {
  const { currentUser, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('worker');
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [rbacReady, setRbacReady] = useState(true);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [editingRoleKey, setEditingRoleKey] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });
      if (fetchError) throw fetchError;
      const nextUsers = (data || []).map(normalizeUser);
      setUsers(nextUsers);
      setSelectedUserId((current) => current || nextUsers[0]?.user_id || '');
    } catch (err) {
      setError(err.message || 'Không tải được danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const fetchRbac = async () => {
    try {
      const { data: roleRows, error: roleError } = await supabase
        .from('access_roles')
        .select('*')
        .order('role_name', { ascending: true });
      if (roleError) throw roleError;

      const { data: permissionRows, error: permissionError } = await supabase
        .from('role_permissions')
        .select('*');
      if (permissionError) throw permissionError;

      const nextRoles = (roleRows && roleRows.length ? roleRows : DEFAULT_ROLES).map((role) => ({
        role_key: role.role_key,
        label:
          role.role_key === 'admin'
            ? 'Admin'
            : role.role_key === 'worker'
              ? 'Nhân viên'
              : (role.role_name || role.label || role.role_key),
        description:
          role.role_key === 'admin'
            ? 'Toàn quyền quản trị hệ thống, tài khoản, phân quyền và mọi module.'
            : role.role_key === 'worker'
              ? 'Quyền vận hành cơ bản: xem các module nghiệp vụ chung, không vào quản trị.'
              : (role.description || ''),
        is_system: !!role.is_system,
      }));
      const nextPermissions = permissionRows && permissionRows.length ? permissionRows : DEFAULT_PERMISSIONS;
      setRoles(nextRoles);
      setPermissions(nextPermissions);
      setRbacReady(true);
      setSelectedRole((current) => (
        nextRoles.some((role) => role.role_key === current) ? current : nextRoles[0]?.role_key || 'worker'
      ));
    } catch (err) {
      setRoles(DEFAULT_ROLES);
      setPermissions(DEFAULT_PERMISSIONS);
      setRbacReady(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRbac();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = [
        user.full_name,
        user.username,
        user.email,
        user.phone,
        user.role,
        user.department,
      ].filter(Boolean).join(' ').toLowerCase();
      const roleOk = roleFilter === 'all' || user.access_role === roleFilter;
      return roleOk && (!keyword || haystack.includes(keyword));
    });
  }, [query, roleFilter, users]);

  const selectedUser = users.find((user) => user.user_id === selectedUserId) || null;
  const roleModuleKeys = (roleKey) => new Set(
    permissions
      .filter((permission) => permission.role_key === roleKey && permission.can_view !== false)
      .map((permission) => permission.module_key),
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const resetRoleForm = () => {
    setRoleForm(EMPTY_ROLE_FORM);
    setEditingRoleKey(null);
  };

  const startEditRole = (role) => {
    setEditingRoleKey(role.role_key);
    setRoleForm({
      role_key: role.role_key,
      role_name: role.label,
      description: role.description || '',
      modules: Array.from(roleModuleKeys(role.role_key)),
    });
  };

  const toggleRoleModule = (moduleKey) => {
    setRoleForm((current) => {
      const modules = new Set(current.modules);
      if (modules.has(moduleKey)) {
        modules.delete(moduleKey);
      } else {
        modules.add(moduleKey);
      }
      return { ...current, modules: Array.from(modules) };
    });
  };

  const startEdit = (user) => {
    setEditingId(user.user_id);
    setForm({ ...normalizeUser(user), password: user.password || '' });
    setActiveTab('accounts');
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const fullName = form.full_name.trim();
      if (!fullName) throw new Error('Tên tài khoản là bắt buộc');

      const userId = editingId || form.user_id.trim() || makeUserId(form);
      const payload = {
        user_id: userId,
        full_name: fullName,
        username: form.username.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        role: form.access_role === 'admin' ? 'admin' : (form.role.trim() || 'staff'),
        department: form.department.trim() || null,
        access_role: form.access_role,
        status: form.enabled ? 'active' : 'inactive',
        enabled: !!form.enabled,
        updated_at: new Date().toISOString(),
      };
      if (!editingId || form.password.trim()) payload.password = form.password.trim() || '123456';

      const { error: saveError } = editingId
        ? await supabase.from('users').update(payload).eq('user_id', editingId)
        : await supabase.from('users').insert(payload);
      if (saveError) throw saveError;

      setNotice(editingId ? 'Đã cập nhật tài khoản' : 'Đã tạo tài khoản mới');
      resetForm();
      await fetchUsers();
      await refreshUsers();
    } catch (err) {
      setError(err.message || 'Không lưu được tài khoản');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (user) => {
    if (user.user_id === currentUser?.userId) {
      setError('Không thể xóa chính tài khoản đang đăng nhập');
      return;
    }
    if (!window.confirm(`Xóa tài khoản "${user.full_name}"?`)) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const { error: deleteError } = await supabase.from('users').delete().eq('user_id', user.user_id);
      if (deleteError) throw deleteError;
      setNotice('Đã xóa tài khoản');
      await fetchUsers();
      await refreshUsers();
    } catch (err) {
      setError(err.message || 'Không xóa được tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const rolePayload = {
        access_role: selectedRole,
        role: selectedRole === 'admin' ? 'admin' : 'staff',
        updated_at: new Date().toISOString(),
      };
      const { error: updateError } = await supabase
        .from('users')
        .update(rolePayload)
        .eq('user_id', selectedUserId);
      if (updateError) throw updateError;
      setNotice('Đã gán quyền cho nhân sự');
      await fetchUsers();
      await refreshUsers();
    } catch (err) {
      setError(err.message || 'Không gán được quyền');
    } finally {
      setSaving(false);
    }
  };

  const saveRoleDefinition = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (!rbacReady) {
        throw new Error('Chưa có bảng access_roles/role_permissions. Hãy chạy lại file supabase_flow_task_integration.sql trước.');
      }

      const roleName = roleForm.role_name.trim();
      if (!roleName) throw new Error('Tên quyền là bắt buộc');
      const roleKey = (editingRoleKey || roleForm.role_key || makeUserId({ username: roleName }))
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');
      if (!roleKey) throw new Error('Mã quyền không hợp lệ');

      const { error: roleError } = await supabase.from('access_roles').upsert({
        role_key: roleKey,
        role_name: roleName,
        description: roleForm.description.trim() || null,
        is_system: roleKey === 'admin' || roleKey === 'worker',
        updated_at: new Date().toISOString(),
      });
      if (roleError) throw roleError;

      const { error: clearError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_key', roleKey);
      if (clearError) throw clearError;

      if (roleForm.modules.length) {
        const rows = roleForm.modules.map((moduleKey) => ({
          role_key: roleKey,
          module_key: moduleKey,
          can_view: true,
          can_create: roleKey === 'admin',
          can_update: roleKey === 'admin',
          can_delete: roleKey === 'admin',
          can_manage: roleKey === 'admin',
          updated_at: new Date().toISOString(),
        }));
        const { error: permissionError } = await supabase.from('role_permissions').insert(rows);
        if (permissionError) throw permissionError;
      }

      setNotice(editingRoleKey ? 'Đã cập nhật quyền' : 'Đã tạo quyền mới');
      resetRoleForm();
      await fetchRbac();
    } catch (err) {
      setError(err.message || 'Không lưu được định nghĩa quyền');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <KeyRound size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý tài khoản</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Quản lý tài khoản, mật khẩu và phân quyền dùng chung cho Flow, Task và các module nghiệp vụ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Lấy data từ users
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100">
          {[
            { id: 'accounts', label: 'Tài khoản & mật khẩu', icon: LockKeyhole },
            { id: 'permissions', label: 'Phân quyền', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-3 text-sm font-black border-b-2 transition-colors',
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {(error || notice) && (
        <div className={cn(
          'rounded-xl border px-4 py-3 text-sm font-bold',
          error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700',
        )}>
          {error || notice}
        </div>
      )}

      {activeTab === 'accounts' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <form onSubmit={saveAccount} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingId ? 'Sửa tài khoản' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Password trống khi sửa sẽ giữ nguyên.</p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-black uppercase text-slate-500">Tên</span>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Nguyễn Văn A" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase text-slate-500">Username</span>
                <input value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="nguyenvana" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Email</span>
                  <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="email@domain.com" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">SĐT</span>
                  <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="090..." />
                </label>
              </div>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase text-slate-500">Password</span>
                <input value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder={editingId ? 'Để trống nếu không đổi' : '123456'} />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Bộ phận</span>
                  <input value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Sale, MKT, Dev..." />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Quyền</span>
                  <select value={form.access_role} onChange={(e) => setForm({ ...form, access_role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    {roles.map((role) => (
                      <option key={role.role_key} value={role.role_key}>{role.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-sm font-bold text-slate-700">Tài khoản hoạt động</span>
                <input type="checkbox" checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4 accent-blue-600" />
              </label>
            </div>

            <button disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? 'Lưu tài khoản' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Danh sách tài khoản</h2>
                <p className="text-xs text-slate-500 font-semibold">Hiển thị {filteredUsers.length} / {users.length} tài khoản</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-64 rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Tìm tên, email, username..." />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold bg-white">
                  <option value="all">Tất cả quyền</option>
                  {roles.map((role) => (
                    <option key={role.role_key} value={role.role_key}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-auto max-h-[720px]">
              <table className="min-w-[960px] w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Tên</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Username</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Email / SĐT</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Password</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Quyền</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-black uppercase text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-black text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-400">{user.department || 'Chưa có bộ phận'}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">{user.username || '-'}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700">{user.email || '-'}</p>
                        <p className="text-xs text-slate-400">{user.phone || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">{user.password ? `${String(user.password).slice(0, 10)}...` : 'Chưa đặt'}</span>
                      </td>
                      <td className="px-4 py-3"><RoleBadge accessRole={user.access_role} /></td>
                      <td className="px-4 py-3"><StatusBadge user={user} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(user)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50" title="Sửa">
                            <Edit3 size={16} />
                          </button>
                          <button type="button" onClick={() => deleteAccount(user)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40" title="Xóa" disabled={user.user_id === currentUser?.userId}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-slate-400 font-bold">Không có tài khoản phù hợp</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Gán quyền nhân sự</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Gán quyền cho từng tài khoản trong bảng users.</p>
            </div>
            <label className="space-y-1 block">
              <span className="text-xs font-black uppercase text-slate-500">Nhân sự</span>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold bg-white">
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.full_name} {user.username ? `(${user.username})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-black uppercase text-slate-500">Vai trò</span>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold bg-white">
                {roles.map((role) => (
                  <option key={role.role_key} value={role.role_key}>{role.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={assignRole} disabled={!selectedUserId || saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Gán quyền
            </button>
            {selectedUser && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-black uppercase text-slate-400">Đang chọn</p>
                <p className="mt-1 text-sm font-black text-slate-900">{selectedUser.full_name}</p>
                <div className="mt-2"><RoleBadge accessRole={selectedUser.access_role} /></div>
              </div>
            )}

            <form onSubmit={saveRoleDefinition} className="pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Định nghĩa quyền</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Tạo nhóm quyền và chọn module được phép truy cập.
                  </p>
                </div>
                {editingRoleKey && (
                  <button type="button" onClick={resetRoleForm} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                )}
              </div>
              {!rbacReady && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  Chưa có bảng RBAC. Chạy lại file SQL mới trước khi lưu quyền.
                </div>
              )}
              <label className="space-y-1 block">
                <span className="text-xs font-black uppercase text-slate-500">Mã quyền</span>
                <input
                  value={roleForm.role_key}
                  onChange={(e) => setRoleForm({ ...roleForm, role_key: e.target.value })}
                  disabled={!!editingRoleKey}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:bg-slate-50"
                  placeholder="sale_manager"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs font-black uppercase text-slate-500">Tên quyền</span>
                <input
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                  placeholder="Trưởng nhóm Sale"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs font-black uppercase text-slate-500">Mô tả</span>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold resize-none"
                  placeholder="Mô tả phạm vi quyền..."
                />
              </label>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-slate-500">Module được phép</p>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map((module) => (
                    <label key={module.key} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={roleForm.modules.includes(module.key)}
                        onChange={() => toggleRoleModule(module.key)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      {module.label}
                    </label>
                  ))}
                </div>
              </div>
              <button disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {editingRoleKey ? 'Lưu định nghĩa quyền' : 'Tạo quyền mới'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Bảng phân quyền</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Ma trận quyền dùng chung cho Flow, Task và các module nghiệp vụ.</p>
            </div>
            <div className="overflow-auto">
              <table className="min-w-[1120px] w-full table-fixed text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs w-[150px]">Vai trò</th>
                    <th className="px-4 py-3 text-left font-black uppercase text-xs w-[320px]">Mô tả</th>
                    {MODULES.map((module) => (
                      <th
                        key={module.key}
                        className="px-2 py-3 text-center font-black uppercase text-[11px] leading-none w-[72px]"
                        title={module.label}
                      >
                        <span className="inline-block whitespace-nowrap">{module.shortLabel}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((role) => (
                    <tr key={role.role_key}>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => startEditRole(role)}
                          className="text-left hover:opacity-80"
                        >
                          <RoleBadge accessRole={role.role_key} />
                        </button>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div
                          className="font-semibold text-slate-600 text-sm leading-5 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                          }}
                          title={role.description}
                        >
                          {role.description}
                        </div>
                      </td>
                      {MODULES.map((module) => {
                        const allowed = roleModuleKeys(role.role_key).has(module.key);
                        return (
                          <td key={module.key} className="px-3 py-3 text-center align-top">
                            {allowed ? (
                              <CheckCircle size={17} className="mx-auto text-emerald-600" />
                            ) : (
                              <X size={17} className="mx-auto text-slate-300" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
