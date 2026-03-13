import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { states } from '@/stores/schemeStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  state: z.string().min(1, 'Please select your state'),
  mobile: z.string().optional().refine(val => !val || /^\d{10}$/.test(val), 'Enter valid 10-digit mobile number or leave empty'),
  language: z.enum(['en', 'hi', 'gu']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthChecking, checkSession } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      state: '',
      mobile: '',
      language: 'en',
    }
  });

  const watchPassword = watch('password', '');

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-muted', width: 'w-0' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score < 4) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(watchPassword);

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            state: data.state,
            phone: data.mobile || null
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Auto-create profile row
        const profile = {
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.mobile || null,
          role: 'USER',
          state: data.state,
          preferred_language: data.language || 'en'
        };
        const { error: profileError } = await supabase.from('profiles').upsert(profile);
        if (profileError) throw profileError;

        // Re-check session in auth store
        await checkSession();
        toast.success("Welcome to Scheme Saarthi!");
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('email', { message: 'Email already registered' });
      } else {
        toast.error(err.message || 'Registration failed');
      }
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 gradient-hero">
        <Card className="w-full max-w-md animate-fade-in shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <span className="text-2xl font-bold text-primary-foreground">स</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t('register') || 'Create an Account'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                <Input {...register('fullName')} placeholder="Enter your full name" />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                <Input {...register('email')} type="email" placeholder="email@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password *</label>
                <div className="relative">
                  <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" />
                  <button type="button" aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {watchPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password *</label>
                <div className="relative">
                  <Input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" />
                  <button type="button" aria-label="toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="state" className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                <select id="state" {...register('state')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Select your state</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number (Optional)</label>
                <Input {...register('mobile')} placeholder="10-digit mobile number" maxLength={10} />
                {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t('selectLanguage')}</label>
                <select {...register('language')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  {Object.keys(languageNames).map((lang) => (
                    <option key={lang} value={lang}>{languageNames[lang]}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
