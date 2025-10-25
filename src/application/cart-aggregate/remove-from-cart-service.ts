import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { RemoveFromCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';
import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * カートアイテム削除サービス（RemoveFromCartService）
 * 
 * 役割:
 * - カートから特定のアイテムを削除するアプリケーションサービス
 * - カート内の不要な商品を完全に除去する
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. ドメインサービスでビジネスルール検証
 * 3. カートの取得
 * 4. 指定されたアイテムを削除
 * 5. **トランザクション内でデータベースに保存（カートとアイテムの両方）**
 * 6. DTOに変換して返却
 * 
 * 使用場面:
 * - DELETE /api/cart/:itemId のリクエスト処理
 * - カートページでアイテムを削除
 * - 商品を完全にカートから除去
 * 
 * 依存関係:
 * - CartRepository: カートとアイテムの永続化
 * - CartDomainService: ビジネスルールの検証
 * 
 * 注意点:
 * - アイテムが存在しない場合はエラーを投げる
 * - カートアイテムとカートの両方を更新
 * - 削除後はカートの合計金額が再計算される
 * - **トランザクション管理でカートとアイテムの整合性を保証**
 */
export class RemoveFromCartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartDomainService: CartDomainService,
  ) {}

  async execute(command: RemoveFromCartCommand): Promise<CartDto> {
    command.validate();

    const userId = new UserId(command.userId);

    // ドメインサービスで検証
    await this.cartDomainService.validateRemoveItem(userId, command.itemId);

    // カートを取得
    const cart = await this.cartDomainService.getOrCreateUserCart(userId);

    // アイテムを削除
    const updatedCart = cart.removeItem(command.itemId);

    // トランザクション内で直接Prismaを使用
    await prisma.$transaction(async (tx) => {
      // カートアイテムを削除
      await tx.cartItem.delete({
        where: { id: command.itemId },
      });

      // カートを更新
      await tx.cart.update({
        where: { id: updatedCart.id.value },
        data: {
          updatedAt: updatedCart.updatedAt.value,
        },
      });
    });

    // DTOに変換して返却
    return this.toCartDto(updatedCart);
  }

  private toCartDto(cart: Cart): CartDto {
    const itemDtos = cart.items.map(item => new CartItemDto(
      item.id.value,
      item.productId.value,
      item.quantity.value,
      undefined, // product情報は後で取得する場合に使用
      item.createdAt.toString(),
      item.updatedAt.toString(),
    ));

    return new CartDto(
      cart.id.value,
      cart.userId.value,
      itemDtos,
      cart.getItemCount(),
      cart.createdAt.toString(),
      cart.updatedAt.toString(),
    );
  }
}
