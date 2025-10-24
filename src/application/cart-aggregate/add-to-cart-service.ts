import { Cart, CartItem, CartId, CartItemId, Quantity } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { AddToCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * カートアイテム追加サービス
 */
export class AddToCartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartDomainService: CartDomainService,
  ) {}

  async execute(command: AddToCartCommand): Promise<CartDto> {
    command.validate();

    const userId = new UserId(command.userId);
    const productId = new ProductId(command.productId);
    const quantity = new Quantity(command.quantity);

    // ドメインサービスで検証
    await this.cartDomainService.validateAddItem(userId, productId, quantity);

    // カートを取得または作成
    const cart = await this.cartDomainService.getOrCreateUserCart(userId);

    // カートアイテムを作成
    const cartItem = CartItem.create(
      new CartItemId(uuidv4()),
      cart.id,
      productId,
      quantity,
    );

    // カートにアイテムを追加
    const updatedCart = cart.addItem(cartItem);

    // リポジトリに保存
    await this.cartRepository.save(updatedCart);
    await this.cartRepository.saveItem(cartItem);

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
