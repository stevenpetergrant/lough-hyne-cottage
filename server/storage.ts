import { users, type User, type UpsertUser, bookings, type Booking, type InsertBooking, experiences, type Experience, type InsertExperience, availability, mailingListSubscribers, type MailingListSubscriber, type InsertMailingListSubscriber } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByType(type: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  addEmailToBooking(bookingId: number, emailData: any): Promise<Booking | undefined>;
  
  // Experience operations
  getExperience(id: number): Promise<Experience | undefined>;
  getExperienceByType(type: string): Promise<Experience | undefined>;
  getAllExperiences(): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  
  // Availability operations
  getAvailabilityByType(type: string): Promise<any[]>;
  getAvailabilityByDateAndType(date: Date, type: string): Promise<any | undefined>;
  createAvailability(availability: any): Promise<any>;
  updateAvailability(id: number, availability: any): Promise<any | undefined>;
  deleteAvailability(id: number): Promise<boolean>;
  
  // Mailing list operations
  subscribeToMailingList(subscriber: InsertMailingListSubscriber): Promise<MailingListSubscriber>;
  getMailingListSubscribers(experienceType?: string): Promise<MailingListSubscriber[]>;
  unsubscribeFromMailingList(token: string): Promise<boolean>;
  updateLastEmailSent(subscriberId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default experiences
    this.initializeExperiences();
    // Initialize yoga retreat dates
    this.initializeYogaRetreats();
  }

  private async initializeExperiences() {
    try {
      const defaultExperiences: InsertExperience[] = [
        {
          type: "cabin",
          name: "Lough Hyne Cottage",
          description: "Sustainable luxury accommodation with solar power, rainwater harvesting, and locally sourced materials. Features a private deck with nature views and wood-fired bathtub.",
          basePrice: "145.00",
          maxGuests: 2,
          duration: "per night",
          amenities: ["Solar-powered with backup systems", "Private deck with nature views", "Organic linens and amenities", "Kitchenette with local ingredients"],
          available: true,
        },
        {
          type: "bread",
          name: "Wood-Fired Bread Making Workshop",
          description: "Join us monthly as we fire up our traditional wood stove to create artisanal bread and pastries. Learn the ancient art of sourdough baking while connecting with our local community.",
          basePrice: "135.00",
          maxGuests: 8,
          duration: "11 am - 5pm",
          amenities: [
            "A delicious vegetarian lunch made with organic, fresh, local ingredients",
            "Organic/Fair Trade tea and coffee served throughout the day",
            "Fresh sourdough starter to bring home with you",
            "A selection of breads you have baked yourself to bring home with you"
          ],
          available: true,
        },
        {
          type: "yoga",
          name: "Monthly Yoga Mini-Retreats",
          description: "Immerse yourself in tranquil yoga sessions surrounded by the natural beauty of Lough Hyne. Combined with hyper-local, veggie-filled meals inspired by California meets West Cork cuisine.",
          basePrice: "80.00",
          maxGuests: 20,
          duration: "Full Day",
          amenities: ["Peaceful natural setting", "California-West Cork fusion meals", "All levels welcome"],
          available: true,
        },
        {
          type: "sauna",
          name: "Sauna Sessions",
          description: "Experience authentic Finnish sauna culture in our traditional wood-fired sauna. Relax, rejuvenate, and connect with nature in this timeless wellness practice.",
          basePrice: "70.00",
          maxGuests: 6,
          duration: "1-2 Hours",
          amenities: ["Wood-fired experience", "Natural setting", "Wellness focused"],
          available: true,
        },
      ];

      // Check if experiences already exist to avoid duplicates
      const existingExperiences = await db.select().from(experiences);
      if (existingExperiences.length === 0) {
        for (const exp of defaultExperiences) {
          await db.insert(experiences).values(exp);
        }
      }
    } catch (error) {
      console.error("Error initializing experiences:", error);
    }
  }

  private async initializeYogaRetreats() {
    try {
      const yogaRetreatDates = [
        new Date('2025-07-25T10:00:00'),  // July 25th, 2025
        new Date('2025-08-15T10:00:00'),  // August 15th, 2025
        new Date('2025-09-05T10:00:00'),  // September 5th, 2025
      ];

      for (const date of yogaRetreatDates) {
        // Check if this date already exists to avoid duplicates
        const existing = await db.select()
          .from(availability)
          .where(and(
            eq(availability.experienceType, 'yoga'),
            eq(availability.date, date)
          ));

        if (existing.length === 0) {
          await db.insert(availability).values({
            experienceType: 'yoga',
            date: date,
            availableSlots: 20, // Max guests for yoga as defined in experiences
            bookedSlots: 0,
            isBlocked: false
          });
        }
      }

      // Initialize test bookings for experiences
      await this.initializeTestBookings();
    } catch (error) {
      console.error("Error initializing yoga retreat dates:", error);
    }
  }

  private async initializeTestBookings() {
    try {
      // Check if test bookings already exist
      const existingBookings = await db.select().from(bookings);
      const hasYogaBookings = existingBookings.some(b => b.type === 'yoga');
      const hasSaunaBookings = existingBookings.some(b => b.type === 'sauna');

      if (!hasYogaBookings) {
        const testYogaBookings = [
          {
            type: 'yoga',
            customerName: 'David Walsh',
            customerEmail: 'david.walsh@email.com',
            customerPhone: '+353 87 123 4567',
            checkIn: new Date('2025-07-25T10:00:00'),
            checkOut: new Date('2025-07-25T17:00:00'),
            guests: 2,
            totalPrice: '160.00',
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'First time doing yoga, beginner level preferred',
            source: 'direct',
            emailsSent: []
          },
          {
            type: 'yoga',
            customerName: 'Sarah O\'Connor',
            customerEmail: 'sarah.oconnor@email.com',
            customerPhone: '+353 86 234 5678',
            checkIn: new Date('2025-08-15T10:00:00'),
            checkOut: new Date('2025-08-15T17:00:00'),
            guests: 1,
            totalPrice: '80.00',
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'Vegetarian meal preference',
            source: 'direct',
            emailsSent: []
          }
        ];

        for (const booking of testYogaBookings) {
          await db.insert(bookings).values(booking);
        }
      }

      if (!hasSaunaBookings) {
        const testSaunaBookings = [
          {
            type: 'sauna',
            customerName: 'Anne Fitzgerald',
            customerEmail: 'anne.fitzgerald@email.com',
            customerPhone: '+353 85 345 6789',
            checkIn: new Date('2025-07-20T15:00:00'),
            checkOut: new Date('2025-07-20T17:00:00'),
            guests: 4,
            totalPrice: '280.00',
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'Group session for family visit',
            source: 'direct',
            emailsSent: []
          },
          {
            type: 'sauna',
            customerName: 'Michael Ryan',
            customerEmail: 'michael.ryan@email.com',
            customerPhone: '+353 87 456 7890',
            checkIn: new Date('2025-08-10T18:00:00'),
            checkOut: new Date('2025-08-10T20:00:00'),
            guests: 2,
            totalPrice: '140.00',
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'Evening session preferred',
            source: 'direct',
            emailsSent: []
          }
        ];

        for (const booking of testSaunaBookings) {
          await db.insert(bookings).values(booking);
        }
      }
    } catch (error) {
      console.error("Error initializing test bookings:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByType(type: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.type, type));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, updateData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async addEmailToBooking(bookingId: number, emailData: any): Promise<Booking | undefined> {
    const booking = await this.getBooking(bookingId);
    if (!booking) return undefined;

    const currentEmails = Array.isArray(booking.emailsSent) ? booking.emailsSent : [];
    const updatedEmails = [...currentEmails, emailData];

    return await this.updateBooking(bookingId, {
      emailsSent: updatedEmails as any
    });
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.id, id));
    return experience || undefined;
  }

  async getExperienceByType(type: string): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.type, type));
    return experience || undefined;
  }

  async getAllExperiences(): Promise<Experience[]> {
    return await db.select().from(experiences);
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const [experience] = await db.insert(experiences).values(insertExperience).returning();
    return experience;
  }

  async updateExperience(id: number, updateData: Partial<InsertExperience>): Promise<Experience | undefined> {
    const [experience] = await db.update(experiences)
      .set(updateData)
      .where(eq(experiences.id, id))
      .returning();
    return experience || undefined;
  }

  // Availability operations
  async getAvailabilityByType(type: string): Promise<any[]> {
    const slots = await db
      .select()
      .from(availability)
      .where(eq(availability.experienceType, type))
      .orderBy(availability.date);
    return slots;
  }

  async getAvailabilityByDateAndType(date: Date, type: string): Promise<any | undefined> {
    const [slot] = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.experienceType, type),
          eq(availability.date, date)
        )
      );
    return slot || undefined;
  }

  async createAvailability(availabilityData: any): Promise<any> {
    // Map camelCase to snake_case for database columns
    const dbData = {
      experienceType: availabilityData.experienceType,
      date: availabilityData.date,
      availableSlots: availabilityData.availableSlots,
      bookedSlots: availabilityData.bookedSlots,
      isBlocked: availabilityData.isBlocked
    };
    
    const [slot] = await db
      .insert(availability)
      .values(dbData)
      .returning();
    return slot;
  }

  async updateAvailability(id: number, updateData: any): Promise<any | undefined> {
    const [slot] = await db
      .update(availability)
      .set(updateData)
      .where(eq(availability.id, id))
      .returning();
    return slot || undefined;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    try {
      await db
        .delete(availability)
        .where(eq(availability.id, id));
      return true;
    } catch (error) {
      console.error(`Failed to delete availability slot ${id}:`, error);
      return false;
    }
  }

  // Mailing list operations
  async subscribeToMailingList(subscriberData: InsertMailingListSubscriber): Promise<MailingListSubscriber> {
    // Generate unique unsubscribe token
    const unsubscribeToken = `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [subscriber] = await db
      .insert(mailingListSubscribers)
      .values({
        ...subscriberData,
        unsubscribeToken
      })
      .onConflictDoUpdate({
        target: mailingListSubscribers.email,
        set: {
          firstName: subscriberData.firstName,
          lastName: subscriberData.lastName,
          experienceType: subscriberData.experienceType,
          isActive: true,
          subscriptionSource: subscriberData.subscriptionSource,
        }
      })
      .returning();
    return subscriber;
  }

  async getMailingListSubscribers(experienceType?: string): Promise<MailingListSubscriber[]> {
    if (experienceType) {
      return await db
        .select()
        .from(mailingListSubscribers)
        .where(
          and(
            eq(mailingListSubscribers.isActive, true),
            sql`${mailingListSubscribers.experienceType} = ${experienceType} OR ${mailingListSubscribers.experienceType} = 'all'`
          )
        );
    }

    return await db
      .select()
      .from(mailingListSubscribers)
      .where(eq(mailingListSubscribers.isActive, true));
  }

  async unsubscribeFromMailingList(token: string): Promise<boolean> {
    const result = await db
      .update(mailingListSubscribers)
      .set({ isActive: false })
      .where(eq(mailingListSubscribers.unsubscribeToken, token));
    return true;
  }

  async updateLastEmailSent(subscriberId: number): Promise<void> {
    await db
      .update(mailingListSubscribers)
      .set({ lastEmailSent: new Date() })
      .where(eq(mailingListSubscribers.id, subscriberId));
  }
}

export const storage = new DatabaseStorage();