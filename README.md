# ECショップ - Next.js 15 + DDD + BEM

## 概要

Next.js 15を使用したECショップアプリケーションです。  
ドメイン駆動設計（DDD）とBEM（Block Element Modifier）CSS設計手法を採用しています。

## 技術スタック

- **フロントエンド/バックエンド**: Next.js 15（フルスタック）, TypeScript
- **スタイリング**: CSS Modules + BEM
- **データベース**: PostgreSQL + Prisma(sqlite)
- **認証**: JWT
- **アーキテクチャ**: Domain-Driven Design (DDD)
- **テスト**: Jest + Testing Library + Playwright

## プロジェクト構造

```
ec_shop_fullst/
├── src/                           # アプリケーションソースコード
│   ├── app/                       # Next.js 15 App Router
│   │   ├── (auth)/                # 認証関連ページグループ
│   │   │   ├── login/             # ログインページ
│   │   │   │   ├── page.tsx       # ログイン画面
│   │   │   │   └── page.module.scss
│   │   │   └── register/          # 新規登録ページ
│   │   │       ├── page.tsx       # 登録画面
│   │   │       └── page.module.scss
│   │   ├── api/                   # APIルート
│   │   │   ├── auth/              # 認証API
│   │   │   │   ├── login/route.ts # ログインエンドポイント
│   │   │   │   └── register/route.ts # 登録エンドポイント
│   │   │   ├── cart/              # カートAPI
│   │   │   │   ├── route.ts       # カート取得・追加
│   │   │   │   └── update/route.ts # カート更新・削除
│   │   │   ├── orders/            # 注文API
│   │   │   │   ├── route.ts       # 注文作成・一覧取得
│   │   │   │   └── [id]/route.ts # 注文詳細・ステータス更新
│   │   │   ├── products/          # 商品API
│   │   │   │   ├── route.ts       # 商品一覧取得
│   │   │   │   └── [id]/route.ts # 商品詳細取得
│   │   │   ├── users/             # ユーザーAPI
│   │   │   │   └── profile/route.ts # プロフィール取得
│   │   │   └── health/route.ts    # ヘルスチェック
│   │   ├── cart/                  # カートページ
│   │   │   ├── page.tsx
│   │   │   └── page.module.scss
│   │   ├── orders/                # 注文ページ
│   │   │   ├── page.tsx           # 注文一覧
│   │   │   ├── [id]/page.tsx      # 注文詳細
│   │   │   └── page.module.scss
│   │   ├── products/              # 商品ページ
│   │   │   ├── page.tsx           # 商品一覧
│   │   │   ├── [id]/page.tsx      # 商品詳細
│   │   │   └── page.module.scss
│   │   ├── layout.tsx             # ルートレイアウト
│   │   ├── page.tsx               # トップページ
│   │   └── globals.scss           # グローバルスタイル
│   │
│   ├── domain/                    # ドメイン層（ビジネスロジック）
│   │   ├── user-aggregate/        # ユーザー集約
│   │   │   ├── entity/
│   │   │   │   └── user.ts        # ユーザーエンティティ
│   │   │   ├── value-object/
│   │   │   │   ├── email.ts       # メールアドレス値オブジェクト
│   │   │   │   ├── password.ts    # パスワード値オブジェクト
│   │   │   │   └── user-id.ts     # ユーザーID値オブジェクト
│   │   │   ├── repository/
│   │   │   │   └── user-repository.ts # ユーザーリポジトリインターフェース
│   │   │   └── service/
│   │   │       └── user-domain-service.ts # ユーザードメインサービス
│   │   │
│   │   ├── product-aggregate/     # 商品集約
│   │   │   ├── entity/
│   │   │   │   └── product.ts     # 商品エンティティ
│   │   │   ├── value-object/
│   │   │   │   ├── product-id.ts  # 商品ID
│   │   │   │   ├── price.ts       # 価格（バリデーション含む）
│   │   │   │   ├── product-name.ts # 商品名
│   │   │   │   └── description.ts # 商品説明
│   │   │   ├── repository/
│   │   │   │   └── product-repository.ts
│   │   │   └── service/
│   │   │       └── product-domain-service.ts
│   │   │
│   │   ├── cart-aggregate/        # カート集約
│   │   │   ├── entity/
│   │   │   │   ├── cart.ts        # カートエンティティ
│   │   │   │   └── cart-item.ts   # カートアイテムエンティティ
│   │   │   ├── value-object/
│   │   │   │   ├── cart-id.ts
│   │   │   │   └── quantity.ts    # 数量（1-999の制約）
│   │   │   ├── repository/
│   │   │   │   └── cart-repository.ts
│   │   │   └── service/
│   │   │       └── cart-domain-service.ts
│   │   │
│   │   ├── order-aggregate/       # 注文集約
│   │   │   ├── entity/
│   │   │   │   ├── order.ts       # 注文エンティティ
│   │   │   │   └── order-item.ts  # 注文アイテムエンティティ
│   │   │   ├── value-object/
│   │   │   │   ├── order-id.ts
│   │   │   │   ├── order-status.ts # 注文ステータス（PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED）
│   │   │   │   └── total-amount.ts # 合計金額
│   │   │   ├── repository/
│   │   │   │   └── order-repository.ts
│   │   │   └── service/
│   │   │       └── order-domain-service.ts
│   │   │
│   │   └── shared/                # 共有ドメイン要素
│   │       ├── value-object/
│   │       │   ├── created-at.ts  # 作成日時
│   │       │   └── updated-at.ts  # 更新日時
│   │       └── exception/
│   │           ├── domain-exception.ts # ドメイン例外（抽象）
│   │           └── validation-exception.ts # バリデーション例外
│   │
│   ├── application/               # アプリケーション層（ユースケース）
│   │   ├── user-aggregate/
│   │   │   ├── register-user-service.ts # ユーザー登録ユースケース
│   │   │   ├── login-user-service.ts    # ログインユースケース
│   │   │   └── get-user-profile-service.ts # プロフィール取得
│   │   ├── product-aggregate/
│   │   │   ├── create-product-service.ts  # 商品作成
│   │   │   ├── get-product-service.ts     # 商品取得
│   │   │   └── list-products-service.ts   # 商品一覧取得
│   │   ├── cart-aggregate/
│   │   │   ├── add-to-cart-service.ts     # カートに追加
│   │   │   ├── update-cart-service.ts     # カート更新
│   │   │   └── get-cart-service.ts        # カート取得
│   │   ├── order-aggregate/
│   │   │   ├── create-order-service.ts    # 注文作成
│   │   │   ├── get-order-service.ts       # 注文取得
│   │   │   └── list-orders-service.ts     # 注文一覧取得
│   │   └── shared/
│   │       ├── command/            # コマンドオブジェクト（入力）
│   │       │   ├── user-command.ts
│   │       │   ├── product-command.ts
│   │       │   ├── cart-command.ts
│   │       │   └── order-command.ts
│   │       └── dto/                # データ転送オブジェクト（出力）
│   │           ├── user-dto.ts
│   │           ├── product-dto.ts
│   │           ├── cart-dto.ts
│   │           └── order-dto.ts
│   │
│   ├── infrastructure/            # インフラ層（技術的実装）
│   │   └── database/
│   │       ├── prisma/
│   │       │   └── client.ts      # Prismaクライアントシングルトン
│   │       └── repositories/      # リポジトリ実装
│   │           ├── user/
│   │           │   └── user-repository-impl.ts
│   │           ├── product/
│   │           │   └── product-repository-impl.ts
│   │           ├── cart/
│   │           │   └── cart-repository-impl.ts
│   │           └── order/
│   │               └── order-repository-impl.ts
│   │
│   └── presentation/              # プレゼンテーション層（UI）
│       └── components/
│           ├── layout/
│           │   ├── navigation.tsx # ナビゲーションバー
│           │   └── navigation.module.scss
│           └── ui/                # 共通UIコンポーネント
│               ├── button.tsx     # ボタンコンポーネント
│               ├── button.module.scss
│               ├── input.tsx      # 入力フィールド
│               ├── input.module.scss
│               └── index.ts       # UIコンポーネントのエクスポート
│
├── tests/                         # テストコード
│   ├── unit/                      # ユニットテスト（ドメイン層）
│   │   └── domain/
│   │       ├── user-aggregate/
│   │       │   ├── entity/
│   │       │   │   └── user.test.ts
│   │       │   └── value-object/
│   │       │       ├── email.test.ts
│   │       │       └── password.test.ts
│   │       ├── product-aggregate/
│   │       │   ├── entity/
│   │       │   │   └── product.test.ts
│   │       │   └── value-object/
│   │       │       └── price.test.ts
│   │       ├── cart-aggregate/
│   │       │   ├── entity/
│   │       │   │   └── cart.test.ts
│   │       │   └── value-object/
│   │       │       └── quantity.test.ts
│   │       └── order-aggregate/
│   │           ├── entity/
│   │           │   └── order.test.ts
│   │           └── value-object/
│   │               └── order-status.test.ts
│   │
│   ├── integration/               # 統合テスト（API層）
│   │   ├── api.test.ts            # API統合テスト（Supertest）
│   │   └── services.test.ts       # サービス統合テスト
│   │
│   ├── e2e/                       # E2Eテスト（Playwright）
│   │   ├── shop.spec.ts           # ショップ機能のE2Eテスト
│   │   └── performance.spec.ts    # パフォーマンステスト
│   │
│   └── setup/                     # テスト設定
│       ├── jest.setup.ts          # Jest初期化
│       └── test-database.ts       # テストDB設定
│
├── prisma/                        # Prismaスキーマとマイグレーション
│   ├── schema.prisma              # データベーススキーマ定義
│   └── seed.ts                    # シードデータ（初期データ投入）
│
├── .env.example                   # 環境変数テンプレート
├── .env.local                     # ローカル環境変数（gitignore）
├── .gitignore                     # Git除外設定
├── .eslintrc.json                 # ESLint設定
├── jest.config.js                 # Jest設定（ユニットテスト）
├── jest.integration.config.js     # Jest設定（統合テスト）
├── playwright.config.ts           # Playwright設定（E2Eテスト）
├── next.config.js                 # Next.js設定
├── tsconfig.json                  # TypeScript設定
├── package.json                   # 依存関係とスクリプト
└── README.md                      # プロジェクトドキュメント

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
# 通常起動
npm run dev

# または、データベースロックをクリーンアップしてから起動
npm run dev:clean
```

