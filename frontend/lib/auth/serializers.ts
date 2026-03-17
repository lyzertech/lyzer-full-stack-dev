/**
 * User and Session Serializers
 * 
 * Handle BigInt to string conversion and sensitive field removal
 * for safe JSON serialization
 */

import { User, UserSession, UserRole, Role, RolePermission, Permission } from '@/lib/generated/prisma';

// List of sensitive fields that should never be returned to clients
const SENSITIVE_USER_FIELDS = [
    'password',
    'twoFactorSecret',
] as const;

const SENSITIVE_SESSION_FIELDS = [
    'sessionToken',
    'refreshToken',
] as const;

/**
 * Type for user with optional relations
 */
type UserWithRelations = User & {
    roles?: (UserRole & {
        role: Role & {
            permissions?: (RolePermission & {
                permission: Permission;
            })[];
        };
    })[];
    userSettings?: any;
};

/**
 * Type for session with optional user relation
 */
type SessionWithUser = UserSession & {
    user?: UserWithRelations;
};

/**
 * Serialized user type (safe for JSON)
 */
export interface SerializedUser {
    id: string;
    firebaseUid: string | null;
    email: string;
    emailVerified: boolean;
    displayName: string | null;
    photoUrl: string | null;
    phoneNumber: string | null;
    phoneVerified: boolean;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    bio: string | null;
    timezone: string;
    locale: string;
    language: string;
    status: string;
    isActive: boolean;
    isSuspended: boolean;
    suspendedUntil: string | null;
    suspensionReason: string | null;
    lastLoginAt: string | null;
    lastLoginIp: string | null;
    lastActivityAt: string | null;
    passwordChangedAt: string | null;
    twoFactorEnabled: boolean;
    tenantId: string | null;
    metadata: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    roles?: SerializedUserRole[];
}

/**
 * Serialized user role type
 */
export interface SerializedUserRole {
    id: string;
    userId: string;
    roleId: number;
    assignedBy: string | null;
    assignedAt: string;
    expiresAt: string | null;
    isActive: boolean;
    role: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isSystem: boolean;
        isActive: boolean;
        permissions?: {
            id: number;
            name: string;
            slug: string;
            resource: string;
            action: string;
            description: string | null;
        }[];
    };
}

/**
 * Serialized session type (safe for JSON)
 */
export interface SerializedSession {
    id: string;
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
    deviceType: string | null;
    deviceId: string | null;
    location: string | null;
    isActive: boolean;
    expiresAt: string;
    lastActivityAt: string | null;
    createdAt: string;
    user?: SerializedUser;
}

/**
 * Serialize a BigInt to string
 */
function serializeBigInt(value: bigint | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    return value.toString();
}

/**
 * Serialize a Date to ISO string
 */
function serializeDate(value: Date | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    return value.toISOString();
}

/**
 * Serialize a User object for JSON response
 * Removes sensitive fields and converts BigInt to string
 */
export function serializeUser(user: UserWithRelations): SerializedUser {
    const serialized: SerializedUser = {
        id: serializeBigInt(user.id) as string,
        firebaseUid: user.firebaseUid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: serializeDate(user.dateOfBirth),
        gender: user.gender,
        bio: user.bio,
        timezone: user.timezone,
        locale: user.locale,
        language: user.language,
        status: user.status,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        suspendedUntil: serializeDate(user.suspendedUntil),
        suspensionReason: user.suspensionReason,
        lastLoginAt: serializeDate(user.lastLoginAt),
        lastLoginIp: user.lastLoginIp,
        lastActivityAt: serializeDate(user.lastActivityAt),
        passwordChangedAt: serializeDate(user.passwordChangedAt),
        twoFactorEnabled: user.twoFactorEnabled,
        tenantId: serializeBigInt(user.tenantId),
        metadata: user.metadata,
        createdAt: serializeDate(user.createdAt) as string,
        updatedAt: serializeDate(user.updatedAt),
        deletedAt: serializeDate(user.deletedAt),
    };

    // Serialize roles if included
    if (user.roles) {
        serialized.roles = user.roles.map((userRole) => ({
            id: serializeBigInt(userRole.id) as string,
            userId: serializeBigInt(userRole.userId) as string,
            roleId: userRole.roleId,
            assignedBy: serializeBigInt(userRole.assignedBy),
            assignedAt: serializeDate(userRole.assignedAt) as string,
            expiresAt: serializeDate(userRole.expiresAt),
            isActive: userRole.isActive,
            role: {
                id: userRole.role.id,
                name: userRole.role.name,
                slug: userRole.role.slug,
                description: userRole.role.description,
                isSystem: userRole.role.isSystem,
                isActive: userRole.role.isActive,
                permissions: userRole.role.permissions?.map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    slug: rp.permission.slug,
                    resource: rp.permission.resource,
                    action: rp.permission.action,
                    description: rp.permission.description,
                })),
            },
        }));
    }

    return serialized;
}

/**
 * Serialize a UserSession object for JSON response
 * Removes sensitive fields and converts BigInt to string
 */
export function serializeSession(session: SessionWithUser): SerializedSession {
    const serialized: SerializedSession = {
        id: serializeBigInt(session.id) as string,
        userId: serializeBigInt(session.userId) as string,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        deviceType: session.deviceType,
        deviceId: session.deviceId,
        location: session.location,
        isActive: session.isActive,
        expiresAt: serializeDate(session.expiresAt) as string,
        lastActivityAt: serializeDate(session.lastActivityAt),
        createdAt: serializeDate(session.createdAt) as string,
    };

    // Serialize user if included
    if (session.user) {
        serialized.user = serializeUser(session.user);
    }

    return serialized;
}
