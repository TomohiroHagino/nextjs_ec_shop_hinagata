import { Product, ProductId, Price, ProductName, Description } from '@/domain/product-aggregate';
import { ProductRepository, ProductDomainService } from '@/domain/product-aggregate';
import { CreateProductCommand } from '../shared/command';
import { ProductDto } from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * プロダクト作成サービス
 */
export class CreateProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productDomainService: ProductDomainService,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductDto> {
    command.validate();

    const productId = new ProductId(uuidv4());
    const name = new ProductName(command.name);
    const description = new Description(command.description);
    const price = new Price(command.price);

    // ドメインサービスでビジネスルール検証
    await this.productDomainService.validateProductNameUniqueness(command.name);

    // プロダクトエンティティ作成
    const product = Product.create(
      productId,
      name,
      description,
      price,
      command.stock,
      command.imageUrl,
    );

    // リポジトリに保存
    await this.productRepository.save(product);

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