サーバーが起動したら、ブラウザで http://localhost:3000 にアクセスしてください。

### 5. 開発サーバーの停止

開発サーバーを停止するには、ターミナルで以下を実行します：

```bash
Ctrl + C  (MacはCommand + C ではなく Control + C)
```

**注意**: サーバーを停止した後、データベースロックが残る場合があります。その場合は以下を実行してください：

```bash
npm run db:cleanup
```

## サーバーの起動・停止

### 開発サーバー

**起動方法:**
```bash
# 通常起動
npm run dev

# クリーンアップしてから起動（推奨）
npm run dev:clean
```

**停止方法:**
```bash
# ターミナルで以下のキーを押す
Ctrl + C
```

**ポート**: http://localhost:3000

### プロダクションサーバー

**ビルド:**
```bash
npm run build
```

**起動:**
```bash
npm start
```

**停止:**
```bash
Ctrl + C
```

### トラブルシューティング

#### データベースがロックされている場合

開発サーバーを停止した後、以下のエラーが出る場合：

```
Error: attempt to write a readonly database
Error: Operations timed out
```

**解決方法:**
```bash
# 残っているプロセスをクリーンアップ
npm run db:cleanup

# その後、サーバーを再起動
npm run dev
```

#### ポートが既に使用されている場合

