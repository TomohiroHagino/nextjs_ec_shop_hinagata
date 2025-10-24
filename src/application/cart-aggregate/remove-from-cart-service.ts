import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { RemoveFromCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カートアイテム削除サービス
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

    // リポジトリに保存
    await this.cartRepository.save(updatedCart);
    await this.cartRepository.deleteItem(command.itemId);

    // DTOに変換して返却
    return this.toCartDto(updatedCart);
  }

  private toCartDto(cart: Cart): CartDto {
    const itemDtos = cart.items.map(item => new CartItemDto(
      item.id.value,
      item.productId.value,
      item.quantity.value,
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
