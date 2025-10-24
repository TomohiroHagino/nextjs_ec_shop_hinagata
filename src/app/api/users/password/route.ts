import { NextRequest, NextResponse } from 'next/server';
import { ChangePasswordCommand } from '@/application/shared/command';
import { ChangePasswordService } from '@/application/user-aggregate';
import { UserRepositoryImpl } from '@/infrastructure/database/repositories';
import { UserDomainService } from '@/domain/user-aggregate';
import { prisma } from '@/infrastructure/database/prisma/client';
import jwt from 'jsonwebtoken';

function verifyToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const command = new ChangePasswordCommand(
      userId,
      body.currentPassword,
      body.newPassword
    );

    const userRepository = new UserRepositoryImpl(prisma);
    const userDomainService = new UserDomainService(userRepository);
    const changePasswordService = new ChangePasswordService(userRepository, userDomainService);

    await changePasswordService.execute(command);

    return NextResponse.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to change password' 
      },
      { status: 400 }
    );
  }
}

