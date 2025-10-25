import { Product, ProductId, Price, ProductName, Description } from '@/domain/product-aggregate';
import { ProductRepository } from '@/domain/product-aggregate';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';
import { PrismaClient } from '@prisma/client';

/**
 * プロダクトリポジトリ実装
 */
export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ProductId): Promise<Product | null> {
    const productData = await this.prisma.product.findUnique({
      where: { id: id.value },
    });

    if (!productData) {
      return null;
    }

    return Product.reconstruct(
      new ProductId(productData.id),
      new ProductName(productData.name),
      new Description(productData.description),
      new Price(Number(productData.price)),
      productData.stock,
      productData.imageUrl,
      productData.isActive,
      new CreatedAt(productData.createdAt),
      new UpdatedAt(productData.updatedAt),
    );
  }

  async findAll(): Promise<Product[]> {
    const productsData = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return productsData.map(data => Product.reconstruct(
      new ProductId(data.id),
      new ProductName(data.name),
      new Description(data.description),
      new Price(Number(data.price)),
      data.stock,
      data.imageUrl,
      data.isActive,
      new CreatedAt(data.createdAt),
      new UpdatedAt(data.updatedAt),
    ));
  }

  async findActive(): Promise<Product[]> {
    const productsData = await this.prisma.product.findMany({
      where: { 
        isActive: true,
        stock: {
          gt: 0, // 在庫が1以上の商品のみ
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return productsData.map(data => Product.reconstruct(
      new ProductId(data.id),
      new ProductName(data.name),
      new Description(data.description),
      new Price(Number(data.price)),
      data.stock,
      data.imageUrl,
      data.isActive,
      new CreatedAt(data.createdAt),
      new UpdatedAt(data.updatedAt),
    ));
  }

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.id.value },
      update: {
        name: product.name.value,
        description: product.description.value,
        price: product.price.value,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        updatedAt: product.updatedAt.value,
      },
      create: {
        id: product.id.value,
        name: product.name.value,
        description: product.description.value,
        price: product.price.value,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        createdAt: product.createdAt.value,
        updatedAt: product.updatedAt.value,
      },
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.prisma.product.delete({
      where: { id: id.value },
    });
  }

  async findByName(name: string): Promise<Product[]> {
    const productsData = await this.prisma.product.findMany({
      where: {
        name: {
          contains: name,
        },
        isActive: true, // アクティブな商品のみ
        stock: {
          gt: 0, // 在庫が1以上の商品のみ
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return productsData.map(data => Product.reconstruct(
      new ProductId(data.id),
      new ProductName(data.name),
      new Description(data.description),
      new Price(Number(data.price)),
      data.stock,
      data.imageUrl,
      data.isActive,
      new CreatedAt(data.createdAt),
      new UpdatedAt(data.updatedAt),
    ));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const productsData = await this.prisma.product.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        isActive: true, // アクティブな商品のみ
        stock: {
          gt: 0, // 在庫が1以上の商品のみ
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return productsData.map(data => Product.reconstruct(
      new ProductId(data.id),
      new ProductName(data.name),
      new Description(data.description),
      new Price(Number(data.price)),
      data.stock,
      data.imageUrl,
      data.isActive,
      new CreatedAt(data.createdAt),
      new UpdatedAt(data.updatedAt),
    ));
  }
}