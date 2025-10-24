import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaInstance =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            {
              emit: 'event',
              level: 'query',
            },
            {
              emit: 'event',
              level: 'error',
            },
            {
              emit: 'event',
              level: 'info',
            },
            {
              emit: 'event',
              level: 'warn',
            },
          ]
        : ['error'], // 本番環境ではエラーのみ
  });

// 開発環境でログをカスタマイズ
if (process.env.NODE_ENV === 'development') {
  prismaInstance.$on('query' as never, (e: any) => {
    // ANSI エスケープコード: \x1b[1;33m = 太字+黄色, \x1b[0m = リセット
    console.log('\x1b[1;33m%s\x1b[0m', `prisma:query ${e.query}`);
    console.log('\x1b[90m%s\x1b[0m', `prisma:params ${JSON.stringify(e.params)}`);
    console.log('\x1b[90m%s\x1b[0m', `prisma:duration ${e.duration}ms`);
  });

  prismaInstance.$on('error' as never, (e: any) => {
    console.log('\x1b[1;31m%s\x1b[0m', `prisma:error ${e.message}`);
  });

  prismaInstance.$on('info' as never, (e: any) => {
    console.log('\x1b[36m%s\x1b[0m', `prisma:info ${e.message}`);
  });

  prismaInstance.$on('warn' as never, (e: any) => {
    console.log('\x1b[33m%s\x1b[0m', `prisma:warn ${e.message}`);
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
