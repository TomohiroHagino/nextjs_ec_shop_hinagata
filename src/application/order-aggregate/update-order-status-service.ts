import { Order, OrderId, OrderStatusValue } from '@/domain/order-aggregate';
import { OrderRepository, OrderDomainService } from '@/domain/order-aggregate';
import { UpdateOrderStatusCommand } from '../shared/command';
import { OrderDto, OrderItemDto } from '../shared/dto';

/**
 * オーダーステータス更新サービス
 */
export class UpdateOrderStatusService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<OrderDto> {
    command.validate();

    const orderId = new OrderId(command.orderId);
    const newStatus = new OrderStatusValue(command.status as any);

    // ドメインサービスで検証
    const order = await this.orderDomainService.validateStatusUpdate(orderId, newStatus);

    // ステータスに応じてオーダーを更新
    let updatedOrder: Order;
    switch (command.status) {
      case 'CONFIRMED':
        updatedOrder = order.confirm();
        break;
      case 'SHIPPED':
        updatedOrder = order.ship();
        break;
      case 'DELIVERED':
        updatedOrder = order.deliver();
        break;
      case 'CANCELLED':
        updatedOrder = order.cancel();
        break;
      default:
        throw new Error('Invalid status transition');
    }

    // リポジトリに保存
    await this.orderRepository.save(updatedOrder);

    // DTOに変換して返却
    return this.toOrderDto(updatedOrder);
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
