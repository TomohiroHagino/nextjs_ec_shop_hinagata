import { NextRequest, NextResponse } from 'next/server';
import { GetUserQuery } from '@/application/shared/query';
import { GetUserService } from '@/application/user-aggregate';
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

export async function GET(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const query = new GetUserQuery(userId);

    const userRepository = new UserRepositoryImpl(prisma);
    const userDomainService = new UserDomainService(userRepository);
    const getUserService = new GetUserService(userRepository, userDomainService);

    const userDto = await getUserService.execute(query);

    return NextResponse.json(
      { success: true, data: userDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('User fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'User not found' 
      },
      { status: 404 }
    );
  }
}
