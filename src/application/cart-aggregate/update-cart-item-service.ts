import { Cart } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { Quantity } from '@/domain/cart-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { UpdateCartItemCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カートアイテム数量更新サービス
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

    // リポジトリに保存
    await this.cartRepository.save(updatedCart);

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
