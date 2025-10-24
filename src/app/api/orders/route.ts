import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderCommand } from '@/application/shared/command';
import { CreateOrderService, GetOrdersService } from '@/application/order-aggregate';
import { GetOrdersQuery } from '@/application/shared/query';
import { OrderRepositoryImpl } from '@/infrastructure/database/repositories';
import { ProductRepositoryImpl } from '@/infrastructure/database/repositories/product/product-repository-impl';
import { CartRepositoryImpl } from '@/infrastructure/database/repositories/cart/cart-repository-impl';
import { OrderDomainService } from '@/domain/order-aggregate';
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
    
    const command = new CreateOrderCommand(
      userId,
      body.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    const orderRepository = new OrderRepositoryImpl(prisma);
    const productRepository = new ProductRepositoryImpl(prisma);
    const cartRepository = new CartRepositoryImpl(prisma);
    const orderDomainService = new OrderDomainService(orderRepository);
    const createOrderService = new CreateOrderService(
      orderRepository, 
      orderDomainService, 
      productRepository,
      cartRepository
    );

    const orderDto = await createOrderService.execute(command);

    return NextResponse.json(
      { success: true, data: orderDto },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    const orderRepository = new OrderRepositoryImpl(prisma);
    const getOrdersService = new GetOrdersService(orderRepository);

    const query = new GetOrdersQuery(userId, page, limit, status);
    const orders = await getOrdersService.execute(query);

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get orders error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
