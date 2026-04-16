'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
    username: string;
    email: string;
    name: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface UseAuthReturn {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

/**
 * useAuth Hook
 * Manages client-side authentication state and provides auth utilities
 * 
 * Usage:
 * const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Decode JWT without verification (client-side only - don't trust for security)
    const decodeToken = useCallback((token: string): AuthUser | null => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const decoded = JSON.parse(atob(parts[1]));

            // Check if token is expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                return null;
            }

            return decoded;
        } catch (err) {
            console.error('[Auth] Token decode error:', err);
            return null;
        }
    }, []);

    // Fetch current auth state from server
    const refreshAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/me', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                setUser(null);
            } else {
                setError('Failed to refresh auth');
            }
        } catch (err) {
            console.error('[Auth] Refresh error:', err);
            setError(err instanceof Error ? err.message : 'Auth error');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    // Logout handler
    const logout = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                setError(null);
                router.push('/login');
                router.refresh();
            } else {
                setError('Logout failed');
            }
        } catch (err) {
            console.error('[Auth] Logout error:', err);
            setError(err instanceof Error ? err.message : 'Logout error');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        logout,
        refreshAuth,
    };
}
