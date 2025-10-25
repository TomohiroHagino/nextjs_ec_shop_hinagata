import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '@/presentation/components/layout/navigation';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECショップ - 高品質な商品をお手頃価格で',
  description: '厳選された商品を最短翌日配送でお届け。24時間365日サポート対応。',
  keywords: 'ECショップ, オンラインショップ, 通販, 商品, 配送',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <div id="root">
            <Navigation />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
