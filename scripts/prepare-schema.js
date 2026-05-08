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
  console.log('🚀 Production detected: Restoring PostgreSQL Schema with Surgical Precision...');
  
  // 1. Restore Provider
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  
  // 2. Restore Enums
  schema = schema.replace('// ─── Enums ───────────────────────────────────────────────────', '// ─── Enums ───────────────────────────────────────────────────' + ENUMS);

  // 3. Restore Field Types to Enums (Model by Model to be safe)
  // User
  schema = schema.replace(/model User \{[^}]+\}/g, m => m.replace(/role\s+String/g, 'role UserRole').replace(/@default\("CUSTOMER"\)/g, '@default(CUSTOMER)'));
  
  // Event
  schema = schema.replace(/model Event \{[^}]+\}/g, m => m.replace(/status\s+String/g, 'status EventStatus').replace(/@default\("DRAFT"\)/g, '@default(DRAFT)'));

  // Ticket
  schema = schema.replace(/model Ticket \{[^}]+\}/g, m => m.replace(/status\s+String/g, 'status TicketStatus').replace(/@default\("VALID"\)/g, '@default(VALID)'));

  // Order
  schema = schema.replace(/model Order \{[^}]+\}/g, m => m.replace(/status\s+String/g, 'status OrderStatus').replace(/@default\("PENDING"\)/g, '@default(PENDING)'));

  // Payment
  schema = schema.replace(/model Payment \{[^}]+\}/g, m => 
    m.replace(/status\s+String/g, 'status PaymentStatus')
     .replace(/provider\s+String/g, 'provider PaymentProvider')
     .replace(/@default\("PENDING"\)/g, '@default(PENDING)')
     .replace(/@default\("STRIPE"\)/g, '@default(STRIPE)')
  );

  // TicketType
  schema = schema.replace(/model TicketType \{[^}]+\}/g, m => 
    m.replace(/category\s+String/g, 'category TicketTypeCategory')
     .replace(/pricingRule\s+String/g, 'pricingRule PricingRule')
     .replace(/@default\("GENERAL"\)/g, '@default(GENERAL)')
     .replace(/@default\("FIXED"\)/g, '@default(FIXED)')
  );

  // SupportTicket
  schema = schema.replace(/model SupportTicket \{[^}]+\}/g, m => 
    m.replace(/status\s+String/g, 'status SupportTicketStatus')
     .replace(/priority\s+String/g, 'priority SupportTicketPriority')
     .replace(/@default\("OPEN"\)/g, '@default(OPEN)')
     .replace(/@default\("MEDIUM"\)/g, '@default(MEDIUM)')
  );

  // PromoCode
  schema = schema.replace(/model PromoCode \{[^}]+\}/g, m => m.replace(/type\s+String/g, 'type PromoCodeType').replace(/@default\("PERCENTAGE"\)/g, '@default(PERCENTAGE)'));

  // 4. Restore Decimal types
  schema = schema.replace(/ Float\?/g, ' Decimal? @db.Decimal(10, 2)');
  schema = schema.replace(/ Float\b/g, ' Decimal @db.Decimal(10, 2)');
  
  // 5. Restore Json types
  const jsonFields = ['metadata', 'data', 'oldData', 'newData'];
  jsonFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} Json?`);
  });
  
  // 6. Restore String[] arrays
  const arrayFields = ['images', 'tags'];
  arrayFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String\\?`, 'g');
    schema = schema.replace(regex, `${field} String[]`);
  });

  // 7. Restore @db.Text
  const textFields = ['description', 'content', 'message', 'resolution', 'manualPaymentNote', 'refundPolicy'];
  textFields.forEach(field => {
    const regex = new RegExp(`${field}\\s+String(\\??)`, 'g');
    schema = schema.replace(regex, `${field} String$1 @db.Text`);
  });

  console.log('✅ PostgreSQL Schema Restored with Surgical Precision.');
} else {
  console.log('💻 Local detected: Keeping SQLite Schema...');
}

fs.writeFileSync(schemaPath, schema);
