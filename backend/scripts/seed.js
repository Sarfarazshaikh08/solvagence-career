require('dotenv').config();
const connectDB = require('../config/db');
const { seedDatabase } = require('./seedData');

async function seed() {
  await connectDB();
  await seedDatabase();

  console.log('\n✅ Seed complete.');
  console.log(`   Admin login: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'Solvagence@2025!'}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
