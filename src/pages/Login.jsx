import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, isAuthChecking } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

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
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Login successful!');
        if (['SUPER_ADMIN', 'CONTENT_ADMIN', 'REVIEW_ADMIN'].includes(result.role)) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const errorMsg = result.error || '';
        if (errorMsg.includes('auth/invalid-credential') || errorMsg.includes('invalid-login-credentials')) {
          toast.error('Invalid email or password. If you haven\'t created an account yet, please register first.');
        } else if (errorMsg.includes('auth/user-not-found')) {
          toast.error('No account found with this email. Please register.');
        } else {
          toast.error(errorMsg || 'Invalid login credentials');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
        <Card className="w-full max-w-md animate-fade-in shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <span className="text-2xl font-bold text-primary-foreground">स</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t('citizenLogin') || 'Login to your account'}</CardTitle>
            <CardDescription>{t('loginDesc') || 'Enter your details below to continue'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                <Input {...register('email')} type="email" placeholder="name@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password *</label>
                <div className="relative">
                <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                <button type="button" aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                {!errors.password && <p className="text-[10px] text-muted-foreground mt-1">Tip: Passwords must be at least 8 characters long.</p>}

                <div className="text-right mt-1.5">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
              
              <div className="bg-muted/50 p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Admin Access (Dev Only):</p>
                <p>Email: <code className="text-primary">admin@schemesarthi.gov.in</code></p>
                <p>Pass: <code className="text-primary">Admin@123</code></p>
                <p className="mt-2 opacity-70">* If this account doesn't work, please <Link to="/register" className="underline">Register</Link> with these exact details to create it.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
