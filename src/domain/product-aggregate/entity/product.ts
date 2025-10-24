import { ProductId, Price, ProductName, Description } from '@/domain/product-aggregate/value-object';
import { CreatedAt, UpdatedAt } from '@/domain/shared/value-object';

/**
 * プロダクトエンティティ
 */
export class Product {
  private constructor(
    private readonly _id: ProductId,
    private readonly _name: ProductName,
    private readonly _description: Description,
    private readonly _price: Price,
    private readonly _stock: number,
    private readonly _imageUrl: string | null,
    private readonly _isActive: boolean,
    private readonly _createdAt: CreatedAt,
    private readonly _updatedAt: UpdatedAt,
  ) {}

  static create(
    id: ProductId,
    name: ProductName,
    description: Description,
    price: Price,
    stock: number,
    imageUrl?: string,
  ): Product {
    this.validateStock(stock);
    this.validateImageUrl(imageUrl);

    const now = new Date();
    return new Product(
      id,
      name,
      description,
      price,
      stock,
      imageUrl || null,
      true,
      new CreatedAt(now),
      new UpdatedAt(now),
    );
  }

  static reconstruct(
    id: ProductId,
    name: ProductName,
    description: Description,
    price: Price,
    stock: number,
    imageUrl: string | null,
    isActive: boolean,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): Product {
    this.validateStock(stock);
    this.validateImageUrl(imageUrl);

    return new Product(
      id,
      name,
      description,
      price,
      stock,
      imageUrl,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  private static validateStock(stock: number): void {
    if (typeof stock !== 'number' || isNaN(stock)) {
      throw new Error('Stock must be a valid number');
    }

    if (stock < 0) {
      throw new Error('Stock must be non-negative');
    }

    if (stock > 999999) {
      throw new Error('Stock must be less than 1,000,000');
    }
  }

  private static validateImageUrl(imageUrl: string | null | undefined): void {
    if (imageUrl === null || imageUrl === undefined) {
      return;
    }

    if (typeof imageUrl !== 'string') {
      throw new Error('Image URL must be a string');
    }

    if (imageUrl.length > 500) {
      throw new Error('Image URL must be less than 500 characters');
    }

    // URL形式の簡単な検証
    try {
      new URL(imageUrl);
    } catch {
      throw new Error('Image URL must be a valid URL');
    }
  }

  get id(): ProductId {
    return this._id;
  }

  get name(): ProductName {
    return this._name;
  }

  get description(): Description {
    return this._description;
  }

  get price(): Price {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * 在庫を減らす
   */
  reduceStock(quantity: number): Product {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }

    return new Product(
      this._id,
      this._name,
      this._description,
      this._price,
      this._stock - quantity,
      this._imageUrl,
      this._isActive,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * 在庫を増やす
   */
  increaseStock(quantity: number): Product {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    return new Product(
      this._id,
      this._name,
      this._description,
      this._price,
      this._stock + quantity,
      this._imageUrl,
      this._isActive,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * プロダクト情報を更新
   */
  update(
    name: ProductName,
    description: Description,
    price: Price,
    imageUrl?: string,
  ): Product {
    Product.validateImageUrl(imageUrl);

    return new Product(
      this._id,
      name,
      description,
      price,
      this._stock,
      imageUrl || this._imageUrl,
      this._isActive,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * プロダクトを無効化
   */
  deactivate(): Product {
    return new Product(
      this._id,
      this._name,
      this._description,
      this._price,
      this._stock,
      this._imageUrl,
      false,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * プロダクトを有効化
   */
  activate(): Product {
    return new Product(
      this._id,
      this._name,
      this._description,
      this._price,
      this._stock,
      this._imageUrl,
      true,
      this._createdAt,
      this._updatedAt.update(),
    );
  }

  /**
   * 在庫があるかチェック
   */
  hasStock(quantity: number): boolean {
    return this._stock >= quantity;
  }

  equals(other: Product): boolean {
    return this._id.equals(other._id);
  }
}
