import { NextRequest, NextResponse } from 'next/server';
import { CancelOrderCommand, UpdateOrderStatusCommand } from '@/application/shared/command';
import { GetOrderQuery } from '@/application/shared/query';
import { GetOrderService, CancelOrderService, UpdateOrderStatusService } from '@/application/order-aggregate';
import { OrderRepositoryImpl } from '@/infrastructure/database/repositories';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const query = new GetOrderQuery(id);

    const orderRepository = new OrderRepositoryImpl(prisma);
    const orderDomainService = new OrderDomainService(orderRepository);
    const getOrderService = new GetOrderService(orderRepository, orderDomainService);

    const orderDto = await getOrderService.execute(query);

    return NextResponse.json(
      { success: true, data: orderDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get order error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Order not found' 
      },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const command = new CancelOrderCommand(userId, id);

    const orderRepository = new OrderRepositoryImpl(prisma);
    const orderDomainService = new OrderDomainService(orderRepository);
    const cancelOrderService = new CancelOrderService(orderRepository, orderDomainService);

    const orderDto = await cancelOrderService.execute(command);

    return NextResponse.json(
      { success: true, data: orderDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel order error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = await params;
    
    const command = new UpdateOrderStatusCommand(id, body.status);

    const orderRepository = new OrderRepositoryImpl(prisma);
    const orderDomainService = new OrderDomainService(orderRepository);
    const updateOrderStatusService = new UpdateOrderStatusService(orderRepository, orderDomainService);

    const orderDto = await updateOrderStatusService.execute(command);

    return NextResponse.json(
      { success: true, data: orderDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update order status error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
  }
}
