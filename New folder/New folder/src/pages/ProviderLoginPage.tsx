import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Building2, Ticket } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ProviderLoginPage() {
  const navigate = useNavigate();
  const { signInAsProvider, loading } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required';
    if (password.length < 6) errs.password = 'Minimum 6 characters';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      await signInAsProvider(email, password);
      addToast('Welcome back, Provider!', 'success');
      navigate('/provider/dashboard');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Invalid credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl">Cine<span className="text-red-600">Book</span></span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Provider Login</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Access your cinema management dashboard</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="provider@cinebook.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined })); }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: undefined })); }}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign In as Provider
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-600 dark:text-blue-400">
            Provider accounts can manage movies, create shows, and view analytics. Use the same credentials as your user account.
          </div>

          <div className="mt-4 text-center text-sm">
            <p className="text-gray-500">Regular user?{' '}
              <Link to="/login" className="text-red-600 font-semibold hover:text-red-700">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
