'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { authService } from '@/services/auth-service';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data.email, data.password, data.name);
            login(response.tokens.accessToken, response.tokens.refreshToken, response.user);
            toast.success('Account created successfully!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsLoading(true);
        try {
            const randomId = Math.random().toString(36).substring(7);
            const email = `guest_${randomId}@demo.com`;
            const password = `guest_${randomId}!`;
            const name = `Guest User`;

            const response = await authService.register(email, password, name);
            login(response.tokens.accessToken, response.tokens.refreshToken, response.user);
            toast.success('Entered Guest Mode!');
        } catch (error) {
            console.error('Guest login failed:', error);
            toast.error('Failed to enter guest mode');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        TaskMaster
                    </h1>
                    <p className="text-slate-400 mt-2">Create your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            {...register('name')}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="John Doe"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-800 text-slate-400">Or</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg font-medium transition-all text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Continue as Guest
                </button>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
