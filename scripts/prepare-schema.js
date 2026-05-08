const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProduction) {
  console.log('🚀 Production detected: Restoring PostgreSQL Schema...');
  
  // 1. Restore Provider
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  
  // 2. Restore Decimal types (with attributes if they were there)
  // We'll restore a generic Decimal(10, 2) which is what most fields had
  schema = schema.replace(/ Float/g, ' Decimal @db.Decimal(10, 2)');
  
  // 3. Restore Json types
  const jsonFields = ['metadata', 'data', 'oldData', 'newData'];
  jsonFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} Json?`);
  });
  
  // 4. Restore String[] arrays
  const arrayFields = ['images', 'tags'];
  arrayFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} String[]`);
  });

  // 5. Restore @db.Text
  const textFields = ['description', 'content', 'message', 'resolution', 'manualPaymentNote', 'refundPolicy'];
  textFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String(\\??)`, 'g');
    schema = schema.replace(regex, `${field} String$1 @db.Text`);
  });

  console.log('✅ PostgreSQL Schema Restored.');
} else {
  console.log('💻 Local detected: Keeping SQLite Schema...');
}

fs.writeFileSync(schemaPath, schema);
