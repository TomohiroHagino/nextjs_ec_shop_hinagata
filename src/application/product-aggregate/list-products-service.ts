import { Product } from '@/domain/product-aggregate';
import { ProductRepository } from '@/domain/product-aggregate';
import { GetProductsQuery } from '../shared/query';
import { ProductDto } from '../shared/dto';

/**
 * プロダクト一覧取得サービス
 */
export class ListProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsQuery): Promise<ProductDto[]> {
    query.validate();

    let products: Product[];

    if (query.search) {
      // 名前で検索
      products = await this.productRepository.findByName(query.search);
    } else if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      // 価格範囲で検索
      const minPrice = query.minPrice || 0;
      const maxPrice = query.maxPrice || Number.MAX_SAFE_INTEGER;
      products = await this.productRepository.findByPriceRange(minPrice, maxPrice);
    } else {
      // 全件取得
      products = await this.productRepository.findActive();
    }

    // ページネーション適用
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // DTOに変換して返却
    return paginatedProducts.map(product => new ProductDto(
      product.id.value,
      product.name.value,
      product.description.value,
      product.price.value,
      product.stock,
      product.imageUrl,
      product.isActive,
      product.createdAt.toString(),
      product.updatedAt.toString(),
    ));
  }
}