```
Error: EADDRINUSE: address already in use :::3000
```

**解決方法:**
```bash
# 使用中のプロセスを確認
lsof -ti:3000

# プロセスを終了
kill -9 $(lsof -ti:3000)

# または別のポートで起動
PORT=3001 npm run dev
```

## 利用可能なスクリプト

### 開発・ビルド
- `npm run dev` - 開発サーバーを起動
- `npm run dev:clean` - データベースをクリーンアップしてから開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

### テスト
- `npm run test` - 全テストを実行
- `npm run test:unit` - ユニットテストを実行
- `npm run test:integration` - 統合テストを実行
- `npm run test:e2e` - E2Eテストを実行
- `npm run test:coverage` - カバレッジレポートを生成

### データベース
- `npm run db:generate` - Prismaクライアントを生成
- `npm run db:migrate` - データベースマイグレーション
- `npm run db:seed` - シードデータを投入
- `npm run db:reset` - データベースをリセット（全データ削除）
- `npm run db:cleanup` - データベースロックをクリーンアップ
- `npm run db:studio` - Prisma Studioを起動（データベースGUI）

### バッチ処理
- `npm run batch:cancel-expired-orders` - 期限切れ注文の自動キャンセル
- `npm run batch:cancel-expired-orders:dry-run` - キャンセル対象の確認（更新なし）

