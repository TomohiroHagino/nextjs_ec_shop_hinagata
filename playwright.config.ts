// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright の共通設定
 * - 本番ビルド（build→start）で起動して高速＆安定
 * - 期待アサーションの待ち時間や失敗時の証跡（trace/video/screenshot）を保持
 * - デスクトップ/モバイル相当の主要ブラウザで実行
 */
export default defineConfig({
  // テストファイルのディレクトリ
  testDir: './tests/e2e',

  // 各テストのデフォルトタイムアウト（ミリ秒）
  timeout: 30_000,

  // expect(...).toXXX の待ち時間（ミリ秒）
  expect: { timeout: 5_000 },

  // ファイル単位でテストを並列実行
  fullyParallel: true,

  // CI で誤って test.only を残した場合は失敗扱い
  forbidOnly: !!process.env.CI,

  // CI のみリトライ回数を付与
  retries: process.env.CI ? 2 : 0,

  // ワーカー数（並列実行数）：過負荷を避けつつ速度も確保
  workers: process.env.CI ? 2 : 2,

  // レポーター（HTML レポートを出力）
  reporter: 'html',

  // すべてのプロジェクトで共通の利用設定
  use: {
    // baseURL を設定して `page.goto('/')` 等を簡潔に
    baseURL: 'http://localhost:3000',

    // 失敗時の証跡を保持（デバッグ容易化）
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // CI/ローカルともにヘッドレス実行（必要なら外してOK）
    headless: true,
  },

  // 対象ブラウザ・デバイスのプロジェクト定義
  projects: [
    { name: 'chromium',       use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',        use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',         use: { ...devices['Desktop Safari'] } },
    // モバイル相当のビューポートでも検証
    { name: 'Mobile Chrome',  use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari',  use: { ...devices['iPhone 14'] } },
  ],

  // テスト前にアプリを起動（dev より安定するため build→start を推奨）
  webServer: {
    // dev サーバは HMR 等で遅延・不安定化しやすいので本番ビルドで起動
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    // 既存サーバがある場合は再利用（CI では毎回新規起動）
    reuseExistingServer: !process.env.CI,
    // サーバ起動待ちの上限（ミリ秒）
    timeout: 120_000,
    // 本番相当で起動
    env: { NODE_ENV: 'production' },
  },
});
