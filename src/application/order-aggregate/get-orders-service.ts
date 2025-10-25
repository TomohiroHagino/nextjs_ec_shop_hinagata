import { Order } from '@/domain/order-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { OrderRepository } from '@/domain/order-aggregate';
import { GetOrdersQuery } from '../shared/query';
import { OrderDto, OrderItemDto } from '../shared/dto';

/**
 * オーダー一覧取得サービス
 */
export class GetOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrdersQuery): Promise<OrderDto[]> {
    query.validate();

    const userId = new UserId(query.userId);

    // オーダー一覧を取得
    const orders = await this.orderRepository.findByUserId(userId);

    // ステータスでフィルタリング
    let filteredOrders = orders;
    if (query.status) {
      filteredOrders = orders.filter(order => order.status.value === query.status);
    }

    // ページネーション適用
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // DTOに変換して返却
    return paginatedOrders.map(order => this.toOrderDto(order));
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
