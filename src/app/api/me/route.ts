import { getAuthToken, verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ── Types ────────────────────────────────────────────────────────────────────

type Role = 'admin' | 'branch';

interface UserPayload {
    username: string;
    role: Role;
}

interface MeResponse {
    success: boolean;
    user: {
        username: string;
        name: string;
        role: Role;
        email: string;
    } | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches the user record from the correct table based on role.
 * Returns a normalized shape regardless of the underlying model.
 */
async function fetchUserByRole(username: string, role: Role) {
    if (role === 'admin') {
        const user = await prisma.admin.findUnique({
            where: { username },
            select: { username: true, name: true, email: true }, // ← select only what's needed
        });

        return user ? { ...user, name: user.name } : null;
    }

    const user = await prisma.branchList.findUnique({
        where: { username },
        select: { username: true, branchName: true, email: true },
    });

    return user ? { ...user, name: user.branchName } : null;
}

// ── Handler ──────────────────────────────────────────────────────────────────

/**
 * GET /api/me
 * Returns the currently authenticated user's info.
 * Protected — requires a valid auth token.
 */
export async function GET(_request: NextRequest): Promise<NextResponse<MeResponse>> {
    try {
        // FIX: removed `|| ' '` — a falsy token must return 401, not bypass auth
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json({ success: false, user: null }, { status: 401 });
        }

        const payload = await verifyToken(token) as UserPayload | null;

        // Guard: treat an unverifiable/expired token the same as missing
        if (!payload?.username || !payload?.role) {
            return NextResponse.json({ success: false, user: null }, { status: 401 });
        }

        const { username, role } = payload;

        // Guard: reject unexpected roles early
        if (role !== 'admin' && role !== 'branch') {
            return NextResponse.json({ success: false, user: null }, { status: 403 });
        }

        const user = await fetchUserByRole(username, role);

        // Guard: token valid but user no longer exists in DB
        if (!user) {
            return NextResponse.json({ success: false, user: null }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: { username: user.username, name: user.name, role, email: user.email },
        });

    } catch (error) {
        // console.error('[Auth] /api/me error:', error);
        // FIX: 501 → 500 (Not Implemented vs Internal Server Error)
        return NextResponse.json({ success: false, user: null }, { status: 500 });
    }
}