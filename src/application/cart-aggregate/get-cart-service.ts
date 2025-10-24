import { Cart, CartId } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { CartRepositoryImpl } from '@/infrastructure/database/repositories/cart/cart-repository-impl';
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
    const cartRepoImpl = this.cartRepository as CartRepositoryImpl;
    
    const itemDtos = cart.items.map(item => {
      // リポジトリから商品情報を取得
      const productData = cartRepoImpl.getProductData(item.productId.value);
      
      return new CartItemDto(
        item.id.value,
        item.productId.value,
        item.quantity.value,
        productData ? {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          imageUrl: productData.imageUrl,
        } : undefined,
        item.createdAt.toString(),
        item.updatedAt.toString(),
      );
    });

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
