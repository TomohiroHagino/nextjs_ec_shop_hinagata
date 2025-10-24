import { NextRequest, NextResponse } from 'next/server';
import { RemoveFromCartCommand, UpdateCartItemCommand, ClearCartCommand } from '@/application/shared/command';
import { RemoveFromCartService, UpdateCartItemService, ClearCartService } from '@/application/cart-aggregate';
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

export async function DELETE(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const command = new RemoveFromCartCommand(userId, itemId);

    const cartRepository = new CartRepositoryImpl(prisma);
    const cartDomainService = new CartDomainService(cartRepository);
    const removeFromCartService = new RemoveFromCartService(cartRepository, cartDomainService);

    const cartDto = await removeFromCartService.execute(command);

    return NextResponse.json(
      { success: true, data: cartDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
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
    
    if (body.action === 'update') {
      const command = new UpdateCartItemCommand(
        userId,
        body.itemId,
        body.quantity,
      );

      const cartRepository = new CartRepositoryImpl(prisma);
      const cartDomainService = new CartDomainService(cartRepository);
      const updateCartItemService = new UpdateCartItemService(cartRepository, cartDomainService);

      const cartDto = await updateCartItemService.execute(command);

      return NextResponse.json(
        { success: true, data: cartDto },
        { status: 200 }
      );
    } else if (body.action === 'clear') {
      const command = new ClearCartCommand(userId);

      const cartRepository = new CartRepositoryImpl(prisma);
      const cartDomainService = new CartDomainService(cartRepository);
      const clearCartService = new ClearCartService(cartRepository, cartDomainService);

      const cartDto = await clearCartService.execute(command);

      return NextResponse.json(
        { success: true, data: cartDto },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update cart error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
  }
}
