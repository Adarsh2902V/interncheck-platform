const { execSync } = require('child_process');

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

async function setupDatabase() {
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

      // Check if initial seed or re-seeding with low/medium risk listings is needed
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient({
          datasources: { db: { url: dbUrl } },
        });
        
        try {
          const userCount = await prisma.user.count();
          const mediumApprovedCount = await prisma.internship.count({
            where: { riskLevel: 'MEDIUM', verificationStatus: 'APPROVED' },
          });
          const highApprovedCount = await prisma.internship.count({
            where: { riskLevel: 'HIGH', verificationStatus: 'APPROVED' },
          });

          if (
            userCount === 0 ||
            mediumApprovedCount === 0 ||
            highApprovedCount === 0 ||
            process.env.FORCE_SEED === 'true'
          ) {
            console.log(
              `→ Populating/updating seed data (users: ${userCount}, medium approved: ${mediumApprovedCount}, high approved: ${highApprovedCount})...`
            );
            execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
            console.log('✓ Seed data populated successfully with Low, Medium, and High Risk internships.');
          } else {
            console.log(
              `✓ Cloud database up-to-date with ${userCount} users, ${mediumApprovedCount} medium-risk, and ${highApprovedCount} high-risk approved listings.`
            );
          }
        } catch (queryErr) {
          console.warn('Count query failed, running seed fallback:', queryErr.message);
          execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
        } finally {
          await prisma.$disconnect();
        }
      } catch (seedErr) {
        console.warn('Seed runner notice:', seedErr.message);
      }
    } catch (err) {
      console.warn('DB setup warning (non-fatal, continuing build):', err.message);
    }
  } else {
    console.log('Notice: No DATABASE_URL or POSTGRES_PRISMA_URL found during build step.');
  }
}

setupDatabase();

