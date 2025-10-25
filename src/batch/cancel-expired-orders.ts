import { prisma } from '@/infrastructure/database/prisma/client';

/**
 * 期限切れ注文自動キャンセルバッチ
 * 
 * 役割:
 * - 作成から1週間（7日間）経過したPENDING状態の注文を自動的にキャンセル
 * - 定期的に実行されることを想定
 * 
 * 処理フロー:
 * 1. 現在時刻から7日前の日時を計算
 * 2. その日時より前に作成されたPENDING状態の注文を取得
 * 3. 各注文のステータスをCANCELLEDに更新
 * 4. 処理結果をログ出力
 * 
 * 実行方法:
 * - 手動実行: `tsx src/batch/cancel-expired-orders.ts`
 * - dry run: `tsx src/batch/cancel-expired-orders.ts --dry-run`
 * - cron: `0 0 * * * tsx src/batch/cancel-expired-orders.ts` (毎日0時)
 * 
 * オプション:
 * - --dry-run: 実際には更新せず、対象の注文を表示するだけ
 * 
 * 注意点:
 * - トランザクションで一括処理
 * - 在庫の戻し処理は将来的に実装する必要がある
 * - 実行ログはアプリケーションログに記録
 */

const EXPIRATION_DAYS = 7;

interface BatchResult {
  count: number;
  orders: Array<{
    id: string;
    userId: string;
    totalAmount: number;
    createdAt: Date;
  }>;
}

async function cancelExpiredOrders(dryRun: boolean = false): Promise<BatchResult> {
  const mode = dryRun ? '[DRY RUN] ' : '';
  console.log(`🔄 ${mode}期限切れ注文の自動キャンセルバッチを開始...`);
  
  if (dryRun) {
    console.log('⚠️  DRY RUNモード: データベースは更新されません');
  }
  
  try {
    // 7日前の日時を計算
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - EXPIRATION_DAYS);
    
    console.log(`📅 対象: ${expirationDate.toISOString()} より前に作成されたPENDING注文`);

    // 期限切れのPENDING注文を取得
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: expirationDate,
        },
      },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    if (expiredOrders.length === 0) {
      console.log('✅ キャンセル対象の注文はありません');
      return { count: 0, orders: [] };
    }

    console.log(`📦 ${expiredOrders.length}件の期限切れ注文を発見`);

    // 処理結果の詳細をログ出力
    console.log('\n📋 キャンセル対象の注文詳細:');
    expiredOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. 注文ID: ${order.id}`);
      console.log(`     ユーザーID: ${order.userId}`);
      console.log(`     金額: ¥${order.totalAmount.toLocaleString()}`);
      console.log(`     作成日時: ${order.createdAt.toISOString()}`);
    });

    // DRY RUNモードの場合はここで終了
    if (dryRun) {
      console.log('\n⚠️  DRY RUNモードのため、実際のキャンセル処理はスキップされました');
      console.log('✨ バッチ処理が完了しました（変更なし）');
      return { count: expiredOrders.length, orders: expiredOrders };
    }

    // 実際の更新処理（トランザクション内）
    const updateResult = await prisma.$transaction(async (tx) => {
      // 一括でステータスをCANCELLEDに更新
      const result = await tx.order.updateMany({
        where: {
          id: {
            in: expiredOrders.map(order => order.id),
          },
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      return result;
    });

    console.log(`\n✅ ${updateResult.count}件の注文をキャンセルしました`);
    console.log('✨ バッチ処理が正常に完了しました');
    
    return { count: updateResult.count, orders: expiredOrders };
  } catch (error) {
    console.error('❌ バッチ処理中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  // コマンドライン引数から --dry-run オプションを取得
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  cancelExpiredOrders(dryRun)
    .then((result) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { cancelExpiredOrders };

