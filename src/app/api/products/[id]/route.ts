import { NextRequest, NextResponse } from 'next/server';
import { GetProductQuery } from '@/application/shared/query';
import { GetProductService } from '@/application/product-aggregate';
import { ProductRepositoryImpl } from '@/infrastructure/database/repositories';
import { ProductDomainService } from '@/domain/product-aggregate';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = new GetProductQuery(id);

    const productRepository = new ProductRepositoryImpl(prisma);
    const productDomainService = new ProductDomainService(productRepository);
    const getProductService = new GetProductService(productRepository, productDomainService);

    const productDto = await getProductService.execute(query);

    return NextResponse.json(
      { success: true, data: productDto },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Product not found' 
      },
      { status: 404 }
    );
  }
}
