import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { UpdateCartItemCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';
import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * カートアイテム数量更新サービス（UpdateCartItemService）
 * 
 * 役割:
 * - カート内の特定アイテムの数量を変更するアプリケーションサービス
 * - 商品の購入数量を調整する
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. ドメインサービスでビジネスルール検証（在庫確認など）
 * 3. カートの取得
 * 4. 指定されたアイテムの数量を更新
 * 5. **トランザクション内でデータベースに保存**
 * 6. DTOに変換して返却
 * 
 * 使用場面:
 * - PUT /api/cart/:itemId のリクエスト処理
 * - カートページで数量を変更
 * - 商品の購入数を増減
 * 
 * 依存関係:
 * - CartRepository: カートの永続化
 * - CartDomainService: ビジネスルールの検証
 * 
 * 注意点:
 * - アイテムが存在しない場合はエラーを投げる
 * - 在庫数を超える場合はエラーを投げる
 * - 更新後はカートの合計金額が再計算される
 * - 数量が0の場合はアイテムを削除する
 * - **トランザクション管理でカートとアイテムの整合性を保証**
 */
export class UpdateCartItemService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartDomainService: CartDomainService,
  ) {}

  async execute(command: UpdateCartItemCommand): Promise<CartDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const newQuantity = new Quantity(command.quantity);

    // ドメインサービスで検証
    await this.cartDomainService.validateUpdateItem(userId, command.itemId, newQuantity);

    // カートを取得
    const cart = await this.cartDomainService.getOrCreateUserCart(userId);

    // アイテムの数量を更新
    const updatedCart = cart.updateItemQuantity(command.itemId, newQuantity);

    // トランザクション内で直接Prismaを使用
    await prisma.$transaction(async (tx) => {
      // カートを更新
      await tx.cart.update({
        where: { id: updatedCart.id.value },
        data: {
          updatedAt: updatedCart.updatedAt.value,
        },
      });

      // カートアイテムの数量を更新
      await tx.cartItem.update({
        where: { id: command.itemId },
        data: {
          quantity: newQuantity.value,
          updatedAt: new Date(),
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
