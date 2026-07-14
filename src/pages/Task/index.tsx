import { ExternalLink, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const normalizeTaskUrl = (value?: string) => {
  const base = (value || 'https://taskgiaoviec.vercel.app/desktop/san-pham').trim().replace(/\/$/, '');
  return base || 'https://taskgiaoviec.vercel.app/desktop/san-pham';
};

const TASK_APP_URL = normalizeTaskUrl(import.meta.env.VITE_TASK_APP_URL);
const FLOW_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FLOW_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function TaskPage() {
  const { currentUser } = useAuth();
  const taskUrl = useMemo(() => {
    const url = new URL(TASK_APP_URL);
    if (currentUser?.userId) {
      url.searchParams.set('user_id', currentUser.userId);
      url.searchParams.set('source', 'flow');
    }
    if (FLOW_SUPABASE_URL && FLOW_SUPABASE_KEY) {
      url.searchParams.set('supabase_url', FLOW_SUPABASE_URL);
      url.searchParams.set('supabase_key', FLOW_SUPABASE_KEY);
    }
    return url.toString();
  }, [currentUser?.userId]);

  return (
    <div className="h-[calc(100vh-6rem)] min-h-[720px] flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task</h1>
          <p className="text-sm text-slate-500 font-medium">
            Mở module quản lý task cha, task con và nhân sự từ hệ thống giao việc.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Tải lại
          </button>
          <a
            href={taskUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            <ExternalLink size={16} />
            Mở tab mới
          </a>
        </div>
      </div>

      <iframe
        key={taskUrl}
        title="F-Solution Task"
        src={taskUrl}
        className="flex-1 w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
      />
    </div>
  );
}
