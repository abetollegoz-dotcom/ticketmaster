const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const ENUMS = `
enum UserRole {
  CUSTOMER
  ORGANIZER
  STAFF_SCANNER
  SUPPORT_AGENT
  ADMIN
  SUPER_ADMIN
}

enum EventStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  CANCELLED
  POSTPONED
  COMPLETED
  SUSPENDED
}

enum TicketStatus {
  VALID
  USED
  TRANSFERRED
  REFUNDED
  CANCELLED
  EXPIRED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  DISPUTED
}

enum PaymentProvider {
  STRIPE
  PAYPAL
  MOLLIE
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum PromoCodeType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_TICKET
}

enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum SupportTicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum NotificationType {
  ORDER_CONFIRMED
  TICKET_ISSUED
  EVENT_REMINDER
  EVENT_CANCELLED
  REFUND_PROCESSED
  TRANSFER_RECEIVED
  PAYOUT_SENT
  ACCOUNT_SECURITY
}

enum TicketTypeCategory {
  GENERAL
  VIP
  EARLY_BIRD
  STUDENT
  GROUP
  BALCONY
  FLOOR
  BACKSTAGE
}

enum PricingRule {
  FIXED
  DYNAMIC
}
`;

if (isProduction) {
  console.log('🚀 Production detected: Restoring PostgreSQL Schema and Enums...');
  
  // 1. Restore Provider
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  
  // 2. Restore Enums
  schema = schema.replace('// ─── Enums ───────────────────────────────────────────────────', '// ─── Enums ───────────────────────────────────────────────────' + ENUMS);

  // 3. Restore Decimal types (correct placement of ?)
  schema = schema.replace(/ Float\?/g, ' Decimal? @db.Decimal(10, 2)');
  schema = schema.replace(/ Float\b/g, ' Decimal @db.Decimal(10, 2)');
  
  // 4. Restore Json types
  const jsonFields = ['metadata', 'data', 'oldData', 'newData'];
  jsonFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} Json?`);
  });
  
  // 5. Restore String[] arrays
  const arrayFields = ['images', 'tags'];
  arrayFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} String[]`);
  });

  // 6. Restore @db.Text
  const textFields = ['description', 'content', 'message', 'resolution', 'manualPaymentNote', 'refundPolicy'];
  textFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String(\\??)`, 'g');
    schema = schema.replace(regex, `${field} String$1 @db.Text`);
  });

  // 7. Remove quotes from defaults
  schema = schema.replace(/@default\("([A-Z_]+)"\)/g, '@default($1)');

  console.log('✅ PostgreSQL Schema Restored.');
} else {
  console.log('💻 Local detected: Keeping SQLite Schema...');
}

fs.writeFileSync(schemaPath, schema);
