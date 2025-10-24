import { NextRequest, NextResponse } from 'next/server';
import { CreateProductCommand } from '@/application/shared/command';
import { GetProductsQuery } from '@/application/shared/query';
import { CreateProductService, ListProductsService } from '@/application/product-aggregate';
import { ProductRepositoryImpl } from '@/infrastructure/database/repositories';
import { ProductDomainService } from '@/domain/product-aggregate';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const command = new CreateProductCommand(
      body.name,
      body.description,
      body.price,
      body.stock,
      body.imageUrl,
    );

          const productRepository = new ProductRepositoryImpl(prisma);
    const productDomainService = new ProductDomainService(productRepository);
    const createProductService = new CreateProductService(productRepository, productDomainService);

    const productDto = await createProductService.execute(command);

    return NextResponse.json(
      { success: true, data: productDto },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

          const productRepository = new ProductRepositoryImpl(prisma);
    const listProductsService = new ListProductsService(productRepository);

    const query = new GetProductsQuery(
      page,
      limit,
      search,
      minPrice,
      maxPrice,
    );

    const products = await listProductsService.execute(query);

    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error('Products fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
