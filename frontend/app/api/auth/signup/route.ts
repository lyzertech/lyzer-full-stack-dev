import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST /api/auth/signup
 * 
 * Creates a new user account with email and password
 */
export async function POST(req: NextRequest) {
  try {
    // Dynamically import prisma to catch initialization errors
    let prisma;
    let UserStatus, ProfileVisibility, AuditSeverity;

    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;

      const prismaTypes = await import('@/lib/generated/prisma');
      UserStatus = prismaTypes.UserStatus;
      ProfileVisibility = prismaTypes.ProfileVisibility;
      AuditSeverity = prismaTypes.AuditSeverity;
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

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, displayName } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get client IP address
    const ipAddress = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Generate username from email
    const generateUsername = (email: string): string => {
      const baseUsername = email.split('@')[0].toLowerCase()
        .replace(/[^a-z0-9_]/g, '_'); // Replace special chars with underscore
      return baseUsername;
    };

    // Check if username exists and add random suffix if needed
    let username = generateUsername(email);
    let isUsernameUnique = false;
    let attempts = 0;

    while (!isUsernameUnique && attempts < 10) {
      const existingProfile = await prisma.exploreUser.findUnique({
        where: { username },
      });

      if (!existingProfile) {
        isUsernameUnique = true;
      } else {
        // Add random number suffix
        username = `${generateUsername(email)}_${Math.floor(Math.random() * 10000)}`;
        attempts++;
      }
    }

    // Create new user in database with social profile
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName || null,
        emailVerified: false,
        status: UserStatus.Active,
        isActive: true,
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
        lastLoginIp: ipAddress,
        passwordChangedAt: new Date(),
        // Auto-create social profile
        exploreProfile: {
          create: {
            username: username,
            displayName: displayName || email.split('@')[0],
            email: email,
            bio: null,
            avatar: null,
            isPrivate: false,
            isVerified: false,
            isActive: true,
          },
        },
      },
    });

    // Create default user settings
    try {
      await prisma.userSettings.create({
        data: {
          userId: newUser.id,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          profileVisibility: ProfileVisibility.Public,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          itemsPerPage: 20,
          autoSave: true,
        },
      });
    } catch (settingsError) {
      console.error('Error creating user settings:', settingsError);
      // Continue - settings can be created later
    }

    // Assign default 'user' role if it exists
    try {
      const userRole = await prisma.role.findUnique({
        where: { slug: 'user' },
      });

      if (userRole) {
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userRole.id,
            isActive: true,
            assignedAt: new Date(),
          },
        });
      }
    } catch (roleError) {
      console.error('Error assigning default role:', roleError);
      // Continue - role can be assigned later
    }

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'user_signup',
          resource: 'auth_users',
          resourceId: newUser.id.toString(),
          description: `New user signed up: ${email}`,
          severity: AuditSeverity.Info,
          createdAt: new Date(),
        },
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Continue - audit log is not critical
    }

    // Return user data (without password, using serializer for BigInt safety)
    const { serializeUser } = await import('@/lib/auth/serializers');

    return NextResponse.json(
      {
        success: true,
        user: serializeUser(newUser),
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/auth/signup error:', error);
    console.error('Error stack:', error.stack);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

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
        error: 'Failed to create user',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
