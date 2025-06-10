import { mysqlTable, text, int, boolean, timestamp, decimal, varchar, json, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").primaryKey().autoincrement(),
  type: text("type").notNull(), // 'cabin', 'sauna', 'yoga', 'bread'
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out"),
  duration: int("duration"), // for hourly bookings (sauna)
  guests: int("guests").default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled'
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed'
  paymentIntentId: text("payment_intent_id"),
  specialRequests: text("special_requests"),
  airbnbUid: text("airbnb_uid"), // For Airbnb calendar sync
  source: text("source").default("direct"), // 'direct', 'airbnb'
  addOns: json("add_ons").default('{}'), // Track purchased add-ons: {"sauna": true, "breakfast": true}
  saunaBookingId: int("sauna_booking_id"), // Link to sauna booking if add-on purchased
  emailsSent: json("emails_sent").default('[]'), // Track email history
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const availability = mysqlTable("availability", {
  id: int("id").primaryKey().autoincrement(),
  type: text("type").notNull(), // 'cabin', 'sauna', 'yoga', 'bread'
  date: timestamp("date").notNull(),
  startTime: text("start_time"), // For timed sessions like sauna
  endTime: text("end_time"),
  maxCapacity: int("max_capacity").default(1),
  currentBookings: int("current_bookings").default(0),
  isAvailable: boolean("is_available").default(true),
  price: decimal("price", { precision: 10, scale: 2 }),
});

export const experiences = mysqlTable("experiences", {
  id: int("id").primaryKey().autoincrement(),
  type: text("type").notNull().unique(), // 'sauna', 'yoga', 'bread'
  name: text("name").notNull(),
  description: text("description"),
  duration: int("duration"), // in minutes
  maxParticipants: int("max_participants").default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  amenities: text("amenities"), // JSON string for MySQL compatibility
  isActive: boolean("is_active").default(true),
  images: text("images"), // JSON string for image URLs
  bookingInstructions: text("booking_instructions"),
  cancellationPolicy: text("cancellation_policy"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
  createdAt: true,
});

// Mailing list for notifications
export const mailingListSubscribers = mysqlTable("mailing_list_subscribers", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  experienceType: text("experience_type"), // Which experience they're interested in
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  lastEmailSent: timestamp("last_email_sent"),
  isActive: boolean("is_active").default(true),
  unsubscribeToken: varchar("unsubscribe_token", { length: 255 }).unique(),
});

export const insertMailingListSchema = createInsertSchema(mailingListSubscribers).omit({
  id: true,
  subscriptionDate: true,
});

// Voucher system
export const vouchers = mysqlTable("vouchers", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("voucher_code", { length: 50 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  purchaserName: text("purchaser_name").notNull(),
  purchaserEmail: text("purchaser_email").notNull(),
  personalMessage: text("personal_message"),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  redeemedAmount: decimal("redeemed_amount", { precision: 10, scale: 2 }).default('0.00'),
  expiresAt: timestamp("expires_at").notNull(),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
});

// Type exports
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