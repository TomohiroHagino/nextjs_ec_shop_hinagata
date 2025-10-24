import { Order, OrderId } from '@/domain/order-aggregate';
import { OrderRepository, OrderDomainService } from '@/domain/order-aggregate';
import { OrderRepositoryImpl } from '@/infrastructure/database/repositories/order/order-repository-impl';
import { GetOrderQuery } from '../shared/query';
import { OrderDto, OrderItemDto } from '../shared/dto';

/**
 * オーダー取得サービス
 */
export class GetOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(query: GetOrderQuery): Promise<OrderDto> {
    query.validate();

    const orderId = new OrderId(query.orderId);

    // ドメインサービスでオーダー存在確認
    const order = await this.orderDomainService.ensureOrderExists(orderId);

    // DTOに変換して返却
    return this.toOrderDto(order);
  }

  private toOrderDto(order: Order): OrderDto {
    const orderRepoImpl = this.orderRepository as OrderRepositoryImpl;
    
    const itemDtos = order.items.map(item => {
      // リポジトリから商品情報を取得
      const productData = orderRepoImpl.getProductData(item.productId.value);
      
      return new OrderItemDto(
        item.id,
        item.productId.value,
        item.quantity.value,
        item.price.value,
        item.getSubtotal().value,
        productData ? {
          id: productData.id,
          name: productData.name,
          imageUrl: productData.imageUrl,
        } : undefined,
        item.createdAt.toString(),
        item.updatedAt.toString(),
      );
    });

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
