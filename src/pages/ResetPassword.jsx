import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oobCode, setOobCode] = useState(null);
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get('oobCode');
        if (!code) {
            toast.error('Invalid or missing reset code');
            navigate('/login');
            return;
        }

        setOobCode(code);
        verifyPasswordResetCode(auth, code)
            .then((verifiedEmail) => {
                setEmail(verifiedEmail);
                setLoading(false);
            })
            .catch((error) => {
                toast.error('Password reset link is invalid or has expired');
                navigate('/forgot-password');
            });
    }, [location, navigate]);

    const onSubmit = async (data) => {
        try {
            await confirmPasswordReset(auth, oobCode, data.password);
            toast.success('Password updated successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
                <Card className="w-full max-w-md animate-fade-in shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">Create New Password</CardTitle>
                        <CardDescription>
                            Resetting password for {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password *</label>
                                <div className="relative">
                                    <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" />
                                    <button type="button" aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
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

                            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ResetPassword;
