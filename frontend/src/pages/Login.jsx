import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    if (isLoginTab) {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate(redirect);
          }
        }, 1000);
      } else {
        setErrorMsg(res.error);
        setSubmitting(false);
      }
    } else {
      if (!name) {
        setErrorMsg('Please enter your name');
        setSubmitting(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
        setSubmitting(false);
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        setSuccessMsg('Account registered successfully!');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate(redirect);
          }
        }, 1000);
      } else {
        setErrorMsg(res.error);
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bakery-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-3xl shadow-xl border border-bakery-200">
        {/* Toggle Header */}
        <div className="text-center">
          <span className="text-4xl">🧁</span>
          <h2 className="mt-4 text-3xl font-black text-slate-800">
            {isLoginTab ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLoginTab ? 'Login to order fresh treats!' : 'Sign up to place and track orders.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              isLoginTab
                ? 'border-bakery-700 text-bakery-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              !isLoginTab
                ? 'border-bakery-700 text-bakery-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error/Success Feedbacks */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-semibold text-center">
            🎉 {successMsg}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div>
              <label className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 text-sm"
                  placeholder="Full Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="sr-only">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 text-sm"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div>
            <label className="sr-only">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 text-sm bg-white"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white chocolate-btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-600 disabled:opacity-50 mt-6`}
          >
            {isLoginTab ? (
              <>
                <LogIn className="h-5 w-5" />
                <span>{submitting ? 'Logging In...' : 'Log In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>{submitting ? 'Registering...' : 'Sign Up'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
