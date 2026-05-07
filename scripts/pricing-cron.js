const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runDynamicPricing() {
  console.log("[Pricing Cron] Starting dynamic pricing update...");
  
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      ticketTypes: true,
      pricingRules: { where: { isActive: true } }
    }
  });

  for (const event of events) {
    for (const rule of event.pricingRules) {
      const ticketTypes = event.ticketTypes.filter(tt => 
        !rule.ticketTypeId || tt.id === rule.ticketTypeId
      );

      for (const tt of ticketTypes) {
        let multiplier = 1.0;
        
        // 1. Demand-based pricing (sold / total)
        const soldRatio = tt.quantitySold / tt.quantity;
        if (soldRatio > 0.8) multiplier *= 1.25;
        else if (soldRatio > 0.5) multiplier *= 1.15;

        // 2. Time-based pricing
        const eventDate = await prisma.eventDate.findFirst({
          where: { eventId: event.id },
          orderBy: { startDate: "asc" }
        });

        if (eventDate) {
          const daysToEvent = (eventDate.startDate - new Date()) / (1000 * 60 * 60 * 24);
          if (daysToEvent < 3) multiplier *= 1.2;
          else if (daysToEvent < 7) multiplier *= 1.1;
        }

        // Apply rule multiplier
        multiplier *= rule.priceMultiplier;
        multiplier = Math.min(multiplier, rule.maxPriceMultiplier);

        // Use originalPrice as the base, or initialize it if null
        const basePrice = tt.originalPrice ? Number(tt.originalPrice) : Number(tt.price);
        if (!tt.originalPrice) {
           await prisma.ticketType.update({ where: { id: tt.id }, data: { originalPrice: tt.price } });
        }

        const newPrice = Number((basePrice * multiplier).toFixed(2));
        
        if (Math.abs(newPrice - Number(tt.price)) > 0.01) {
          await prisma.ticketType.update({
            where: { id: tt.id },
            data: { price: newPrice, updatedAt: new Date() }
          });
          console.log(`[Pricing Cron] Updated ${tt.name} price: ${tt.price} -> ${newPrice}`);
        }
      }
    }
  }
}

runDynamicPricing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
