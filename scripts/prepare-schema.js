const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Detect environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProduction) {
  console.log('🚀 Production detected: Switching Prisma to PostgreSQL...');
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  // Revert temporary SQLite type changes if necessary
  // Note: We'll keep the Float/String changes for now as they are mostly compatible with Postgres
  // but we must ensure the provider is correct.
} else {
  console.log('💻 Local detected: Keeping Prisma as SQLite...');
}

fs.writeFileSync(schemaPath, schema);