## バッチ処理

### 期限切れ注文の自動キャンセル

作成から1週間（7日間）経過したPENDING状態の注文を自動的にキャンセルするバッチです。

#### 手動実行

```bash
# 実際にキャンセル処理を実行
npm run batch:cancel-expired-orders

# Dry Run（対象を確認するだけ、実際には更新しない）
npm run batch:cancel-expired-orders:dry-run
```

#### Dry Runモード

Dry Runモードでは、キャンセル対象の注文を表示するだけで、実際のデータベース更新は行いません。  
本番環境で実行する前に、必ずDry Runで対象を確認することを推奨します。

```bash
# 直接実行する場合
tsx src/batch/cancel-expired-orders.ts --dry-run
```

#### cron設定（本番環境推奨）

毎日0時に自動実行する場合：

```bash
# crontab -e で編集
0 0 * * * cd /path/to/ec_shop_fullst && npm run batch:cancel-expired-orders >> /var/log/cancel-expired-orders.log 2>&1
```

毎時00分に実行する場合：

```bash
0 * * * * cd /path/to/ec_shop_fullst && npm run batch:cancel-expired-orders >> /var/log/cancel-expired-orders.log 2>&1
```

#### 処理内容

1. 現在時刻から7日前の日時を計算
2. その日時より前に作成されたPENDING状態の注文を取得
3. トランザクション内で一括してステータスをCANCELLEDに更新（Dry Runの場合はスキップ）
4. 処理結果をログ出力

#### ログ例

**通常モード:**

```
🔄 期限切れ注文の自動キャンセルバッチを開始...
📅 対象: 2025-10-18T00:00:00.000Z より前に作成されたPENDING注文
📦 3件の期限切れ注文を発見

📋 キャンセル対象の注文詳細:
  1. 注文ID: order-abc123
     ユーザーID: user-123
     金額: ¥596,000
     作成日時: 2025-10-10T10:30:00.000Z
  2. 注文ID: order-def456
     ユーザーID: user-456
     金額: ¥149,800
     作成日時: 2025-10-12T15:00:00.000Z

✅ 3件の注文をキャンセルしました
✨ バッチ処理が正常に完了しました
```

**Dry Runモード:**

```
🔄 [DRY RUN] 期限切れ注文の自動キャンセルバッチを開始...
⚠️  DRY RUNモード: データベースは更新されません
📅 対象: 2025-10-18T00:00:00.000Z より前に作成されたPENDING注文
📦 3件の期限切れ注文を発見

📋 キャンセル対象の注文詳細:
  1. 注文ID: order-abc123
     ユーザーID: user-123
     金額: ¥596,000
     作成日時: 2025-10-10T10:30:00.000Z
  2. 注文ID: order-def456
     ユーザーID: user-456
     金額: ¥149,800
     作成日時: 2025-10-12T15:00:00.000Z

⚠️  DRY RUNモードのため、実際のキャンセル処理はスキップされました
✨ バッチ処理が完了しました（変更なし）
```


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