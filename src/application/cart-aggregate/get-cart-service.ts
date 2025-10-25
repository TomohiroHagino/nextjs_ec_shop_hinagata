import { Cart, CartId } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { CartRepositoryImpl } from '@/infrastructure/database/repositories/cart/cart-repository-impl';
import { GetCartQuery } from '../shared/query';
import { CartDto, CartItemDto } from '../shared/dto';

/**
 * カート取得サービス（GetCartService）
 * 
 * 役割:
 * - ユーザーのカート情報を取得するアプリケーションサービス
 * - カートの内容と商品詳細情報を組み合わせて返却
 * 
 * 処理フロー:
 * 1. クエリのバリデーション
 * 2. カートの取得または作成（空のカート）
 * 3. 商品情報を取得してDTOに含める
 * 4. DTOに変換して返却
 * 
 * 使用場面:
 * - GET /api/cart のリクエスト処理
 * - カートページの表示
 * - ヘッダーのカート数表示
 * - 注文確定前のカート内容確認
 * 
 * 依存関係:
 * - CartRepository: カートの永続化
 * - CartDomainService: カートの取得・作成
 * 
 * 特徴:
 * - カートが存在しない場合は空のカートを作成
 * - 商品の詳細情報（名前、価格、画像）を含む
 * - 商品情報はリポジトリのキャッシュから取得
 * - 読み取り専用の操作
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
