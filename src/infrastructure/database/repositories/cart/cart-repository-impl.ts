import { PrismaClient } from '@prisma/client';
import { Cart, CartItem, CartId, CartItemId, Quantity } from '@/domain/cart-aggregate';
import { UserId } from '@/domain/user-aggregate/value-object';
import { ProductId } from '@/domain/product-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';
import { CartRepository } from '@/domain/cart-aggregate/repository';

export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: CartId): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: id.value },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) return null;

    return this.toDomainCart(cart);
  }

  async findByUserId(userId: UserId): Promise<Cart | null> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId.value },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) return null;

    return this.toDomainCart(cart);
  }

  async save(cart: Cart): Promise<void> {
    await this.prisma.cart.upsert({
      where: { id: cart.id.value },
      update: {
        userId: cart.userId.value,
        updatedAt: cart.updatedAt.value,
      },
      create: {
        id: cart.id.value,
        userId: cart.userId.value,
        createdAt: cart.createdAt.value,
        updatedAt: cart.updatedAt.value,
      },
    });
  }

  async saveItem(item: CartItem): Promise<void> {
    await this.prisma.cartItem.upsert({
      where: { 
        cartId_productId: {
          cartId: item.cartId.value,
          productId: item.productId.value,
        }
      },
      update: {
        quantity: item.quantity.value,
        updatedAt: item.updatedAt.value,
      },
      create: {
        id: item.id.value,
        cartId: item.cartId.value,
        productId: item.productId.value,
        quantity: item.quantity.value,
        createdAt: item.createdAt.value,
        updatedAt: item.updatedAt.value,
      },
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async delete(id: CartId): Promise<void> {
    await this.prisma.cart.delete({
      where: { id: id.value },
    });
  }

  async findItemsByUserId(userId: UserId): Promise<CartItem[]> {
    const cart = await this.findByUserId(userId);
    return cart ? cart.items : [];
  }

  private toDomainCart(cart: any): Cart {
    const cartItems = cart.cartItems.map((item: any) =>
      CartItem.reconstruct(
        new CartItemId(item.id),
        new CartId(item.cartId),
        new ProductId(item.productId),
        new Quantity(item.quantity),
        new CreatedAt(item.createdAt),
        new UpdatedAt(item.updatedAt),
      )
    );

    return Cart.reconstruct(
      new CartId(cart.id),
      new UserId(cart.userId),
      cartItems,
      new CreatedAt(cart.createdAt),
      new UpdatedAt(cart.updatedAt),
    );
  }
}
