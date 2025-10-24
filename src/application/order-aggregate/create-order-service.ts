import { Order, OrderItem, OrderId, OrderStatusValue, TotalAmount } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId, Price } from '@/domain/product-aggregate/value-object';
import { ProductRepository } from '@/domain/product-aggregate/repository';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { CartRepository } from '@/domain/cart-aggregate/repository';
import { OrderRepository, OrderDomainService } from '@/domain/order-aggregate';
import { CreateOrderCommand, OrderItemCommand } from '../shared/command';
import { OrderDto, OrderItemDto } from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * オーダー作成サービス
 */
export class CreateOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const orderId = new OrderId(uuidv4());

    // オーダーアイテムを作成（商品価格を取得）
    const orderItems = await Promise.all(
      command.items.map(async (item) => {
        const product = await this.productRepository.findById(new ProductId(item.productId));
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        
        return OrderItem.create(
          uuidv4(),
          orderId,
          new ProductId(item.productId),
          new Quantity(item.quantity),
          product.price, // 商品の実際の価格を使用
        );
      })
    );

    // ドメインサービスで検証
    await this.orderDomainService.validateOrderCreation(userId, orderItems);

    // オーダーを作成
    const order = Order.create(orderId, userId, orderItems);

    // リポジトリに保存
    await this.orderRepository.save(order);
    for (const item of orderItems) {
      await this.orderRepository.saveItem(item);
    }

    // 注文作成後、カートをクリア
    const cart = await this.cartRepository.findByUserId(userId);
    if (cart) {
      await this.cartRepository.delete(cart.id);
    }

    // DTOに変換して返却
    return this.toOrderDto(order);
  }

  private toOrderDto(order: Order): OrderDto {
    const itemDtos = order.items.map(item => new OrderItemDto(
      item.id,
      item.productId.value,
      item.quantity.value,
      item.price.value,
      item.getSubtotal().value,
      undefined, // product情報は後で取得する場合に使用
      item.createdAt.toString(),
      item.updatedAt.toString(),
    ));

    return new OrderDto(
      order.id.value,
      order.userId.value,
      order.status.value,
      order.totalAmount.value,
      itemDtos,
      order.getItemCount(),
      order.createdAt.toString(),
      order.updatedAt.toString(),
    );
  }
}
