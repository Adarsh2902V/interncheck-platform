const { execSync } = require('child_process');

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log('✓ Found database connection URL from environment.');
  try {
    console.log('→ Running prisma db push to ensure all tables exist in cloud database...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('✓ Cloud database schema synchronized successfully.');

    // Check if initial seed is needed
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient({
        datasources: { db: { url: dbUrl } },
      });
      prisma.user
        .count()
        .then((count) => {
          if (count === 0) {
            console.log('→ Empty database detected. Populating seed data...');
            execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
            console.log('✓ Seed data populated successfully.');
          } else {
            console.log(`✓ Cloud database already initialized with ${count} users.`);
          }
        })
        .catch((err) => {
          console.warn('Count query failed, running seed fallback:', err.message);
          execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
        })
        .finally(() => {
          prisma.$disconnect();
        });
    } catch (seedErr) {
      console.warn('Seed runner notice:', seedErr.message);
    }
  } catch (err) {
    console.warn('DB setup warning (non-fatal, continuing build):', err.message);
  }
} else {
  console.log('Notice: No DATABASE_URL or POSTGRES_PRISMA_URL found during build step.');
}
