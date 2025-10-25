import { NextRequest, NextResponse } from 'next/server';
import { AuthenticateUserService } from '@/application/user-aggregate';
import { UserRepositoryImpl } from '@/infrastructure/database/repositories';
import { UserDomainService } from '@/domain/user-aggregate';
import { prisma } from '@/infrastructure/database/prisma/client';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userRepositoryImpl = new UserRepositoryImpl(prisma);
    const userDomainService = new UserDomainService(userRepositoryImpl);
    const authenticateUserService = new AuthenticateUserService(userRepositoryImpl, userDomainService);

    const userDto = await authenticateUserService.execute(body.email, body.password);

    // JWTトークンを生成
    const token = jwt.sign(
      { userId: userDto.id, email: userDto.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          user: userDto,
          token 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User authentication error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      },
      { status: 401 }
    );
  }
}
