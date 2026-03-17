import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/auth/signin
 * 
 * Authenticates a user with email and password
 * Creates a session and returns user data
 */
export async function POST(req: NextRequest) {
  try {
    // Dynamically import prisma to catch initialization errors
    let prisma;
    let AuditSeverity, UserStatus;

    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;

      const prismaTypes = await import('@/lib/generated/prisma');
      AuditSeverity = prismaTypes.AuditSeverity;
      UserStatus = prismaTypes.UserStatus;
    } catch (prismaError: any) {
      console.error('Failed to import Prisma:', prismaError);
      return NextResponse.json(
        {
          error: 'Database connection error',
          details: prismaError.message || 'Prisma client initialization failed',
          hint: 'Please ensure Prisma client is properly generated. Run: npx prisma generate --schema=prisma/schema.prisma'
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password (database auth user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive || user.status !== UserStatus.Active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      );
    }

    // Check if user is deleted
    if (user.deletedAt !== null) {
      return NextResponse.json(
        { error: 'Account has been deleted' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Create audit log for failed login
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'login_failed',
            resource: 'auth_users',
            resourceId: user.id.toString(),
            description: 'Failed login attempt - invalid password',
            severity: AuditSeverity.Warning,
            createdAt: new Date(),
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get client IP address
    const ipAddress = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session in database
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Create audit log for successful login
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'login_success',
          resource: 'auth_users',
          resourceId: user.id.toString(),
          description: 'User logged in successfully',
          severity: AuditSeverity.Info,
          createdAt: new Date(),
        },
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    // Return user data (without password, using serializer for BigInt safety)
    const { serializeUser } = await import('@/lib/auth/serializers');

    // Refetch user with roles for proper serialization
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
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
    });

    return NextResponse.json(
      {
        success: true,
        user: serializeUser(userWithRoles!),
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/auth/signin error:', error);

    return NextResponse.json(
      { error: 'Failed to authenticate user', details: error.message },
      { status: 500 }
    );
  }
}

