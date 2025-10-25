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
import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * 注文作成サービス（CreateOrderService）
 * 
 * 役割:
 * - カートの内容から新しい注文を作成するアプリケーションサービス
 * - ショッピングカートから注文への変換を管理
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. 商品情報を取得して注文時の価格を確定
 * 3. 注文アイテムを作成
 * 4. **トランザクション開始**
 * 5. ドメインサービスでビジネスルール検証
 * 6. 注文を作成
 * 7. データベースに保存（注文と注文アイテム）
 * 8. カートをクリア
 * 9. **トランザクション終了（コミットまたはロールバック）**
 * 10. DTOに変換して返却
 * 
 * 使用場面:
 * - POST /api/orders のリクエスト処理
 * - カートページから注文確定
 * - レジに進む操作
 * 
 * 依存関係:
 * - OrderRepository: 注文の永続化
 * - OrderDomainService: ビジネスルールの検証
 * - ProductRepository: 商品情報の取得
 * - CartRepository: カートのクリア
 * 
 * 重要な処理:
 * - 注文時の価格を固定（後で商品価格が変わっても影響なし）
 * - 在庫の確認と減算
 * - 注文確定後はカートがクリアされる
 * - **トランザクション管理でデータ整合性を保証**
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

    // トランザクション内で実行
    const order = await prisma.$transaction(async (tx) => {
      // ドメインサービスで検証
      await this.orderDomainService.validateOrderCreation(userId, orderItems);

      // オーダーを作成
      const order = Order.create(orderId, userId, orderItems);

      // 注文を保存（Prismaを直接使用）
      await tx.order.create({
        data: {
          id: order.id.value,
          userId: order.userId.value,
          status: order.status.value,
          totalAmount: order.totalAmount.value,
          createdAt: order.createdAt.value,
          updatedAt: order.updatedAt.value,
        },
      });

      // 注文アイテムを保存 & 在庫を減らす
      for (const item of orderItems) {
        // 注文アイテムを保存
        await tx.orderItem.create({
          data: {
            id: item.id,
            orderId: order.id.value,
            productId: item.productId.value,
            quantity: item.quantity.value,
            price: item.price.value,
            createdAt: item.createdAt.value,
            updatedAt: item.updatedAt.value,
          },
        });

        // 在庫を減らす（楽観的ロック）
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId.value,
            stock: {
              gte: item.quantity.value, // 在庫が注文数量以上の場合のみ更新
            },
          },
          data: {
            stock: {
              decrement: item.quantity.value, // 在庫を減算
            },
          },
        });

        // 在庫が不足している場合はエラー
        if (updateResult.count === 0) {
          throw new Error(`在庫不足: 商品ID ${item.productId.value} の在庫が不足しています`);
        }
      }

      // 注文作成後、カートをクリア
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: userId.value,
          },
        },
      });
      
      await tx.cart.deleteMany({
        where: {
          userId: userId.value,
        },
      });

      return order;
    });

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
