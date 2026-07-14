import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'fsolution.currentUserId';

export interface FlowUser {
  userId: string;
  fullName: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  accessRole: 'admin' | 'worker';
  enabled: boolean;
  avatarUrl?: string | null;
}

interface AuthContextType {
  users: FlowUser[];
  currentUser: FlowUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (account: string, password: string) => Promise<void>;
  logout: () => void;
  selectUser: (userId: string) => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeAccessRole = (role?: string | null, accessRole?: string | null): 'admin' | 'worker' => {
  const rawAccess = String(accessRole || '').trim().toLowerCase();
  if (rawAccess === 'admin' || rawAccess === 'ad') return 'admin';
  const rawRole = String(role || '').trim().toLowerCase();
  if (['admin', 'ad'].includes(rawRole) || rawRole.includes('quản lý') || rawRole.includes('quan ly') || rawRole.includes('manager')) {
    return 'admin';
  }
  return 'worker';
};

const mapUser = (row: any): FlowUser => ({
  userId: row.user_id,
  fullName: row.full_name || row.username || row.email || row.user_id || 'Nhân sự',
  username: row.username || null,
  email: row.email || null,
  phone: row.phone || null,
  role: row.role || null,
  accessRole: normalizeAccessRole(row.role, row.access_role),
  enabled: row.enabled !== false && row.status !== 'inactive',
  avatarUrl: row.avatar_url || null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<FlowUser[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });
      if (fetchError) throw fetchError;

      const rows = data || [];
      const mapped = rows.map(mapUser).filter((user) => user.enabled);
      setRawUsers(rows);
      setUsers(mapped);

      const storedId = window.localStorage.getItem(STORAGE_KEY);
      const nextUser = mapped.find((user) => user.userId === storedId) || mapped[0] || null;
      setCurrentUserId(nextUser?.userId || null);
      if (nextUser) window.localStorage.setItem(STORAGE_KEY, nextUser.userId);
    } catch (err: any) {
      console.error('Error loading Flow users:', err);
      setError(err.message || 'Không tải được danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => user.userId === currentUserId) || null,
    [users, currentUserId],
  );

  const login = async (account: string, password: string) => {
    const normalizedAccount = account.trim().toLowerCase();
    const normalizedPassword = password.trim();
    if (!normalizedAccount || !normalizedPassword) throw new Error('Nhập tài khoản và mật khẩu');

    if (rawUsers.length === 0) await refreshUsers();
    const matched = rawUsers.find((row) => {
      const candidates = [row.phone, row.username, row.email, row.user_id]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());
      return candidates.includes(normalizedAccount);
    });

    const storedPassword = String(matched?.password || '').trim();
    if (!matched || (storedPassword && storedPassword !== normalizedPassword)) {
      throw new Error('Tài khoản hoặc mật khẩu không đúng');
    }
    if (matched.enabled === false || matched.status === 'inactive') {
      throw new Error('Tài khoản này đang bị tắt');
    }

    setCurrentUserId(matched.user_id);
    window.localStorage.setItem(STORAGE_KEY, matched.user_id);
    setLoginRequired(false);
  };

  const logout = () => {
    setLoginRequired(true);
    setCurrentUserId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const selectUser = (userId: string) => {
    if (!users.some((user) => user.userId === userId)) return;
    setCurrentUserId(userId);
    window.localStorage.setItem(STORAGE_KEY, userId);
  };

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      loading,
      error,
      isAuthenticated: !loginRequired && !!currentUser,
      login,
      logout,
      selectUser,
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
