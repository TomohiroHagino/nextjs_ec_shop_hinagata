# テストガイド

このプロジェクトには以下のテストが含まれています：

## テストの種類

### 1. ユニットテスト
- **場所**: `tests/unit/`
- **目的**: 個別の関数やクラスの動作をテスト
- **実行**: `npm run test:unit`

### 2. インテグレーションテスト
- **場所**: `tests/integration/`
- **目的**: 複数のコンポーネント間の連携をテスト
- **実行**: `npm run test:integration`

### 3. E2Eテスト
- **場所**: `tests/e2e/`
- **目的**: ユーザーの実際の操作フローをテスト
- **実行**: `npm run test:e2e`

## テストの実行方法

### すべてのテストを実行
```bash
npm test
```

### 特定の種類のテストを実行
```bash
# ユニットテストのみ
npm run test:unit

# インテグレーションテストのみ
npm run test:integration

# E2Eテストのみ
npm run test:e2e
```

### テストの監視モード
```bash
npm run test:watch
```

### カバレッジレポートの生成
```bash
npm run test:coverage
```

## テスト環境のセットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. テストデータベースの準備
```bash
# テスト用データベースの作成
npm run db:push

# テストデータの投入
npm run db:seed
```

### 3. Playwrightのセットアップ（E2Eテスト用）
```bash
npx playwright install
```

## テストファイルの構造

```
tests/
├── unit/                    # ユニットテスト
│   ├── domain/             # ドメイン層のテスト
│   │   ├── user-aggregate/
│   │   ├── product-aggregate/
│   │   ├── cart-aggregate/
│   │   └── order-aggregate/
│   └── application/        # アプリケーション層のテスト
├── integration/            # インテグレーションテスト
│   ├── api.test.ts        # API統合テスト
│   └── services.test.ts   # サービス統合テスト
├── e2e/                   # E2Eテスト
│   ├── shop.spec.ts       # ショッピングフローテスト
│   └── performance.spec.ts # パフォーマンステスト
└── setup/                 # テストセットアップ
    ├── jest.setup.ts      # Jest設定
    └── test-database.ts   # テストデータベース設定
```

## テストの書き方

### ユニットテストの例
```typescript
import { Email } from '@/domain/user-aggregate/value-object';

describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow();
  });
});
```

### インテグレーションテストの例
```typescript
import request from 'supertest';

describe('API Integration Tests', () => {
  it('should create user', async () => {
    const response = await request('http://localhost:3000')
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

### E2Eテストの例
```typescript
import { test, expect } from '@playwright/test';

test('should complete shopping flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=商品一覧');
  await page.click('.product-card:first-child');
  await page.click('button:has-text("カートに追加")');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## CI/CDでのテスト実行

### GitHub Actionsでの実行例
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

## トラブルシューティング

### よくある問題

1. **テストデータベースの接続エラー**
   - `DATABASE_URL`が正しく設定されているか確認
   - テストデータベースファイルが存在するか確認

2. **E2Eテストのタイムアウト**
   - サーバーが起動しているか確認
   - `playwright.config.ts`の設定を確認

3. **インポートエラー**
   - TypeScriptのパス設定を確認
   - 必要な依存関係がインストールされているか確認

### デバッグ方法

1. **詳細なログ出力**
   ```bash
   npm run test -- --verbose
   ```

2. **特定のテストのみ実行**
   ```bash
   npm run test -- --testNamePattern="特定のテスト名"
   ```

3. **E2Eテストのデバッグ**
   ```bash
   npx playwright test --debug
   ```

## ベストプラクティス

1. **テストの独立性**: 各テストは他のテストに依存しないようにする
2. **データのクリーンアップ**: テスト後にテストデータを削除する
3. **適切なアサーション**: 期待する結果を明確にアサートする
4. **テストの命名**: テストの目的が分かりやすい名前をつける
5. **モックの使用**: 外部依存関係は適切にモックする

