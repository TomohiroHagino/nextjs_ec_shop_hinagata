import { NextRequest, NextResponse } from 'next/server';
import { RegisterUserCommand } from '@/application/shared/command';
import { RegisterUserService } from '@/application/user-aggregate';
import { UserRepositoryImpl } from '@/infrastructure/database/repositories';
import { UserDomainService } from '@/domain/user-aggregate';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const command = new RegisterUserCommand(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
    );

          const userRepository = new UserRepositoryImpl(prisma);
    const userDomainService = new UserDomainService(userRepository);
    const registerUserService = new RegisterUserService(userRepository, userDomainService);

    const userDto = await registerUserService.execute(command);

    return NextResponse.json(
      { success: true, data: userDto },
      { status: 201 }
    );
  } catch (error) {
    console.error('User registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
  }
}
