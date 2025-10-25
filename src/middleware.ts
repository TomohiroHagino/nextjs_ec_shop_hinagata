import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ミドルウェア
 * 
 * APIモードの場合、API以外のルートへのアクセスを制限します。
 * 環境変数 API_ONLY=true の場合、/api/* とトップページ（/）以外のルートは404を返します。
 */
export function middleware(request: NextRequest) {
  const isApiOnly = process.env.API_ONLY === 'true';
  const { pathname } = request.nextUrl;

  // APIモードの場合
  if (isApiOnly) {
    // /api/* へのアクセスは許可
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // トップページ（/）へのアクセスは許可（API情報ページを表示）
    if (pathname === '/') {
      return NextResponse.next();
    }

    // /_next/* (Next.jsの内部リソース) へのアクセスは許可
    if (pathname.startsWith('/_next/')) {
      return NextResponse.next();
    }

    // favicon.ico へのアクセスは許可
    if (pathname === '/favicon.ico') {
      return NextResponse.next();
    }

    // その他のページへのアクセスは403を返す
    return NextResponse.json(
      {
        error: 'API Only Mode',
        message: 'このサーバーはAPIモードで動作しています。フロントエンドページへのアクセスは無効です。',
        hint: 'トップページ（/）でAPI情報を確認できます。',
        availableEndpoints: [
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET /api/products',
          'GET /api/products/[id]',
          'POST /api/cart',
          'GET /api/cart',
          'POST /api/orders',
          'GET /api/orders',
          'GET /api/orders/[id]',
          'GET /api/users/profile',
          'PUT /api/users/profile',
        ],
      },
      { status: 403 }
    );
  }

  // 通常モード（フルスタック）の場合は何もしない
  return NextResponse.next();
}

/**
 * ミドルウェアを適用するパスの設定
 * 
 * API_ONLY=true の場合のみミドルウェアを実行
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

