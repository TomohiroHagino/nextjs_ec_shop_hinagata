import { BaseCommand } from './base-command';

/**
 * プロダクト作成コマンド
 */
export class CreateProductCommand extends BaseCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl?: string,
  ) {
    super();
  }

  validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Product name is required');
    }

    if (!this.description || typeof this.description !== 'string') {
      throw new Error('Product description is required');
    }

    if (typeof this.price !== 'number' || this.price < 0) {
      throw new Error('Price must be a non-negative number');
    }

    if (typeof this.stock !== 'number' || this.stock < 0) {
      throw new Error('Stock must be a non-negative number');
    }
  }
}
