import { Product, ProductId } from '@/domain/product-aggregate';
import { ProductRepository, ProductDomainService } from '@/domain/product-aggregate';
import { GetProductQuery } from '../shared/query';
import { ProductDto } from '../shared/dto';

/**
 * プロダクト取得サービス
 */
export class GetProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productDomainService: ProductDomainService,
  ) {}

  async execute(query: GetProductQuery): Promise<ProductDto> {
    query.validate();

    const productId = new ProductId(query.productId);

    // ドメインサービスでプロダクト存在確認
    const product = await this.productDomainService.ensureProductExists(productId);

    // DTOに変換して返却
    return new ProductDto(
      product.id.value,
      product.name.value,
      product.description.value,
      product.price.value,
      product.stock,
      product.imageUrl,
      product.isActive,
      product.createdAt.toString(),
      product.updatedAt.toString(),
    );
  }
}
