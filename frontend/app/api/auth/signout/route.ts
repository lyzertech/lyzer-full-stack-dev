import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

/**
 * POST /api/auth/signout
 * 
 * Signs out the current user by invalidating the session
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Dynamically import prisma to catch initialization errors
      let prisma;
      let AuditSeverity;
      try {
        const prismaModule = await import('@/lib/prisma');
        prisma = prismaModule.prisma;
        const prismaTypes = await import('@/lib/generated/prisma');
        AuditSeverity = prismaTypes.AuditSeverity;
      } catch (prismaError: any) {
        console.error('Failed to import Prisma:', prismaError);
        // Continue with signout even if Prisma fails - just clear the cookie
      }

      if (prisma) {
        try {
          // Find the session to get userId before deactivating
          const session = await prisma.userSession.findUnique({
            where: { sessionToken },
            select: { userId: true, id: true },
          });

          // Deactivate session in database
          await prisma.userSession.updateMany({
            where: { sessionToken },
            data: {
              isActive: false,
            },
          });

          // Create audit log for logout
          if (session && AuditSeverity) {
            const ipAddress = req.headers.get('x-forwarded-for') ||
              req.headers.get('x-real-ip') ||
              'unknown';
            const userAgent = req.headers.get('user-agent') || 'unknown';

            await prisma.auditLog.create({
              data: {
                userId: session.userId,
                action: 'logout',
                resource: 'auth_users',
                resourceId: session.userId.toString(),
                description: 'User logged out',
                ipAddress,
                userAgent,
                severity: AuditSeverity.Info,
                createdAt: new Date(),
              },
            });
          }
        } catch (error) {
          console.error('Error deactivating session:', error);
        }
      }
    }

    // Clear session cookie
    cookieStore.delete('session_token');

    return NextResponse.json(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/auth/signout error:', error);

    return NextResponse.json(
      { error: 'Failed to sign out', details: error.message },
      { status: 500 }
    );
  }
}

