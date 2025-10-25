import { Order, OrderId, OrderStatusValue } from '@/domain/order-aggregate';
import { OrderRepository, OrderDomainService } from '@/domain/order-aggregate';
import { UpdateOrderStatusCommand } from '../shared/command';
import { OrderDto, OrderItemDto } from '../shared/dto';
import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * オーダーステータス更新サービス
 * 
 * 役割:
 * - 注文のステータスを更新するアプリケーションサービス
 * - ステータス遷移のビジネスルールを管理
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. ドメインサービスでステータス遷移の検証
 * 3. ステータスに応じた処理
 * 4. **キャンセル時は在庫を戻す**
 * 5. データベースに保存
 * 6. DTOに変換して返却
 * 
 * 重要な処理:
 * - CANCELLED: 注文をキャンセルし、在庫を戻す
 * - CONFIRMED: 注文を確定
 * - SHIPPED: 出荷済みに更新
 * - DELIVERED: 配送完了に更新
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
        
        // キャンセル時は在庫を戻す（トランザクション内で実行）
        await prisma.$transaction(async (tx) => {
          // 注文ステータスを更新
          await tx.order.update({
            where: { id: updatedOrder.id.value },
            data: {
              status: updatedOrder.status.value,
              updatedAt: updatedOrder.updatedAt.value,
            },
          });

          // 注文アイテムごとに在庫を戻す
          for (const item of updatedOrder.items) {
            await tx.product.update({
              where: { id: item.productId.value },
              data: {
                stock: {
                  increment: item.quantity.value, // 在庫を加算
                },
              },
            });
          }
        });

        // DTOに変換して返却（トランザクション後）
        return this.toOrderDto(updatedOrder);
        
      default:
        throw new Error('Invalid status transition');
    }

    // リポジトリに保存（キャンセル以外）
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
