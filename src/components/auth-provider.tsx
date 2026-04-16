'use client';

import { useAuth, UseAuthReturn } from '@/hooks/use-auth';
import React, { createContext, useContext, ReactNode } from 'react';

/**
 * AuthContext - Provides authentication state to child components
 * 
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * In child components:
 * const { user, isAuthenticated, logout } = useAuthContext();
 */
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use AuthContext
 * Must be used within AuthProvider
 */
export function useAuthContext(): UseAuthReturn {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }

    return context;
}

/**
 * HOC to protect components - requires authentication
 * 
 * Usage:
 * const ProtectedComponent = withAuth(MyComponent);
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
) {
    return function AuthComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuthContext();

        if (isLoading) {
            return <div className="flex items-center justify-center h-screen">Loading...</div>;
        }

        if (!isAuthenticated) {
            return <div className="flex items-center justify-center h-screen">Unauthorized</div>;
        }

        return <Component {...props} />;
    };
}

/**
 * HOC to protect components with role check
 * 
 * Usage:
 * const AdminComponent = withRole('admin')(MyComponent);
 */
export function withRole(requiredRole: string) {
    return function withRoleComponent<P extends object>(
        Component: React.ComponentType<P>
    ) {
        return function RoleComponent(props: P) {
            const { user, isLoading } = useAuthContext();

            if (isLoading) {
                return <div className="flex items-center justify-center h-screen">Loading...</div>;
            }

            if (!user || user.role !== requiredRole) {
                return (
                    <div className="flex items-center justify-center h-screen">
                        Access denied - {requiredRole} role required
                    </div>
                );
            }

            return <Component {...props} />;
        };
    };
}
