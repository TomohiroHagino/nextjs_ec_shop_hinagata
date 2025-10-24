import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { ClearCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カートクリアサービス
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
