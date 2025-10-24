import request from 'supertest';

// Next.jsの開発サーバーのベースURL
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('API インテグレーションテスト', () => {
  // 統合テストはサーバーが起動していることを前提とするため、
  // テストデータベースのセットアップは不要
  beforeAll(async () => {
    // サーバーが起動していることを確認するための簡易チェック
    try {
      await request(BASE_URL).get('/api/health');
    } catch (error) {
      console.warn(`Warning: Development server may not be running on ${BASE_URL}`);
    }
  });

  afterAll(async () => {
    // クリーンアップ不要
  });

  describe('ヘルスチェック API', () => {
    it('ヘルスステータスを返すこと', async () => {
      const response = await request(BASE_URL)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'API is running',
        version: '1.0.0',
        timestamp: expect.any(String),
      });
    });
  });

  describe('商品 API', () => {
    it('商品一覧を取得できること', async () => {
      const response = await request(BASE_URL)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      // 実際のデータベースには5個の商品が存在することを確認
      expect(response.body.data.length).toBe(5);
    });

    it('単一商品を取得できること', async () => {
      const response = await request(BASE_URL)
        .get('/api/products/product-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'product-1',
        name: 'MacBook Pro 16インチ',
        price: 298000,
      });
    });
  });

  describe('認証 API', () => {
    it('新しいユーザーを登録できること', async () => {
      // ランダムなメールアドレスを生成して重複を避ける
      const randomEmail = `newuser-${Date.now()}@example.com`;
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({
          email: randomEmail,
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        email: randomEmail,
        firstName: 'New',
        lastName: 'User',
      });
    });

    it('有効な認証情報でログインできること', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('無効な認証情報を拒否すること', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('カート API', () => {
    let authToken: string;

    beforeAll(async () => {
      // ログインしてトークンを取得
      const loginResponse = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      if (!loginResponse.body.data || !loginResponse.body.data.token) {
        console.error('Login failed:', loginResponse.body);
        throw new Error('Failed to get auth token for cart tests');
      }

      authToken = loginResponse.body.data.token;
    });

    it('カートにアイテムを追加できること', async () => {
      const response = await request(BASE_URL)
        .post('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'product-1',
          quantity: 2,
        });

      // エラーメッセージをログ出力
      if (response.status !== 200) {
        console.error('Cart add error:', response.status, response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('カート内容を取得できること', async () => {
      const response = await request(BASE_URL)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.itemCount).toBeGreaterThan(0);
    });

    it('認証されていないカートアクセスを拒否すること', async () => {
      const response = await request(BASE_URL)
        .get('/api/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('注文 API', () => {
    let authToken: string;

    beforeAll(async () => {
      // ログインしてトークンを取得
      const loginResponse = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      if (!loginResponse.body.data || !loginResponse.body.data.token) {
        console.error('Login failed:', loginResponse.body);
        throw new Error('Failed to get auth token for order tests');
      }

      authToken = loginResponse.body.data.token;

      // カートにアイテムを追加
      await request(BASE_URL)
        .post('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'product-1',
          quantity: 2,
        });
    });

    it('注文を作成できること', async () => {
      const response = await request(BASE_URL)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: 'product-1',
              quantity: 2,
            },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: 'PENDING',
      });
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('ユーザーの注文一覧を取得できること', async () => {
      const response = await request(BASE_URL)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('注文詳細を取得できること', async () => {
      // まず注文を作成
      const createResponse = await request(BASE_URL)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: 'product-2',
              quantity: 1,
            },
          ],
        });

      const orderId = createResponse.body.data.id;

      const response = await request(BASE_URL)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: orderId,
        status: 'PENDING',
      });
      expect(response.body.data.items).toBeInstanceOf(Array);
    });
  });
});
