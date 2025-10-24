import { Cart, CartId } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { GetCartQuery } from '../shared/query';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カート取得サービス
 */
export class GetCartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartDomainService: CartDomainService,
  ) {}

  async execute(query: GetCartQuery): Promise<CartDto> {
    query.validate();

    const userId = new UserId(query.userId);

    // カートを取得または作成
    const cart = await this.cartDomainService.getOrCreateUserCart(userId);

    // DTOに変換して返却
    return this.toCartDto(cart);
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
