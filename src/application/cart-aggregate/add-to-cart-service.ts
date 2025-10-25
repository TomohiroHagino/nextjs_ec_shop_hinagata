import { Cart, CartItem, CartId, CartItemId, Quantity } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CartRepository, CartDomainService } from '@/domain/cart-aggregate';
import { AddToCartCommand } from '../shared/command';
import { CartDto, CartItemDto } from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * カートアイテム追加サービス（AddToCartService）
 * 
 * 役割:
 * - ユーザーのカートに商品を追加するアプリケーションサービス
 * - ドメインロジックとインフラストラクチャを協調させる
 * 
 * 処理フロー:
 * 1. コマンドのバリデーション
 * 2. ドメインサービスでビジネスルール検証（在庫確認など）
 * 3. カートの取得または作成
 * 4. カートアイテムの作成
 * 5. カートにアイテムを追加
 * 6. **トランザクション内でデータベースに保存**
 * 7. DTOに変換して返却
 * 
 * 使用場面:
 * - POST /api/cart のリクエスト処理
 * - 商品詳細ページからカートに追加
 * - 商品一覧ページからカートに追加
 * 
 * 依存関係:
 * - CartRepository: カートの永続化
 * - CartDomainService: ビジネスルールの検証
 * 
 * 注意点:
 * - 既存の同じ商品がある場合は数量を加算
 * - 在庫切れの場合はエラーを投げる
 * - **トランザクション管理でカートとアイテムの整合性を保証**
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

    // トランザクション内で直接Prismaを使用
    await prisma.$transaction(async (tx) => {
      // カートを保存
      await tx.cart.upsert({
        where: { id: updatedCart.id.value },
        update: {
          userId: updatedCart.userId.value,
          updatedAt: updatedCart.updatedAt.value,
        },
        create: {
          id: updatedCart.id.value,
          userId: updatedCart.userId.value,
          createdAt: updatedCart.createdAt.value,
          updatedAt: updatedCart.updatedAt.value,
        },
      });

      // カートアイテムを保存
      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cartItem.cartId.value,
            productId: cartItem.productId.value,
          },
        },
        update: {
          quantity: cartItem.quantity.value,
          updatedAt: cartItem.updatedAt.value,
        },
        create: {
          id: cartItem.id.value,
          cartId: cartItem.cartId.value,
          productId: cartItem.productId.value,
          quantity: cartItem.quantity.value,
          createdAt: cartItem.createdAt.value,
          updatedAt: cartItem.updatedAt.value,
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
