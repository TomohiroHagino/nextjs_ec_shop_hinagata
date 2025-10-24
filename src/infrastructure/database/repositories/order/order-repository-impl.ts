import { PrismaClient } from '@prisma/client';
import { Order, OrderItem, OrderId, OrderStatusValue, TotalAmount } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId, Price } from '@/domain/product-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';
import { OrderRepository } from '@/domain/order-aggregate/repository';

export class OrderRepositoryImpl implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  // Prismaから取得した商品情報を一時的に保存
  private productDataCache: Map<string, any> = new Map();

  async findById(id: OrderId): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    return this.toDomainOrder(order);
  }

  async findByUserId(userId: UserId): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId: userId.value },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.toDomainOrder(order));
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.id.value },
      update: {
        userId: order.userId.value,
        status: order.status.value,
        totalAmount: order.totalAmount.value,
        updatedAt: order.updatedAt.value,
      },
      create: {
        id: order.id.value,
        userId: order.userId.value,
        status: order.status.value,
        totalAmount: order.totalAmount.value,
        createdAt: order.createdAt.value,
        updatedAt: order.updatedAt.value,
      },
    });
  }

  async saveItem(item: OrderItem): Promise<void> {
    await this.prisma.orderItem.upsert({
      where: { id: item.id },
      update: {
        quantity: item.quantity.value,
        price: item.price.value,
        updatedAt: item.updatedAt.value,
      },
      create: {
        id: item.id,
        orderId: item.orderId.value,
        productId: item.productId.value,
        quantity: item.quantity.value,
        price: item.price.value,
        createdAt: item.createdAt.value,
        updatedAt: item.updatedAt.value,
      },
    });
  }

  private toDomainOrder(order: any): Order {
    const orderItems = order.orderItems.map((item: any) => {
      // 商品情報をキャッシュに保存
      if (item.product) {
        this.productDataCache.set(item.productId, item.product);
      }
      
      return OrderItem.reconstruct(
        item.id,
        new OrderId(item.orderId),
        new ProductId(item.productId),
        new Quantity(item.quantity),
        new Price(item.price),
        new CreatedAt(item.createdAt),
        new UpdatedAt(item.updatedAt),
      );
    });

    return Order.reconstruct(
      new OrderId(order.id),
      new UserId(order.userId),
      new OrderStatusValue(order.status as any),
      new TotalAmount(order.totalAmount),
      orderItems,
      new CreatedAt(order.createdAt),
      new UpdatedAt(order.updatedAt),
    );
  }
  
  // 商品情報を取得するメソッド
  getProductData(productId: string): any {
    return this.productDataCache.get(productId);
  }

  async countByUserId(userId: UserId): Promise<number> {
    const count = await this.prisma.order.count({
      where: { userId: userId.value },
    });
    return count;
  }

  async findByStatus(status: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.toDomainOrder(order));
  }

  async delete(id: OrderId): Promise<void> {
    await this.prisma.order.delete({
      where: { id: id.value },
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.prisma.orderItem.delete({
      where: { id: itemId },
    });
  }
}
