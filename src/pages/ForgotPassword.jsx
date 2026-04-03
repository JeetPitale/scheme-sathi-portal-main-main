import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().email('Valid email is required'),
});

const ForgotPassword = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            // Mock backend call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // throw new Error("Forgot password routing not yet implemented in backend");
            setIsSubmitted(true);
            toast.success('Password reset instructions sent');
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
        }
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
                <Card className="w-full max-w-md animate-fade-in shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            {isSubmitted
                                ? 'If an account with that email exists, we have sent instructions to reset your password.'
                                : 'Enter your email address and we will send you a link to reset your password.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                                    <Input {...register('email')} type="email" placeholder="email@example.com" />
                                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                                </div>

                                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>
                        ) : (
                            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full mt-4">
                                Try another email
                            </Button>
                        )}

                        <div className="mt-6 pt-6 border-t text-center">
                            <Link to="/login" className="text-sm text-primary font-medium hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
