import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Ticket, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type Mode = 'login' | 'signup' | 'forgot';
type AuthType = 'user' | 'provider';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn, signInAsProvider, loading } = useAuthStore();
  const { addToast } = useUIStore();

  const [mode, setMode] = useState<Mode>('login');
  const [authType, setAuthType] = useState<AuthType>('user');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (mode !== 'forgot' && form.password.length < 6) e.password = 'Minimum 6 characters';
    if (mode === 'signup' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      if (mode === 'login') {
        if (authType === 'provider') {
          await signInAsProvider(form.email, form.password);
          addToast('Welcome back, Provider!', 'success');
          navigate('/provider/dashboard');
        } else {
          await signIn(form.email, form.password);
          addToast('Welcome back!', 'success');
          navigate('/');
        }
      } else if (mode === 'signup') {
        await signUp(form.email, form.password, form.name);
        addToast('Account created! Please check your email to confirm.', 'success');
        setMode('login');
      } else {
        addToast('Password reset link sent to your email.', 'success');
        setMode('login');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      addToast(message, 'error');
    }
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-900 to-gray-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-red-500 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-red-700 blur-3xl" />
        </div>
        <div className="relative text-white text-center px-8">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/50">
            <Ticket className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black mb-3">CineBook</h2>
          <p className="text-red-200 text-lg leading-relaxed max-w-sm">
            Your gateway to unforgettable cinematic experiences
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {['100M+ Tickets Booked', '5000+ Screens', 'Instant Confirmation', '24/7 Customer Support'].map(item => (
              <div key={item} className="flex items-center gap-3 text-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl">Cine<span className="text-red-600">Book</span></span>
          </Link>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {mode === 'login' ? 'Sign in to continue booking' : mode === 'signup' ? 'Join millions of movie lovers' : 'Enter your email to receive reset link'}
          </p>

          {/* Auth Type Toggle (login only) */}
          {mode === 'login' && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 mb-6">
              <button
                onClick={() => setAuthType('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  authType === 'user' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                <User className="w-4 h-4" /> User
              </button>
              <button
                onClick={() => setAuthType('provider')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  authType === 'provider' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                <Building2 className="w-4 h-4" /> Provider
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                error={errors.name}
                leftIcon={<User className="w-4 h-4" />}
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            {mode !== 'forgot' && (
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            )}
            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {mode === 'login'
                ? (authType === 'provider' ? 'Sign In as Provider' : 'Sign In')
                : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>

          {mode === 'login' && authType === 'provider' && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              Provider accounts have access to movie management, show creation, and analytics dashboard.
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-gray-500">Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setAuthType('user'); }} className="text-red-600 font-semibold hover:text-red-700">Sign up</button>
              </p>
            ) : (
              <p className="text-gray-500">Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-red-600 font-semibold hover:text-red-700">Sign in</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
