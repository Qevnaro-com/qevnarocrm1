import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Headphones,
  Laptop,
  Palette
} from 'lucide-react';

export const LoginPage = () => {
  const { login, users, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#060E28] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic ambient lighting matching Qevnaro logo electric blue */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-brand-accent/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-brand mb-4">
          <Logo variant="dark" size="lg" showSubtitle={false} />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">QevnaroCRM Portal</h1>
        <p className="mt-1.5 text-xs text-blue-200/70 max-w-sm mx-auto">
          Operations, IT Telecalling, & Team Management Console
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-brand-lg rounded-2xl border border-slate-100 sm:px-8 space-y-6">
          {/* Error message alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@qevnaro.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Admin Managed</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-mono rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                />
                <span>Remember me on this machine</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-brand-navy hover:bg-brand-navy-light text-white shadow-brand flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Helper for Demo Login reference without buttons */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <details className="text-left group">
              <summary className="text-[11px] text-slate-400 font-semibold cursor-pointer hover:text-brand-accent transition-colors flex items-center justify-between">
                <span>View Registered Account Emails</span>
                <span className="text-[10px] text-brand-accent group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5 font-mono">
                <p><strong>Admin:</strong> admin@qevnaro.com</p>
                <p><strong>Caller:</strong> rajesh@qevnaro.com</p>
                <p><strong>Frontend Dev:</strong> aman@qevnaro.com</p>
                <p><strong>UI Designer:</strong> priya@qevnaro.com</p>
                <p className="text-[10px] text-slate-400 pt-1 font-sans">
                  *Passwords can be updated or reset by the Super Admin in Team Management.
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-blue-200/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300/70" />
            <span>All credentials & passwords are controlled and provisioned by the Super Admin.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
