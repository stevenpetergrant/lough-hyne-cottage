import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'cabin', 'sauna', 'yoga', 'bread'
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out"),
  duration: integer("duration"), // for hourly bookings (sauna)
  guests: integer("guests").default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed'
  paymentIntentId: text("payment_intent_id"),
  specialRequests: text("special_requests"),
  airbnbUid: text("airbnb_uid"), // For Airbnb calendar sync
  source: text("source").default("direct"), // 'direct', 'airbnb'
  addOns: jsonb("add_ons").default('{}'), // Track purchased add-ons: {"sauna": true, "breakfast": true}
  saunaBookingId: integer("sauna_booking_id"), // Link to sauna booking if add-on purchased
  emailsSent: jsonb("emails_sent").default('[]'), // Track email history
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  experienceType: text("experience_type").notNull(),
  date: timestamp("date").notNull(),
  availableSlots: integer("available_slots").notNull().default(1),
  bookedSlots: integer("booked_slots").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer("max_guests").default(2),
  duration: text("duration"), // e.g., "1 hour", "full day", "per night"
  amenities: text("amenities").array(),
  available: boolean("available").default(true),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

// Mailing list subscribers table
export const mailingListSubscribers = pgTable("mailing_list_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  experienceType: text("experience_type").notNull(), // 'yoga', 'bread', 'sauna', 'all'
  isActive: boolean("is_active").default(true),
  subscriptionSource: text("subscription_source").default("direct"), // 'booking', 'direct', 'website'
  unsubscribeToken: varchar("unsubscribe_token").unique(), // For secure unsubscribe links
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  lastEmailSent: timestamp("last_email_sent"),
});

export const insertMailingListSchema = createInsertSchema(mailingListSubscribers).omit({
  id: true,
  subscribedAt: true,
  unsubscribeToken: true,
});

// Vouchers table
export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  voucherCode: varchar("voucher_code", { length: 50 }).unique().notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  purchaserName: varchar("purchaser_name", { length: 255 }).notNull(),
  purchaserEmail: varchar("purchaser_email", { length: 255 }).notNull(),
  personalMessage: text("personal_message"),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  redeemedBy: varchar("redeemed_by", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type MailingListSubscriber = typeof mailingListSubscribers.$inferSelect;
export type InsertMailingListSubscriber = z.infer<typeof insertMailingListSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
