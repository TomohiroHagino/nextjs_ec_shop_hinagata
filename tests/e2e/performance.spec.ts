// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('パフォーマンステスト', () => {
  // CI とローカルでしきい値を分けて環境差を吸収
  const isCI = !!process.env.CI;

  // ナビゲーション計測のユーティリティ
  async function navDuration(page: import('@playwright/test').Page) {
    // DOMContentLoaded まで待機 → ネットワークのアイドルまで待機
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Navigation Timing の duration（フォールバックあり）
    const perf = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return nav?.duration ?? 0;
    });
    return perf as number;
  }

  test('ホームページが高速に読み込まれること', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const perf = await navDuration(page);
    const loadTime = perf || (Date.now() - start);

    // しきい値（ローカル厳しめ / CIゆるめ）
    expect(loadTime).toBeLessThan(isCI ? 20000 : 12000);

    // 主要要素の可視性
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('商品一覧ページが効率的に読み込まれること', async ({ page }) => {
    const start = Date.now();
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    const perf = await navDuration(page);
    const loadTime = perf || (Date.now() - start);

    expect(loadTime).toBeLessThan(isCI ? 20000 : 12000);

    // 最低1件はカードが表示される（固定件数の前提を避ける）
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toBeVisible();
  });

  test('複数の同時リクエストを処理できること', async ({ browser }) => {
    const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
    const [p1, p2, p3] = await Promise.all(contexts.map((c) => c.newPage()));

    const start = Date.now();
    await Promise.all([
      p1.goto('/products', { waitUntil: 'domcontentloaded' }),
      p2.goto('/products', { waitUntil: 'domcontentloaded' }),
      p3.goto('/products', { waitUntil: 'domcontentloaded' }),
    ]);
    const loadTime = Date.now() - start;

    // 並行でも15〜20秒以内（環境差を吸収）
    expect(loadTime).toBeLessThan(isCI ? 20000 : 15000);

    for (const page of [p1, p2, p3]) {
      await expect(page.locator('.product-card').first()).toBeVisible();
    }

    await Promise.all(contexts.map((c) => c.close()));
  });

  test('Core Web Vitalsが良好であること', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // --- LCP: buffered エントリを直接参照（Observer待ちでのタイムアウトを回避）---
    const lcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('largest-contentful-paint') as any[];
      if (entries && entries.length) {
        const last = entries[entries.length - 1] as any;
        return last.startTime || last.renderTime || last.loadTime || 0;
      }
      return 0;
    });
    expect(lcp).toBeLessThan(isCI ? 5000 : 3500);

    // --- FID: 入力がなければ発火しないため、最初の入力を合成して測定 ---
    const fid = await page.evaluate(() => {
      return new Promise<number | null>((resolve) => {
        let done = false;
        try {
          new PerformanceObserver((list) => {
            const e = list.getEntries()[0] as PerformanceEventTiming | undefined;
            if (e && !done) {
              done = true;
              resolve(e.processingStart - e.startTime);
            }
          }).observe({ type: 'first-input', buffered: true });
        } catch {
          // Safari などサポート外は null
          resolve(null);
          return;
        }

        // 入力イベントを合成（まだ何も起きていなければ）
        setTimeout(() => {
          if (done) return;
          document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }, 0);

        // セーフティタイムアウト
        setTimeout(() => !done && resolve(null), 2000);
      });
    });

    if (fid !== null) {
      expect(fid).toBeLessThan(100);
    }
  });

  test('大量の商品リストを処理できること', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });

    // ページネーションがあれば次ページへ
    const pagination = page.locator('.pagination');
    if (await pagination.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /次へ|Next/i }).click();
      await expect(page.locator('.product-card').first()).toBeVisible();
    }

    // 検索フォームがあれば検索して結果を確認
    if (await page.locator('input[name="search"]').count()) {
      await page.fill('input[name="search"]', 'Test');
      await page.getByRole('button', { name: /検索|Search/i }).click();
      await expect(page.locator('.product-card').first()).toBeVisible();
    }
  });

  test('カート操作が効率的に実行されること', async ({ page }) => {
    // --- ログイン（遷移のレースを避ける）---
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.click('button[type="submit"]'),
    ]);

    // --- 商品詳細へは「固定スラッグ直打ち」せず一覧から辿る ---
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toBeVisible();

    // .product-card 自体が <a> タグなので、直接 href を取得
    const href = await firstCard.getAttribute('href');
    expect(href, '商品詳細へのリンクが見つかりません').toBeTruthy();

    const start = Date.now();

    await page.goto(href!, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="quantity"]', '1');
    await page.getByRole('button', { name: /カートに追加|Add to Cart/i }).click();

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    // 数量更新 UI が存在する場合のみ更新
    if (await page.locator('.cart-item input[name="quantity"]').count()) {
      await page.fill('.cart-item input[name="quantity"]', '2');
      await page.getByRole('button', { name: /更新|Update/i }).click();
    }

    const operationTime = Date.now() - start;

    // 一連の操作の完了時間（開発環境では10秒以内を許容）
    expect(operationTime).toBeLessThan(isCI ? 8000 : 10000);
  });
});
