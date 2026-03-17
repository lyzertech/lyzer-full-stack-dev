/**
 * Session Management Helpers
 * 
 * Provide utilities for extracting and validating sessions from requests
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { serializeUser, SerializedUser } from './serializers';

/**
 * Session validation result
 */
export interface SessionResult {
    valid: boolean;
    user?: SerializedUser;
    session?: any;
    error?: string;
}

/**
 * Get session token from cookies
 */
export async function getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('session_token')?.value || null;
}

/**
 * Get and validate session from request
 * Returns session with user if valid, null otherwise
 */
export async function getSessionFromRequest(): Promise<SessionResult> {
    try {
        const sessionToken = await getSessionToken();

        if (!sessionToken) {
            return { valid: false, error: 'No session token' };
        }

        // Dynamically import prisma
        let prisma;
        try {
            const prismaModule = await import('@/lib/prisma');
            prisma = prismaModule.prisma;
        } catch (prismaError: any) {
            console.error('Failed to import Prisma:', prismaError);
            return { valid: false, error: 'Database connection error' };
        }

        // Find session with user and roles
        const session = await prisma.userSession.findUnique({
            where: { sessionToken },
            include: {
                user: {
                    include: {
                        roles: {
                            where: { isActive: true },
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: {
                                                permission: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Check if session exists and is valid
        if (!session) {
            return { valid: false, error: 'Session not found' };
        }

        if (!session.isActive) {
            return { valid: false, error: 'Session is inactive' };
        }

        if (session.expiresAt < new Date()) {
            return { valid: false, error: 'Session has expired' };
        }

        // Check if user is valid
        const user = session.user;
        if (!user) {
            return { valid: false, error: 'User not found' };
        }

        if (!user.isActive) {
            return { valid: false, error: 'User account is inactive' };
        }

        if (user.isSuspended) {
            return { valid: false, error: 'User account is suspended' };
        }

        if (user.deletedAt !== null) {
            return { valid: false, error: 'User account has been deleted' };
        }

        return {
            valid: true,
            user: serializeUser(user),
            session: session,
        };
    } catch (error: any) {
        console.error('Error getting session:', error);
        return { valid: false, error: 'Failed to validate session' };
    }
}

/**
 * Get current authenticated user from request
 * Updates last activity timestamps
 */
export async function getCurrentUser(): Promise<SerializedUser | null> {
    const result = await getSessionFromRequest();

    if (!result.valid || !result.user || !result.session) {
        return null;
    }

    try {
        // Dynamically import prisma
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.prisma;

        // Update last activity on session
        await prisma.userSession.update({
            where: { id: result.session.id },
            data: { lastActivityAt: new Date() },
        });

        // Update last activity on user
        await prisma.user.update({
            where: { id: result.session.userId },
            data: { lastActivityAt: new Date() },
        });
    } catch (error) {
        console.error('Error updating last activity:', error);
        // Continue - not critical
    }

    return result.user;
}

/**
 * Invalidate a session by token
 */
export async function invalidateSession(sessionToken: string): Promise<boolean> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.prisma;

        await prisma.userSession.updateMany({
            where: { sessionToken },
            data: { isActive: false },
        });

        return true;
    } catch (error) {
        console.error('Error invalidating session:', error);
        return false;
    }
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
    userId: bigint | null,
    action: string,
    resource: string,
    resourceId: string | null,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    severity: 'Info' | 'Warning' | 'Error' | 'Critical' = 'Info'
): Promise<void> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.prisma;
        const { AuditSeverity } = await import('@/lib/generated/prisma');

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                resourceId,
                description,
                ipAddress,
                userAgent,
                severity: AuditSeverity[severity],
                createdAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Non-critical, don't throw
    }
}
