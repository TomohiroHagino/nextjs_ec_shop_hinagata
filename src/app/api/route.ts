import { NextResponse } from 'next/server';

/**
 * API ルートエンドポイント
 * 
 * 利用可能なAPIエンドポイント一覧を返します。
 * APIモードで動作している場合の確認や、エンドポイント一覧の取得に使用します。
 */
export async function GET() {
  const isApiOnly = process.env.API_ONLY === 'true';

  return NextResponse.json({
    message: 'ECショップ API',
    version: '1.0.0',
    mode: isApiOnly ? 'API Only' : 'Full Stack',
    description: isApiOnly
      ? 'このサーバーはAPIモードで動作しています。フロントエンドは別のサーバーで提供してください。'
      : 'このサーバーはフルスタックモードで動作しています。フロントエンドとAPIの両方を提供します。',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
      },
      products: {
        list: 'GET /api/products',
        detail: 'GET /api/products/[id]',
        create: 'POST /api/products (admin)',
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart',
        update: 'PUT /api/cart',
        remove: 'DELETE /api/cart',
      },
      orders: {
        list: 'GET /api/orders',
        detail: 'GET /api/orders/[id]',
        create: 'POST /api/orders',
        cancel: 'PUT /api/orders/[id]/cancel',
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
      },
    },
    documentation: {
      swagger: '/api/docs (未実装)',
      postman: 'https://documenter.getpostman.com/... (未実装)',
    },
  });
}

