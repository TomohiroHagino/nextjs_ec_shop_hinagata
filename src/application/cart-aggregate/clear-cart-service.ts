import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { ClearCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カートクリアサービス（ClearCartService）
 * 
 * 役割:
 * - ユーザーのカート内のすべてのアイテムを削除するアプリケーションサービス
 * - カートを空の状態にリセットする
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. カートの取得
 * 3. カートをクリア（すべてのアイテムを削除）
 * 4. データベースに保存
 * 5. DTOに変換して返却
 * 
 * 使用場面:
 * - DELETE /api/cart のリクエスト処理
 * - 注文確定後のカートクリア
 * - ユーザーがカートをリセット
 * - 管理者によるカートクリア
 * 
 * 依存関係:
 * - CartRepository: カートの永続化
 * - CartDomainService: カートの取得
 * 
 * 注意点:
 * - カートが空の場合でもエラーにならない
 * - この操作は元に戻せない
 * - カートアイテムの個別削除は別のサービスで行う
 * - トランザクション管理が必要
 */
export class ClearCartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartDomainService: CartDomainService,
  ) {}

  async execute(command: ClearCartCommand): Promise<CartDto> {
    command.validate();

    const userId = new UserId(command.userId);

    // カートを取得
    const cart = await this.cartDomainService.getOrCreateUserCart(userId);

    // カートをクリア
    const clearedCart = cart.clear();

    // リポジトリに保存
    await this.cartRepository.save(clearedCart);

    // DTOに変換して返却
    return this.toCartDto(clearedCart);
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
