import { mysqlTable, int, varchar, text, timestamp, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Guest experiences shared by visitors
export const guestExperiences = mysqlTable("guest_experiences", {
  id: int("id").primaryKey().autoincrement(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }),
  stayDate: timestamp("stay_date").notNull(),
  experienceTitle: varchar("experience_title", { length: 255 }).notNull(),
  experienceDescription: text("experience_description").notNull(),
  recommendation: text("recommendation"),
  photos: text("photos"), // JSON string for MySQL compatibility
  isApproved: boolean("is_approved").default(false),
  isPublic: boolean("is_public").default(true),
  qrCodeId: varchar("qr_code_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// QR codes for guest access
export const guestQrCodes = mysqlTable("guest_qr_codes", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  bookingId: int("booking_id"),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGuestExperienceSchema = createInsertSchema(guestExperiences).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export const insertQrCodeSchema = createInsertSchema(guestQrCodes).omit({
  id: true,
  createdAt: true,
});

export type GuestExperience = typeof guestExperiences.$inferSelect;
export type InsertGuestExperience = z.infer<typeof insertGuestExperienceSchema>;
export type GuestQrCode = typeof guestQrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;