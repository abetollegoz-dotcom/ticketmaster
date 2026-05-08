import { UserRole } from "@prisma/client";

// ─── Re-export Prisma enums ───────────────────────────────────
export { UserRole, EventStatus, TicketStatus, OrderStatus, PaymentStatus } from "@prisma/client";

// ─── Extended Session ─────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

// ─── Event Types ──────────────────────────────────────────────
export interface EventCard {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string | null;
  images: string[] | string;
  isFeatured: boolean;
  isTrending: boolean;
  category?: { name: string; slug: string; color?: string | null } | null;
  venue?: { name: string; city: string; country: string } | null;
  dates: { startDate: Date; endDate: Date }[];
  ticketTypes: { price: number | string; name: string }[];
  totalSales: number;
  _count?: { favorites: number };
}

export interface EventDetail extends EventCard {
  description: string;
  tags: string[] | string;
  refundPolicy?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  organizer: {
    organizationName: string;
    slug: string;
    logo?: string | null;
    isVerified: boolean;
  };
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  ticketTypes: TicketTypeDetail[];
  reviews: ReviewItem[];
}

export interface TicketTypeDetail {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price: number | string;
  originalPrice?: number | string | null;
  quantity: number;
  quantitySold: number;
  quantityReserved: number;
  minPerOrder: number;
  maxPerOrder: number;
  saleStartDate?: Date | null;
  saleEndDate?: Date | null;
  isVisible: boolean;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user: { name?: string | null; image?: string | null };
}

// ─── Order Types ──────────────────────────────────────────────
export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  eventDateId?: string;
  quantity: number;
  unitPrice: number;
  ticketTypeName: string;
  eventTitle: string;
  eventDate?: string;
  seatId?: string;
}

export interface CartUpsell {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  serviceFee: number;
  taxAmount: number;
  total: number;
  currency: string;
  promoCode?: string;
}

// ─── Ticket Types ─────────────────────────────────────────────
export interface TicketWithDetails {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  usedAt?: Date | null;
  createdAt: Date;
  ticketType: { name: string; category: string };
  order: {
    orderNumber: string;
    createdAt: Date;
    event?: { title: string; slug: string } | null;
    eventDate?: { startDate: Date } | null;
  };
}

// ─── Dashboard Analytics ─────────────────────────────────────
export interface OrganizerStats {
  totalRevenue: number;
  totalTicketsSold: number;
  totalEvents: number;
  conversionRate: number;
  revenueByMonth: { month: string; revenue: number }[];
  salesByEvent: { event: string; sold: number; revenue: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date;
    user: { name?: string | null };
  }[];
}

export interface AdminStats {
  gmv: number;
  platformRevenue: number;
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalOrders: number;
  refundRatio: number;
  fraudAlerts: number;
}

// ─── Search ───────────────────────────────────────────────────
export interface SearchFilters {
  [key: string]: string | number | undefined;
  query?: string;
  city?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "date" | "price_asc" | "price_desc" | "popularity" | "trending";
  sort?: "date" | "price_asc" | "price_desc" | "popularity" | "trending";
  page?: number;
  limit?: number;
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Navigation ───────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
}

// ─── RBAC helpers ─────────────────────────────────────────────
export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ORGANIZER: "ORGANIZER",
  STAFF_SCANNER: "STAFF_SCANNER",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = keyof typeof ROLES;

export function hasRole(userRole: string, ...allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role);
}

export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

export function isOrganizer(role: string): boolean {
  return role === ROLES.ORGANIZER || isAdmin(role);
}
