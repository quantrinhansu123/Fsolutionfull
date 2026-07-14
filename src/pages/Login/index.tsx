import React, { useState } from 'react';
import { UserRound, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function LoginPage({
  onLogin,
  error,
}: {
  onLogin: (account: string, password: string) => Promise<void>;
  error?: string | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState('khachtest');
  const [password, setPassword] = useState('123456');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    try {
      await onLogin(account, password);
    } catch (err: any) {
      setLoginError(err.message || 'Không đăng nhập được');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-md p-8 relative z-10">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-6 rotate-3">
            <span className="text-white font-black text-3xl">F</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-center">
            F-Solution <span className="text-blue-500">Income</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Hệ thống quản trị tài chính & thu nhập</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Tài khoản / SĐT / Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <UserRound size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="khachtest hoặc SĐT"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {(loginError || error) && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                {loginError || error}
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Mật khẩu</label>
                <button type="button" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">Quên?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative",
                isLoading && "cursor-not-allowed opacity-80"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                <>
                  <span>Đăng nhập ngay</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Bảo mật bởi F-Solution Security Protocol</span>
        </div>
      </div>
    </div>
  );
}
