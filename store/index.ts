import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { CartItem, CartUpsell, CheckoutSummary } from "@/types";

// ─── Cart Store ───────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  upsells: CartUpsell[];
  promoCode: string | null;
  promoDiscount: number;
  currency: string;

  addItem: (item: CartItem) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  addUpsell: (upsell: CartUpsell) => void;
  removeUpsell: (id: string) => void;
  setPromoCode: (code: string | null, discount: number) => void;
  clearCart: () => void;
  getSummary: () => CheckoutSummary;
}

const SERVICE_FEE_RATE = 0.05;
const TAX_RATE = 0.08;

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        upsells: [],
        promoCode: null,
        promoDiscount: 0,
        currency: "USD",

        addItem: (item) =>
          set((state) => {
            const existing = state.items.find(
              (i) => i.ticketTypeId === item.ticketTypeId
            );
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.ticketTypeId === item.ticketTypeId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, item] };
          }),

        removeItem: (ticketTypeId) =>
          set((state) => ({
            items: state.items.filter((i) => i.ticketTypeId !== ticketTypeId),
          })),

        updateQuantity: (ticketTypeId, quantity) =>
          set((state) => ({
            items:
              quantity <= 0
                ? state.items.filter((i) => i.ticketTypeId !== ticketTypeId)
                : state.items.map((i) =>
                    i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i
                  ),
          })),

        addUpsell: (upsell) =>
          set((state) => {
            const existing = state.upsells.find((u) => u.id === upsell.id);
            if (existing) return state;
            return { upsells: [...state.upsells, upsell] };
          }),

        removeUpsell: (id) =>
          set((state) => ({
            upsells: state.upsells.filter((u) => u.id !== id),
          })),

        setPromoCode: (code, discount) =>
          set({ promoCode: code, promoDiscount: discount }),

        clearCart: () =>
          set({ items: [], upsells: [], promoCode: null, promoDiscount: 0 }),

        getSummary: (): CheckoutSummary => {
          const { items, upsells, promoDiscount, currency } = get();
          const itemsSubtotal = items.reduce(
            (sum, i) => sum + i.unitPrice * i.quantity,
            0
          );
          const upsellsTotal = upsells.reduce(
            (sum, u) => sum + u.price * u.quantity,
            0
          );
          const subtotal = itemsSubtotal + upsellsTotal;
          const discount = promoDiscount;
          const discountedSubtotal = Math.max(0, subtotal - discount);
          const serviceFee = Math.round(discountedSubtotal * SERVICE_FEE_RATE * 100) / 100;
          const taxAmount = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
          const total = discountedSubtotal + serviceFee + taxAmount;

          return {
            subtotal,
            discount,
            serviceFee,
            taxAmount,
            total: Math.round(total * 100) / 100,
            currency,
          };
        },
      }),
      { name: "eventhub-cart" }
    )
  )
);

// ─── UI Store ────────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  theme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: "dark",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "eventhub-ui" }
  )
);

// ─── Queue Store ─────────────────────────────────────────────

interface QueueState {
  sessionId: string | null;
  eventId: string | null;
  position: number | null;
  status: "idle" | "waiting" | "admitted" | "expired";
  setQueueSession: (sessionId: string, eventId: string, position: number) => void;
  updatePosition: (position: number) => void;
  setAdmitted: () => void;
  resetQueue: () => void;
}

export const useQueueStore = create<QueueState>()((set) => ({
  sessionId: null,
  eventId: null,
  position: null,
  status: "idle",
  setQueueSession: (sessionId, eventId, position) =>
    set({ sessionId, eventId, position, status: "waiting" }),
  updatePosition: (position) => set({ position }),
  setAdmitted: () => set({ status: "admitted" }),
  resetQueue: () =>
    set({ sessionId: null, eventId: null, position: null, status: "idle" }),
}));
