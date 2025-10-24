# ECショップ - Next.js 15 + DDD + BEM

## 概要

Next.js 15を使用したECショップアプリケーションです。ドメイン駆動設計（DDD）とBEM（Block Element Modifier）CSS設計手法を採用しています。

## 技術スタック

- **フロントエンド**: Next.js 15, React 18, TypeScript
- **スタイリング**: CSS Modules + BEM
- **データベース**: PostgreSQL + Prisma(sqlite)
- **認証**: JWT
- **アーキテクチャ**: Domain-Driven Design (DDD)
- **テスト**: Jest + Testing Library + Playwright

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   └── ...
├── domain/                 # ドメイン層
│   ├── user-aggregate/     # ユーザーアグリゲート
│   ├── product-aggregate/  # プロダクトアグリゲート
│   ├── cart-aggregate/     # カートアグリゲート
│   ├── order-aggregate/    # オーダーアグリゲート
│   └── shared/             # 共有ドメイン
├── application/            # アプリケーション層
│   ├── user-aggregate/     # ユーザーアプリケーションサービス
│   ├── product-aggregate/  # プロダクトアプリケーションサービス
│   └── shared/             # 共有アプリケーション
├── infrastructure/        # インフラ層
│   └── database/          # データベース実装
└── presentation/          # プレゼンテーション層
    └── components/        # Reactコンポーネント

tests/
├── unit/                  # ユニットテスト
├── integration/           # 統合テスト
├── e2e/                   # E2Eテスト
└── setup/                 # テスト設定

プレゼンテーション層は最後の最後にテストを追加する予定。
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要な環境変数を設定してください。

```bash
cp .env.example .env.local
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate

# シードデータの投入（オプション）
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック
- `npm run test` - 全テストを実行
- `npm run test:unit` - ユニットテストを実行
- `npm run test:integration` - 統合テストを実行
- `npm run test:e2e` - E2Eテストを実行
- `npm run test:coverage` - カバレッジレポートを生成
- `npm run db:generate` - Prismaクライアントを生成
- `npm run db:migrate` - データベースマイグレーション
- `npm run db:seed` - シードデータを投入

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト

### ユーザー
- `GET /api/users/profile` - ユーザープロフィール取得

### プロダクト
- `GET /api/products` - プロダクト一覧取得
- `POST /api/products` - プロダクト作成
- `GET /api/products/[id]` - プロダクト詳細取得

### ヘルスチェック
- `GET /api/health` - API状態確認

## アーキテクチャ

### ドメイン駆動設計（DDD）

1. **ドメイン層**: ビジネスロジックとエンティティ
   - ユーザーアグリゲート: ユーザー管理
   - プロダクトアグリゲート: 商品管理
   - カートアグリゲート: ショッピングカート
   - オーダーアグリゲート: 注文管理

2. **アプリケーション層**: ユースケースとサービス
   - 登録、認証、商品管理などのアプリケーションサービス
   - DTO、コマンド、クエリパターン

3. **インフラ層**: データベースと外部サービス
   - Prismaを使用したリポジトリ実装
   - 外部API連携

4. **プレゼンテーション層**: UIコンポーネントとページ
   - Reactコンポーネント
   - Next.js App Router

### BEM CSS設計

CSS ModulesとBEM命名規則を使用して、保守性の高いスタイルを実現しています。

```scss
.button {
  // Block
}

.button--primary {
  // Modifier
}

.button__content {
  // Element
}
```

## テスト戦略

### ユニットテスト
- ドメインエンティティと値オブジェクトのテスト
- ビジネスロジックの検証
- Jest + Testing Library

### 統合テスト
- APIエンドポイントのテスト
- データベース連携のテスト

### E2Eテスト
- ユーザーフローのテスト
- Playwright

## 開発ガイドライン

### コーディング規約

- TypeScriptのstrict modeを使用
- ESLintとPrettierでコード品質を維持
- BEM命名規則でCSSを記述
- ドメイン駆動設計の原則に従う

### テスト

- テストカバレッジ80%以上を目標
- 各アグリゲートのビジネスロジックをテスト
- APIエンドポイントの統合テスト
- 重要なユーザーフローのE2Eテスト

<!-- ## デプロイ -->

<!-- ### Docker

```bash
# Dockerイメージのビルド
docker build -t ec-shop .

# コンテナの実行
docker run -p 3000:3000 ec-shop
``` -->

### Vercel

```bash
# Vercelにデプロイ
vercel --prod
```

## セキュリティに関する既知の課題

### 現在の認証方式：JWT + localStorage

現在のアプリケーションは **JWT (JSON Web Token) + localStorage** を使用して認証を実装しています。

#### 現状の実装
```typescript
// ログイン時
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// API呼び出し時
const token = localStorage.getItem('token');
fetch('/api/...', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### セキュリティ上の問題点

1. **XSS攻撃に対して脆弱**
   - JavaScriptから直接アクセス可能なため、XSS攻撃でトークンが盗まれる可能性
   - 悪意のあるスクリプトが`localStorage.getItem('token')`でトークンを取得可能

2. **CSRF保護がない**
   - クロスサイトリクエストフォージェリへの対策が不十分

3. **トークンのライフサイクル管理が不完全**
   - リフレッシュトークンがない
   - トークンの失効管理が困難

### 推奨される改善策

#### 1. HttpOnly Cookie + SameSite 属性の使用

```typescript
// サーバーサイド（API Route）
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  // ログイン処理...
  const token = jwt.sign({ userId }, JWT_SECRET);
  
  // HttpOnly Cookieにトークンを保存
  const cookie = serialize('token', token, {
    httpOnly: true,        // JavaScriptからアクセス不可
    secure: true,          // HTTPS通信のみ
    sameSite: 'strict',    // CSRF対策
    maxAge: 60 * 60 * 24,  // 24時間
    path: '/'
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Set-Cookie': cookie }
  });
}
```

#### 2. リフレッシュトークンの実装

```typescript
// アクセストークン: 短命
const accessToken = jwt.sign(
  { userId, type: 'access' }, 
  JWT_SECRET, 
  { expiresIn: '15m' } // 15分で失効
);

// リフレッシュトークン: 長命
const refreshToken = jwt.sign(
  { userId, type: 'refresh' }, 
  REFRESH_SECRET, 
  { expiresIn: '7d' } // 7日で失効
);

// データベースにリフレッシュトークンを保存
await prisma.refreshToken.create({
  data: { token: refreshToken, userId, expiresAt: ... }
});
```

#### トークン失効の実装例

```typescript
// ログアウト時
await prisma.refreshToken.delete({
  where: { token: refreshToken }
});

// 全デバイスからログアウト
await prisma.refreshToken.deleteMany({
  where: { userId }
});
```

#### 3. セッションベース認証への移行

```typescript
// より高いセキュリティが必要な場合
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ...
}
```

#### 4. NextAuth.js の導入検討

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      // カスタム認証ロジック
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 優先順位

1. **短期（すぐに実施）**: HttpOnly Cookie + SameSite属性への移行
2. **中期（1-2週間）**: リフレッシュトークンの実装
3. **長期（1ヶ月以内）**: NextAuth.jsの導入検討

### 参考リンク

- [OWASP - JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。詳細は[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。