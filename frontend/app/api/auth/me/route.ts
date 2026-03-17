import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export const runtime = 'nodejs';

/**
 * GET /api/auth/me
 * 
 * Returns the current authenticated user based on session token
 */
export async function GET(req: NextRequest) {
  try {
    const result = await getSessionFromRequest();

    if (!result.valid) {
      // Return 200 with null user to avoid console errors
      return NextResponse.json(
        { success: false, user: null },
        { status: 200 }
      );
    }

    // Update last activity
    try {
      const prismaModule = await import('@/lib/prisma');
      const prisma = prismaModule.prisma;

      await prisma.userSession.update({
        where: { id: BigInt(result.session.id) },
        data: { lastActivityAt: new Date() },
      });

      await prisma.user.update({
        where: { id: BigInt(result.session.userId) },
        data: { lastActivityAt: new Date() },
      });
    } catch (updateError) {
      console.error('Error updating last activity:', updateError);
      // Non-critical, continue
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/auth/me error:', error);
    console.error('Error stack:', error.stack);

    // Handle Prisma client not generated
    if (error.message?.includes('PrismaClient') || error.message?.includes('Cannot find module')) {
      return NextResponse.json(
        { error: 'Database client not initialized. Please run: npx prisma generate' },
        { status: 500 }
      );
    }

    // Return error in JSON format
    return NextResponse.json(
      {
        error: 'Failed to get user',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR',
        name: error.name || 'Error'
      },
      { status: 500 }
    );
  }
}

