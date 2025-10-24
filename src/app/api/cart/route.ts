import { NextRequest, NextResponse } from 'next/server';
import { AddToCartCommand } from '@/application/shared/command';
import { GetCartQuery } from '@/application/shared/query';
import { AddToCartService, GetCartService } from '@/application/cart-aggregate';
import { CartRepositoryImpl } from '@/infrastructure/database/repositories';
import { CartDomainService } from '@/domain/cart-aggregate';
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

export async function POST(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const command = new AddToCartCommand(
      userId,
      body.productId,
      body.quantity,
    );

    const cartRepository = new CartRepositoryImpl(prisma);
    const cartDomainService = new CartDomainService(cartRepository);
    const addToCartService = new AddToCartService(cartRepository, cartDomainService);

    const cartDto = await addToCartService.execute(command);

    return NextResponse.json(
      { success: true, data: cartDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
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

    const cartRepository = new CartRepositoryImpl(prisma);
    const cartDomainService = new CartDomainService(cartRepository);
    const getCartService = new GetCartService(cartRepository, cartDomainService);

    const query = new GetCartQuery(userId);
    const cartDto = await getCartService.execute(query);

    return NextResponse.json(
      { success: true, data: cartDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cart error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
