import { Order, OrderItem, OrderId, OrderStatusValue, TotalAmount } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId, Price } from '@/domain/product-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
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
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const orderId = new OrderId(uuidv4());

    // オーダーアイテムを作成
    const orderItems = command.items.map(item => 
      OrderItem.create(
        uuidv4(),
        orderId,
        new ProductId(item.productId),
        new Quantity(item.quantity),
        new Price(0), // 実際の実装では商品価格を取得する必要がある
      )
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
