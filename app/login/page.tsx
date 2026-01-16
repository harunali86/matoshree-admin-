'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push(redirect);
            router.refresh();
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{ width: '100%', maxWidth: 360, padding: 24 }}>
                {/* Brand */}
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#fafafa',
                        letterSpacing: '-0.02em',
                    }}>
                        Matoshree
                    </h1>
                    <p style={{ fontSize: 14, color: '#737373', marginTop: 6 }}>
                        Admin Dashboard
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#1c1917',
                        border: '1px solid #292524',
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 20,
                        color: '#fca5a5',
                        fontSize: 13,
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#a3a3a3',
                            marginBottom: 6,
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                height: 40,
                                padding: '0 12px',
                                background: '#171717',
                                border: '1px solid #262626',
                                borderRadius: 6,
                                color: '#fafafa',
                                fontSize: 14,
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#a3a3a3',
                            marginBottom: 6,
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    height: 40,
                                    padding: '0 40px 0 12px',
                                    background: '#171717',
                                    border: '1px solid #262626',
                                    borderRadius: 6,
                                    color: '#fafafa',
                                    fontSize: 14,
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#525252',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: 40,
                            background: loading ? '#262626' : '#fafafa',
                            border: 'none',
                            borderRadius: 6,
                            color: loading ? '#737373' : '#0a0a0a',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: loading ? 'wait' : 'pointer',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Continue'}
                    </button>
                </form>

                <p style={{
                    marginTop: 32,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#525252',
                }}>
                    Protected area • Admin only
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
            <LoginForm />
        </Suspense>
    );
}
