import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { storage } from "./storage";
import { requireAdmin, adminLogin } from "./auth";
import Stripe from "stripe";
import { airbnbSync } from "./airbnb-integration";
import { sendContactEmail, sendBookingConfirmation, sendTestEmail, sendPreArrivalEmail, sendThankYouEmail, sendNewGuestExperienceNotification } from "./email";
import { createVoucher, validateVoucher, redeemVoucher } from "./voucher-system";
import { validateGuestQrCode, saveGuestExperience, getPublicGuestExperiences, createGuestQrCode } from "./guest-experience";
import { subscribeFromBooking, sendNewYogaDateNotification } from "./mailing-list";
import { generateVoucherCode } from "./voucher-system";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("Stripe initialized");
} else {
  console.warn("STRIPE_SECRET_KEY not set - payment features will be disabled");
}
import { insertBookingSchema, insertExperienceSchema } from "@shared/schema";
import { guestExperiences } from "@shared/guest-experience-schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { generateSitemap, generateRobotsTxt } from "../client/src/components/sitemap-generator";

// Configure multer for photo uploads
const multerStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'guest-photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'guest-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  app.post("/api/admin/login", adminLogin);
  
  app.get("/api/admin/auth", requireAdmin, (req, res) => {
    res.json({ authenticated: true });
  });

  // Get all experiences
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  // Get experience by type
  app.get("/api/experiences/:type", async (req, res) => {
    try {
      const experience = await storage.getExperienceByType(req.params.type);
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experience" });
    }
  });

  // Get Airbnb bookings for calendar display
  app.get("/api/airbnb-bookings", async (req, res) => {
    try {
      const airbnbEvents = await airbnbSync.fetchAirbnbCalendar();
      const bookedDates = airbnbEvents.map(event => ({
        start: event.start.toISOString().split('T')[0],
        end: event.end.toISOString().split('T')[0],
        summary: event.summary
      }));
      res.json(bookedDates);
    } catch (error) {
      console.error("Failed to fetch Airbnb bookings:", error);
      res.status(500).json({ message: "Failed to fetch Airbnb bookings" });
    }
  });

  // Get availability for an experience type
  app.get("/api/availability/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { start, end } = req.query;
      
      // For now, return sample availability data
      // In production, this would query the availability table
      const availability = [];
      const startDate = start ? new Date(start as string) : new Date();
      const endDate = end ? new Date(end as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Generate availability for next 30 days
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Different availability patterns for different experiences
        let availableSlots = 1;
        let bookedSlots = 0;
        
        if (type === 'bread') {
          availableSlots = 8; // max 8 people
        } else if (type === 'yoga') {
          availableSlots = 20; // max 20 people
        } else if (type === 'sauna') {
          // Sauna is time-based booking, not slot-based
          // Generate available time slots for the day
          availableSlots = 1; // 1 booking slot per time period
        }
        
        // Randomly block some dates for demonstration
        const isBlocked = Math.random() < 0.1; // 10% chance of being blocked
        
        availability.push({
          date: d.toISOString(),
          availableSlots,
          bookedSlots,
          isBlocked
        });
      }
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Create payment intent for experience booking
  app.post("/api/create-experience-payment", async (req, res) => {
    try {
      const {
        experienceId,
        experienceType,
        date,
        guests,
        duration,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalPrice
      } = req.body;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Convert to cents
        currency: "eur",
        metadata: {
          experienceType,
          experienceId: experienceId.toString(),
          date: date,
          guests: guests.toString(),
          duration: duration?.toString() || "",
          customerName,
          customerEmail
        }
      });

      // Create pending booking
      const bookingData = {
        type: experienceType,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "",
        checkIn: new Date(date),
        checkOut: experienceType === 'sauna' ? new Date(new Date(date).getTime() + (duration || 1) * 60 * 60 * 1000) : null,
        duration: experienceType === 'sauna' ? duration : null,
        guests,
        totalPrice: totalPrice.toString(),
        status: "pending",
        paymentStatus: "pending",
        paymentIntentId: paymentIntent.id,
        specialRequests: specialRequests || "",
        source: "direct"
      };

      const booking = await storage.createBooking(bookingData);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id
      });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Create voucher payment session
  app.post("/api/create-voucher-payment", async (req, res) => {
    try {
      const {
        amount,
        recipientName,
        recipientEmail,
        purchaserName,
        purchaserEmail,
        personalMessage
      } = req.body;

      if (!amount || amount < 50 || amount % 10 !== 0) {
        return res.status(400).json({ 
          message: "Invalid voucher amount. Must be minimum €50 in €10 increments." 
        });
      }

      if (!recipientName || !recipientEmail || !purchaserName || !purchaserEmail) {
        return res.status(400).json({ 
          message: "All required fields must be provided." 
        });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Lough Hyne Cottage Gift Voucher - €${amount}`,
              description: `Gift voucher for experiences at Lough Hyne Cottage. Valid for 12 months.`,
              images: ['https://loughhynecottage.com/wp-content/uploads/2024/08/Untitled-design-12.png'],
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/voucher-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/vouchers?canceled=true`,
        metadata: {
          type: 'voucher',
          amount: amount.toString(),
          recipientName,
          recipientEmail,
          purchaserName,
          purchaserEmail,
          personalMessage: personalMessage || '',
        },
        customer_email: purchaserEmail,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Voucher payment session creation error:", error);
      res.status(500).json({ 
        message: "Error creating voucher payment session: " + error.message 
      });
    }
  });

  // Helper function to create sauna availability for cabin guests with add-on
  async function createSaunaAvailabilityForGuest(cabinBooking: any) {
    try {
      const checkIn = new Date(cabinBooking.checkIn);
      const checkOut = new Date(cabinBooking.checkOut || cabinBooking.checkIn);
      
      // Create sauna slots for each evening during their stay
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const eveningSlots = [
          { hour: 19, minute: 0 }, // 7pm
          { hour: 20, minute: 0 }  // 8pm
        ];
        
        for (const slot of eveningSlots) {
          const slotDateTime = new Date(d);
          slotDateTime.setHours(slot.hour, slot.minute, 0, 0);
          
          // Check if slot already exists
          const existing = await storage.getAvailabilityByDateAndType(slotDateTime, "sauna");
          if (!existing) {
            await storage.createAvailability({
              experienceType: "sauna",
              date: slotDateTime,
              availableSlots: 1,
              bookedSlots: 0,
              isBlocked: false
            });
          }
        }
      }
      console.log(`Created sauna slots for cabin booking ${cabinBooking.id} during stay`);
    } catch (error) {
      console.error("Error creating sauna availability:", error);
    }
  }

  // Stripe webhook to handle payment completion
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Handle voucher purchases
        if (session.metadata?.type === 'voucher') {
          try {
            await createVoucher({
              amount: parseInt(session.metadata.amount),
              recipientName: session.metadata.recipientName,
              recipientEmail: session.metadata.recipientEmail,
              purchaserName: session.metadata.purchaserName,
              purchaserEmail: session.metadata.purchaserEmail,
              personalMessage: session.metadata.personalMessage,
              stripeSessionId: session.id
            });
            console.log("Voucher created and emails sent for session:", session.id);
          } catch (error) {
            console.error("Error creating voucher:", error);
          }
        }
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Find the booking by payment intent ID
        const bookings = await storage.getAllBookings();
        const booking = bookings.find(b => b.paymentIntentId === paymentIntent.id);
        
        if (booking) {
          // Update booking status to confirmed
          await storage.updateBooking(booking.id, {
            status: "confirmed",
            paymentStatus: "completed"
          });

          // Handle sauna add-on for cabin bookings
          if (booking.type === 'cabin') {
            const addOns = booking.addOns as any || {};
            if (addOns.saunaSession) {
              await createSaunaAvailabilityForGuest(booking);
            }
          }

          // Send booking confirmation email
          try {
            const emailResult = await sendBookingConfirmation(
              booking.customerEmail,
              booking.customerName,
              booking
            );
            
            if (emailResult && emailResult.success) {
              // Track email in booking history
              await storage.addEmailToBooking(booking.id, emailResult);
              console.log("Booking confirmation email sent and tracked for payment:", paymentIntent.id);
            }
          } catch (emailError) {
            console.error("Failed to send booking confirmation email:", emailError);
          }

          // Update availability - increment booked slots
          const availabilitySlots = await storage.getAvailabilityByType(booking.type);
          const targetDate = new Date(booking.checkIn);
          
          const matchingSlot = availabilitySlots.find(slot => {
            const slotDate = new Date(slot.date);
            return slotDate.toDateString() === targetDate.toDateString();
          });

          if (matchingSlot) {
            await storage.updateAvailability(matchingSlot.id, {
              bookedSlots: matchingSlot.bookedSlots + booking.guests
            });
          }
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // Manual booking confirmation endpoint (for testing)
  app.post("/api/confirm-booking/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update booking status to confirmed
      await storage.updateBooking(bookingId, {
        status: "confirmed",
        paymentStatus: "completed"
      });

      // Send booking confirmation email
      try {
        const emailResult = await sendBookingConfirmation(
          booking.customerEmail,
          booking.customerName,
          booking
        );
        
        if (emailResult && emailResult.success) {
          // Track email in booking history
          await storage.addEmailToBooking(bookingId, emailResult);
          console.log("Booking confirmation email sent and tracked for manual confirmation:", bookingId);
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
      }

      // Update availability - increment booked slots
      const availabilitySlots = await storage.getAvailabilityByType(booking.type);
      const targetDate = new Date(booking.checkIn);
      
      const matchingSlot = availabilitySlots.find(slot => {
        const slotDate = new Date(slot.date);
        return slotDate.toDateString() === targetDate.toDateString();
      });

      if (matchingSlot) {
        await storage.updateAvailability(matchingSlot.id, {
          bookedSlots: matchingSlot.bookedSlots + booking.guests
        });
      }

      res.json({ message: "Booking confirmed and availability updated" });
    } catch (error: any) {
      console.error("Booking confirmation error:", error);
      res.status(500).json({ message: "Failed to confirm booking: " + error.message });
    }
  });

  // Webhook to handle successful payments
  app.post("/api/webhook/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Find and update the booking
      const bookings = await storage.getAllBookings();
      const booking = bookings.find(b => b.paymentIntentId === paymentIntent.id);
      
      if (booking) {
        await storage.updateBooking(booking.id, {
          status: "confirmed",
          paymentStatus: "paid"
        });

        // Send booking confirmation email
        try {
          const emailResult = await sendBookingConfirmation(
            booking.customerEmail,
            booking.customerName,
            booking
          );
          
          if (emailResult && emailResult.success) {
            // Track email in booking history
            await storage.addEmailToBooking(booking.id, emailResult);
            console.log("Booking confirmation email sent and tracked for payment:", paymentIntent.id);
          }
        } catch (emailError) {
          console.error("Failed to send booking confirmation email:", emailError);
        }
      }
    }

    res.json({ received: true });
  });

  // Admin: Get all bookings (protected)
  app.get("/api/bookings", requireAdmin, async (req, res) => {
    try {
      const { type } = req.query;
      if (type) {
        const bookings = await storage.getBookingsByType(type as string);
        res.json(bookings);
      } else {
        const bookings = await storage.getAllBookings();
        res.json(bookings);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Public endpoint: Get bookings by type for calendar availability
  app.get("/api/bookings/public/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const bookings = await storage.getBookingsByType(type);
      
      // Only return essential data for calendar display (no personal info)
      const publicBookings = bookings.map(booking => ({
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        source: booking.source
      }));
      
      res.json(publicBookings);
    } catch (error) {
      console.error("Failed to fetch public bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin: Create manual booking (protected)
  app.post("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        paymentIntentId: `manual_${Date.now()}`, // Generate unique ID for manual bookings
        createdAt: new Date()
      };

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Failed to create manual booking:", error);
      res.status(500).json({ message: "Failed to create booking: " + error.message });
    }
  });

  // Admin: Get availability for an experience type
  app.get("/api/admin/availability/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const availability = await storage.getAvailabilityByType(type);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Admin: Get availability by type (protected)
  app.get("/api/admin/availability", requireAdmin, async (req, res) => {
    try {
      const { type } = req.query;
      if (!type) {
        return res.status(400).json({ message: "Experience type is required" });
      }
      
      const availability = await storage.getAvailabilityByType(type as string);
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch availability: " + error.message });
    }
  });

  // Admin: Create availability slot (protected)
  app.post("/api/admin/availability", requireAdmin, async (req, res) => {
    try {
      const { experienceType, date, availableSlots, isBlocked } = req.body;
      
      const availabilityData = {
        experienceType: experienceType, // This maps to experience_type in the DB
        date: new Date(date),
        availableSlots: availableSlots || 1,
        bookedSlots: 0,
        isBlocked: isBlocked || false
      };

      const availability = await storage.createAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error: any) {
      console.error("Availability creation error:", error);
      res.status(500).json({ message: "Failed to create availability: " + error.message });
    }
  });

  // Admin: Update availability slot
  app.patch("/api/admin/availability/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const availability = await storage.updateAvailability(id, updateData);
      if (!availability) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update availability: " + error.message });
    }
  });

  // Admin: Delete availability slot
  app.delete("/api/admin/availability/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAvailability(id);
      
      if (!success) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      res.json({ message: "Availability slot deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete availability: " + error.message });
    }
  });

  // Admin: Bulk create availability
  app.post("/api/admin/availability/bulk", async (req, res) => {
    try {
      const { experienceType, startDate, endDate, availableSlots } = req.body;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const slots = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Skip if availability already exists for this date
        const existing = await storage.getAvailabilityByDateAndType(new Date(d), experienceType);
        if (!existing) {
          const availabilityData = {
            experienceType,
            date: new Date(d),
            availableSlots: availableSlots || 1,
            bookedSlots: 0,
            isBlocked: false
          };
          
          const availability = await storage.createAvailability(availabilityData);
          slots.push(availability);
        }
      }
      
      res.status(201).json({ 
        message: `Created ${slots.length} availability slots`,
        slots 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create bulk availability: " + error.message });
    }
  });

  // Admin: Bulk delete availability by type
  app.delete("/api/admin/availability/bulk/:type", requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      console.log(`Bulk delete request for type: ${type}`);
      
      const availabilitySlots = await storage.getAvailabilityByType(type);
      console.log(`Found ${availabilitySlots.length} slots to delete`);
      
      if (availabilitySlots.length === 0) {
        return res.json({ 
          message: `No ${type} availability slots found to delete`,
          deletedCount: 0 
        });
      }
      
      let deletedCount = 0;
      const errors = [];
      
      for (const slot of availabilitySlots) {
        try {
          const deleted = await storage.deleteAvailability(slot.id!);
          if (deleted) {
            deletedCount++;
          } else {
            errors.push(`Failed to delete slot ${slot.id}`);
          }
        } catch (error: any) {
          console.error(`Error deleting slot ${slot.id}:`, error);
          errors.push(`Error deleting slot ${slot.id}: ${error.message}`);
        }
      }
      
      if (errors.length > 0) {
        console.log('Deletion errors:', errors);
      }
      
      res.json({ 
        message: `Deleted ${deletedCount} of ${availabilitySlots.length} ${type} availability slots`,
        deletedCount,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ message: "Failed to delete availability: " + error.message });
    }
  });

  // Admin: Create monthly bread course availability
  app.post("/api/admin/availability/monthly-bread", async (req, res) => {
    try {
      const slots = [];
      
      // Create availability for first Sunday of each month from January 2026 to December 2026
      for (let month = 0; month < 12; month++) {
        const year = 2026;
        const firstDayOfMonth = new Date(year, month, 1);
        
        // Find the first Sunday of the month
        let firstSunday = new Date(firstDayOfMonth);
        while (firstSunday.getDay() !== 0) { // 0 = Sunday
          firstSunday.setDate(firstSunday.getDate() + 1);
        }
        
        // Check if availability already exists for this date
        const existing = await storage.getAvailabilityByDateAndType(firstSunday, "bread");
        if (!existing) {
          const availabilityData = {
            experienceType: "bread",
            date: new Date(firstSunday),
            availableSlots: 8, // max 8 people for bread making
            bookedSlots: 0,
            isBlocked: false
          };
          
          const availability = await storage.createAvailability(availabilityData);
          slots.push(availability);
        }
      }
      
      res.status(201).json({ 
        message: `Created ${slots.length} bread course availability slots for 2026`,
        slots 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create monthly bread availability: " + error.message });
    }
  });

  // Admin: Create daily sauna availability
  app.post("/api/admin/availability/daily-sauna", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default to 1 year
      
      const slots = [];
      
      // Create sauna availability for every day in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        
        // Create 7pm session
        const session7pm = new Date(currentDate);
        session7pm.setHours(19, 0, 0, 0); // 7pm
        
        // Create 8pm session  
        const session8pm = new Date(currentDate);
        session8pm.setHours(20, 0, 0, 0); // 8pm
        
        // Check and create 7pm slot
        const existing7pm = await storage.getAvailabilityByDateAndType(session7pm, "sauna");
        if (!existing7pm) {
          const availabilityData7pm = {
            experienceType: "sauna",
            date: new Date(session7pm),
            availableSlots: 1, // 1 time slot (can accommodate up to 6 people)
            bookedSlots: 0,
            isBlocked: false
          };
          
          const availability7pm = await storage.createAvailability(availabilityData7pm);
          slots.push(availability7pm);
        }
        
        // Check and create 8pm slot
        const existing8pm = await storage.getAvailabilityByDateAndType(session8pm, "sauna");
        if (!existing8pm) {
          const availabilityData8pm = {
            experienceType: "sauna",
            date: new Date(session8pm),
            availableSlots: 1, // 1 time slot (can accommodate up to 6 people)
            bookedSlots: 0,
            isBlocked: false
          };
          
          const availability8pm = await storage.createAvailability(availabilityData8pm);
          slots.push(availability8pm);
        }
      }
      
      res.status(201).json({ 
        message: `Created ${slots.length} daily sauna availability slots (7pm & 8pm sessions)`,
        slots 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create daily sauna availability: " + error.message });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = req.body;
      
      // Handle voucher redemption if voucher is applied
      if (bookingData.voucherCode && bookingData.voucherDiscount > 0) {
        const voucherValidation = await validateVoucher(bookingData.voucherCode);
        if (!voucherValidation.valid) {
          return res.status(400).json({ message: voucherValidation.message });
        }
      }
      
      // Remove voucher fields from booking data before validation
      const { voucherCode, voucherDiscount, originalPrice, ...cleanBookingData } = bookingData;
      
      const validatedData = insertBookingSchema.parse(cleanBookingData);
      const booking = await storage.createBooking(validatedData);
      
      // Redeem voucher after successful booking creation
      if (voucherCode && voucherDiscount > 0) {
        try {
          await redeemVoucher(voucherCode, booking.id, voucherDiscount);
          console.log(`Voucher ${voucherCode} redeemed for booking ${booking.id}, amount: €${voucherDiscount}`);
        } catch (voucherError) {
          console.error("Failed to redeem voucher:", voucherError);
          // Don't fail the booking if voucher redemption fails
        }
      }
      
      // Send confirmation email for all experience bookings
      if (['sauna', 'bread', 'yoga'].includes(booking.type)) {
        try {
          const emailResult = await sendBookingConfirmation(
            booking.customerEmail,
            booking.customerName,
            booking
          );
          
          if (emailResult && emailResult.success) {
            // Track email in booking history
            await storage.addEmailToBooking(booking.id, emailResult);
            console.log(`Confirmation email sent for ${booking.type} booking ${booking.id} to ${booking.customerEmail}`);
          }
        } catch (emailError) {
          console.error(`Failed to send confirmation email for booking ${booking.id}:`, emailError);
          // Don't fail the booking if email fails
        }
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Mailing list subscription endpoint
  app.post("/api/mailing-list/subscribe", async (req, res) => {
    try {
      const { email, firstName, lastName, experienceType } = req.body;
      
      if (!email || !experienceType) {
        return res.status(400).json({ message: "Email and experience type are required" });
      }

      const subscriber = await storage.subscribeToMailingList({
        email,
        firstName,
        lastName,
        experienceType,
        subscriptionSource: "direct",
        isActive: true
      });

      res.json({ 
        message: "Successfully subscribed to mailing list",
        subscriber: {
          email: subscriber.email,
          experienceType: subscriber.experienceType
        }
      });
    } catch (error: any) {
      console.error("Mailing list subscription error:", error);
      res.status(500).json({ message: "Failed to subscribe: " + error.message });
    }
  });

  // Voucher validation endpoint
  app.post("/api/validate-voucher", async (req, res) => {
    try {
      const { voucherCode } = req.body;
      
      if (!voucherCode) {
        return res.status(400).json({ message: "Voucher code is required" });
      }
      
      const result = await validateVoucher(voucherCode);
      res.json(result);
    } catch (error: any) {
      console.error("Voucher validation error:", error);
      res.status(500).json({ message: "Failed to validate voucher: " + error.message });
    }
  });

  // Voucher redemption endpoint
  app.post("/api/redeem-voucher", async (req, res) => {
    try {
      const { voucherCode, bookingId, amountUsed } = req.body;
      
      if (!voucherCode || !bookingId || !amountUsed) {
        return res.status(400).json({ message: "Voucher code, booking ID, and amount used are required" });
      }
      
      // Validate voucher first
      const validation = await validateVoucher(voucherCode);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      
      // Check if amount used doesn't exceed voucher value
      if (amountUsed > validation.voucher.amount) {
        return res.status(400).json({ message: "Amount used cannot exceed voucher value" });
      }
      
      const success = await redeemVoucher(voucherCode, bookingId, amountUsed);
      if (success) {
        res.json({ message: "Voucher redeemed successfully", amountUsed });
      } else {
        res.status(500).json({ message: "Failed to redeem voucher" });
      }
    } catch (error: any) {
      console.error("Voucher redemption error:", error);
      res.status(500).json({ message: "Failed to redeem voucher: " + error.message });
    }
  });

  // Guest QR code validation endpoint
  app.post("/api/validate-guest-qr", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "QR code is required" });
      }
      
      const result = await validateGuestQrCode(code);
      res.json(result);
    } catch (error: any) {
      console.error("QR code validation error:", error);
      res.status(500).json({ message: "Failed to validate QR code: " + error.message });
    }
  });

  // Guest experience submission endpoint
  app.post("/api/guest-experiences", upload.array('photos', 6), async (req, res) => {
    try {
      const { qrCodeId, guestName, stayDate, experienceTitle, experienceDescription, recommendation } = req.body;
      
      if (!qrCodeId || !experienceTitle || !experienceDescription) {
        return res.status(400).json({ message: "QR code ID, title, and description are required" });
      }
      
      // Validate QR code
      const qrValidation = await validateGuestQrCode(qrCodeId);
      if (!qrValidation.valid) {
        return res.status(400).json({ message: qrValidation.message });
      }
      
      // Process uploaded photos
      const photoUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          // In production, you'd upload to cloud storage and get URLs
          // For now, we'll create local URLs
          const photoUrl = `/uploads/guest-photos/${file.filename}`;
          photoUrls.push(photoUrl);
        }
      }
      
      const experienceData = {
        qrCodeId,
        guestName: guestName || qrValidation.guestInfo?.guestName || "Anonymous Guest",
        stayDate: stayDate || qrValidation.guestInfo?.checkInDate || new Date().toISOString(),
        experienceTitle,
        experienceDescription,
        recommendation: recommendation || "",
        photos: photoUrls
      };
      
      const savedExperience = await saveGuestExperience(experienceData);
      
      // Send email notification to admin
      try {
        await sendNewGuestExperienceNotification({
          guestName: experienceData.guestName,
          experienceTitle: experienceData.experienceTitle,
          experienceDescription: experienceData.experienceDescription,
          recommendation: experienceData.recommendation,
          stayDate: experienceData.stayDate,
          photoCount: photoUrls.length
        });
      } catch (emailError) {
        console.error("Failed to send guest experience notification email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json(savedExperience);
    } catch (error: any) {
      console.error("Guest experience submission error:", error);
      res.status(500).json({ message: "Failed to save experience: " + error.message });
    }
  });

  // Get public guest experiences
  app.get("/api/guest-experiences/public", async (req, res) => {
    try {
      const experiences = await getPublicGuestExperiences();
      res.json(experiences);
    } catch (error: any) {
      console.error("Error fetching public experiences:", error);
      res.status(500).json({ message: "Failed to fetch experiences: " + error.message });
    }
  });

  // Admin: Generate QR code for booking
  app.post("/api/admin/generate-qr", requireAdmin, async (req, res) => {
    try {
      const { bookingId, guestName, checkInDate, checkOutDate } = req.body;
      
      if (!bookingId || !guestName || !checkInDate) {
        return res.status(400).json({ message: "Booking ID, guest name, and check-in date are required" });
      }
      
      const qrCode = await createGuestQrCode({
        bookingId,
        guestName,
        checkInDate: new Date(checkInDate),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined
      });
      
      res.json({ qrCode, url: `${req.protocol}://${req.get('host')}/guest-experience?code=${qrCode}` });
    } catch (error: any) {
      console.error("QR code generation error:", error);
      res.status(500).json({ message: "Failed to generate QR code: " + error.message });
    }
  });

  // Serve uploaded photos
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Unsubscribe endpoint
  app.get("/api/mailing-list/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const success = await storage.unsubscribeFromMailingList(token);
      if (success) {
        res.json({ message: "Successfully unsubscribed from mailing list" });
      } else {
        res.status(404).json({ message: "Invalid unsubscribe token" });
      }
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({ message: "Failed to unsubscribe: " + error.message });
    }
  });

  // Admin: Send new yoga date notification
  app.post("/api/admin/notify-yoga-date", requireAdmin, async (req, res) => {
    try {
      const { date, availableSlots, description } = req.body;
      
      if (!date || !availableSlots) {
        return res.status(400).json({ message: "Date and available slots are required" });
      }

      // Import the notification function
      const { sendNewYogaDateNotification } = await import('./mailing-list');
      
      const result = await sendNewYogaDateNotification({
        date,
        availableSlots,
        description
      });

      if (result.success) {
        res.json({
          message: `Notification sent to ${result.emailsSent} subscribers`,
          emailsSent: result.emailsSent,
          totalSubscribers: result.totalSubscribers
        });
      } else {
        res.status(500).json({ message: result.error });
      }
    } catch (error: any) {
      console.error("Yoga notification error:", error);
      res.status(500).json({ message: "Failed to send notifications: " + error.message });
    }
  });

  // Admin: Get mailing list subscribers
  app.get("/api/admin/mailing-list", requireAdmin, async (req, res) => {
    try {
      const { experienceType } = req.query;
      const subscribers = await storage.getMailingListSubscribers(experienceType as string);
      res.json(subscribers);
    } catch (error: any) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ message: "Failed to fetch subscribers: " + error.message });
    }
  });

  // Admin: Get booking details for specific availability slot
  app.get("/api/admin/bookings/by-availability", requireAdmin, async (req, res) => {
    try {
      const { experienceType, date } = req.query;
      
      if (!experienceType || !date) {
        return res.status(400).json({ message: "Experience type and date are required" });
      }
      
      // Get all bookings for this experience type
      const allBookings = await storage.getBookingsByType(experienceType as string);
      
      // Filter bookings for the specific date
      const requestedDate = new Date(date as string);
      const dateBookings = allBookings.filter(booking => {
        const checkInDate = new Date(booking.checkIn);
        
        if (experienceType === "cabin") {
          // For cabin bookings, check if the date falls within the stay period
          const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : checkInDate;
          return requestedDate >= checkInDate && requestedDate < checkOutDate;
        } else {
          // For other experiences, match the exact date
          return checkInDate.toDateString() === requestedDate.toDateString();
        }
      });
      
      // Return booking details with customer information
      const bookingDetails = dateBookings.map(booking => ({
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        guests: booking.guests,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        specialRequests: booking.specialRequests,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        source: booking.source,
        createdAt: booking.createdAt
      }));
      
      res.json(bookingDetails);
    } catch (error: any) {
      console.error("Get booking details error:", error);
      res.status(500).json({ message: "Failed to fetch booking details: " + error.message });
    }
  });

  // Auto-subscribe yoga booking customers
  app.post("/api/auto-subscribe-yoga", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await storage.subscribeToMailingList({
        email,
        firstName,
        lastName,
        experienceType: "yoga",
        subscriptionSource: "booking",
        isActive: true
      });

      res.json({ message: "Auto-subscribed to yoga retreat updates" });
    } catch (error: any) {
      console.error("Auto-subscribe error:", error);
      res.status(500).json({ message: "Failed to auto-subscribe: " + error.message });
    }
  });

  // Bulk upload mailing list subscribers
  app.post("/api/admin/bulk-subscribe", requireAdmin, async (req, res) => {
    try {
      const { subscribers, experienceType = "yoga" } = req.body;
      
      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        return res.status(400).json({ message: "Subscribers array is required" });
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const subscriber of subscribers) {
        try {
          if (!subscriber.email) {
            results.failed++;
            results.errors.push(`Missing email for subscriber: ${JSON.stringify(subscriber)}`);
            continue;
          }

          await storage.subscribeToMailingList({
            email: subscriber.email.trim().toLowerCase(),
            firstName: subscriber.firstName?.trim(),
            lastName: subscriber.lastName?.trim(),
            experienceType,
            subscriptionSource: "bulk_upload",
            isActive: true
          });

          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Failed to add ${subscriber.email}: ${error.message}`);
        }
      }

      res.json({
        message: `Bulk upload completed: ${results.successful} successful, ${results.failed} failed`,
        results
      });
    } catch (error: any) {
      console.error("Bulk subscribe error:", error);
      res.status(500).json({ message: "Failed to bulk upload: " + error.message });
    }
  });

  // Get bookings by type
  app.get("/api/bookings/type/:type", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByType(req.params.type);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get specific booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Update booking
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const updateData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(id, updateData);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Delete booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const deleted = await storage.deleteBooking(id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        experience: z.string().min(1, "Please select an experience"),
        message: z.string().min(1, "Message is required"),
      });

      const validatedData = contactSchema.parse(req.body);
      
      // Attempt to send email via Hostinger SMTP
      const emailSent = await sendContactEmail(validatedData);
      
      if (emailSent) {
        console.log("Contact form email sent successfully:", validatedData.email);
      } else {
        console.log("Contact form submission (email not sent):", validatedData);
      }
      
      res.json({ message: "Thank you for your message! We will respond within 2 hours." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid contact data", 
          errors: error.errors 
        });
      }
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Test email route
  app.post("/api/test-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      const success = await sendTestEmail(email);
      
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending test email" });
    }
  });

  // Test booking confirmation email route
  app.post("/api/test-booking-confirmation", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      // Sample booking data for testing
      const sampleBooking = {
        type: "sauna",
        customerName: "Steven Grant",
        customerEmail: email,
        customerPhone: "+353851234567",
        checkIn: new Date("2025-06-15T10:00:00Z"),
        checkOut: new Date("2025-06-15T12:00:00Z"),
        guests: 2,
        totalPrice: "84.00",
        specialRequests: "Please prepare eucalyptus aromatherapy for ultimate relaxation",
        id: 999
      };
      
      const success = await sendBookingConfirmation(email, "Steven Grant", sampleBooking);
      
      if (success) {
        res.json({ message: "Booking confirmation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send booking confirmation email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending booking confirmation email" });
    }
  });

  // Test pre-arrival email route
  app.post("/api/test-pre-arrival-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      // Sample booking data for testing
      const sampleBooking = {
        type: "cabin",
        customerName: "Steven Grant",
        customerEmail: email,
        checkIn: new Date("2025-06-20T15:00:00Z"),
        checkOut: new Date("2025-06-22T10:00:00Z"),
        guests: 2,
        totalPrice: "290.00",
        specialRequests: "Anniversary celebration",
        id: 998
      };
      
      const success = await sendPreArrivalEmail(email, "Steven Grant", sampleBooking);
      
      if (success) {
        res.json({ message: "Pre-arrival email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send pre-arrival email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending pre-arrival email" });
    }
  });

  // Test thank you email route
  app.post("/api/test-thank-you-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }
      
      // Sample booking data for testing
      const sampleBooking = {
        type: "cabin",
        customerName: "Steven Grant",
        customerEmail: email,
        checkIn: new Date("2025-06-18T15:00:00Z"),
        checkOut: new Date("2025-06-20T10:00:00Z"),
        guests: 2,
        totalPrice: "290.00",
        specialRequests: "Anniversary celebration",
        id: 997
      };
      
      const success = await sendThankYouEmail(email, "Steven Grant", sampleBooking);
      
      if (success) {
        res.json({ message: "Thank you email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send thank you email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending thank you email" });
    }
  });

  // Check and send pre-arrival emails for upcoming bookings
  app.post("/api/send-pre-arrival-emails", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      const now = new Date();
      
      let emailsSent = 0;
      let errors = [];
      
      for (const booking of bookings) {
        // Only process confirmed direct bookings
        if (booking.status !== "confirmed" || booking.source === "airbnb") {
          continue;
        }
        
        const checkInDate = new Date(booking.checkIn);
        const daysDifference = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send pre-arrival email exactly 7 days before arrival
        if (daysDifference === 7) {
          // Check if pre-arrival email already sent
          const emailHistory = Array.isArray(booking.emailsSent) ? booking.emailsSent : [];
          const preArrivalSent = emailHistory.some(email => email.emailType === 'pre_arrival_information');
          
          if (!preArrivalSent) {
            try {
              const emailResult = await sendPreArrivalEmail(
                booking.customerEmail,
                booking.customerName,
                booking
              );
              
              if (emailResult && emailResult.success) {
                // Track email in booking history
                await storage.addEmailToBooking(booking.id, emailResult);
                emailsSent++;
                console.log(`Pre-arrival email sent for booking ${booking.id} to ${booking.customerEmail}`);
              }
            } catch (emailError: any) {
              console.error(`Failed to send pre-arrival email for booking ${booking.id}:`, emailError);
              errors.push(`Booking ${booking.id}: ${emailError.message || 'Unknown error'}`);
            }
          }
        }
      }
      
      res.json({ 
        message: `Pre-arrival email check completed. ${emailsSent} emails sent.`,
        emailsSent,
        errors
      });
    } catch (error) {
      console.error("Error checking pre-arrival emails:", error);
      res.status(500).json({ message: "Error processing pre-arrival emails" });
    }
  });

  // Check and send thank you emails for departed guests
  app.post("/api/send-thank-you-emails", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      const now = new Date();
      
      let emailsSent = 0;
      let errors = [];
      
      for (const booking of bookings) {
        // Only process confirmed direct bookings that have checked out
        if (booking.status !== "confirmed" || booking.source === "airbnb" || !booking.checkOut) {
          continue;
        }
        
        const checkOutDate = new Date(booking.checkOut);
        const daysSinceCheckout = Math.floor((now.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send thank you email on the day of checkout (day 0)
        if (daysSinceCheckout === 0) {
          // Check if thank you email already sent
          const emailHistory = Array.isArray(booking.emailsSent) ? booking.emailsSent : [];
          const thankYouSent = emailHistory.some(email => email.emailType === 'thank_you_post_stay');
          
          if (!thankYouSent) {
            try {
              const emailResult = await sendThankYouEmail(
                booking.customerEmail,
                booking.customerName,
                booking
              );
              
              if (emailResult && emailResult.success) {
                // Track email in booking history
                await storage.addEmailToBooking(booking.id, emailResult);
                emailsSent++;
                console.log(`Thank you email sent for booking ${booking.id} to ${booking.customerEmail}`);
              }
            } catch (emailError: any) {
              console.error(`Failed to send thank you email for booking ${booking.id}:`, emailError);
              errors.push(`Booking ${booking.id}: ${emailError.message || 'Unknown error'}`);
            }
          }
        }
      }
      
      res.json({ 
        message: `Thank you email check completed. ${emailsSent} emails sent.`,
        emailsSent,
        errors
      });
    } catch (error) {
      console.error("Error checking thank you emails:", error);
      res.status(500).json({ message: "Error processing thank you emails" });
    }
  });

  // Run all automated email checks
  app.post("/api/run-automated-emails", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      const now = new Date();
      
      let preArrivalSent = 0;
      let thankYouSent = 0;
      let errors = [];
      
      for (const booking of bookings) {
        // Only process confirmed direct bookings
        if (booking.status !== "confirmed" || booking.source === "airbnb") {
          continue;
        }
        
        const emailHistory = Array.isArray(booking.emailsSent) ? booking.emailsSent : [];
        
        // Check for pre-arrival emails (7 days before check-in)
        const checkInDate = new Date(booking.checkIn);
        const daysTillCheckin = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysTillCheckin === 7) {
          const preArrivalAlreadySent = emailHistory.some(email => email.emailType === 'pre_arrival_information');
          
          if (!preArrivalAlreadySent) {
            try {
              const emailResult = await sendPreArrivalEmail(
                booking.customerEmail,
                booking.customerName,
                booking
              );
              
              if (emailResult && emailResult.success) {
                await storage.addEmailToBooking(booking.id, emailResult);
                preArrivalSent++;
                console.log(`Pre-arrival email sent for booking ${booking.id}`);
              }
            } catch (emailError: any) {
              errors.push(`Pre-arrival for booking ${booking.id}: ${emailError.message || 'Unknown error'}`);
            }
          }
        }
        
        // Check for thank you emails (day of checkout)
        if (booking.checkOut) {
          const checkOutDate = new Date(booking.checkOut);
          const daysSinceCheckout = Math.floor((now.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceCheckout === 0) {
            const thankYouAlreadySent = emailHistory.some(email => email.emailType === 'thank_you_post_stay');
            
            if (!thankYouAlreadySent) {
              try {
                const emailResult = await sendThankYouEmail(
                  booking.customerEmail,
                  booking.customerName,
                  booking
                );
                
                if (emailResult && emailResult.success) {
                  await storage.addEmailToBooking(booking.id, emailResult);
                  thankYouSent++;
                  console.log(`Thank you email sent for booking ${booking.id}`);
                }
              } catch (emailError: any) {
                errors.push(`Thank you for booking ${booking.id}: ${emailError.message || 'Unknown error'}`);
              }
            }
          }
        }
      }
      
      res.json({ 
        message: `Automated email check completed. ${preArrivalSent} pre-arrival and ${thankYouSent} thank you emails sent.`,
        preArrivalSent,
        thankYouSent,
        errors
      });
    } catch (error) {
      console.error("Error running automated emails:", error);
      res.status(500).json({ message: "Error processing automated emails" });
    }
  });

  // Stripe payment intent route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingData } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        metadata: {
          bookingType: bookingData.type,
          customerEmail: bookingData.customerEmail,
          customerName: bookingData.customerName,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Availability check endpoint (now includes Airbnb sync)
  app.get("/api/availability/:type/:date", async (req, res) => {
    try {
      const { type, date } = req.params;
      
      // Get existing bookings for the date
      const bookings = await storage.getBookingsByType(type);
      const requestedDate = new Date(date);
      
      // For cabin bookings, also check Airbnb availability if configured
      let airbnbAvailable = true;
      if (type === "cabin" && process.env.AIRBNB_CALENDAR_URL) {
        try {
          airbnbAvailable = await airbnbSync.checkAvailabilityWithAirbnb(requestedDate);
        } catch (error) {
          console.warn("Could not check Airbnb availability:", error);
        }
      }
      
      // Filter bookings for the specific date
      const dateBookings = bookings.filter(booking => {
        const checkInDate = new Date(booking.checkIn);
        if (type === "cabin") {
          const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : checkInDate;
          return requestedDate >= checkInDate && requestedDate < checkOutDate;
        } else {
          return checkInDate.toDateString() === requestedDate.toDateString();
        }
      });

      // Calculate availability based on experience type
      let available = true;
      let availableSlots = 1;

      if (type === "cabin") {
        available = dateBookings.length === 0 && airbnbAvailable; // Check both local and Airbnb
      } else if (type === "sauna") {
        availableSlots = Math.max(0, 8 - dateBookings.reduce((sum, b) => sum + (b.guests || 0), 0));
        available = availableSlots > 0;
      } else {
        availableSlots = Math.max(0, 12 - dateBookings.reduce((sum, b) => sum + (b.guests || 0), 0));
        available = availableSlots > 0;
      }

      res.json({
        available,
        availableSlots,
        date: requestedDate.toISOString(),
        existingBookings: dateBookings.length,
        airbnbSynced: type === "cabin" && !!process.env.AIRBNB_CALENDAR_URL
      });
    } catch (error: any) {
      console.error("Availability check error:", error);
      res.status(500).json({ message: "Error checking availability" });
    }
  });

  // Airbnb calendar sync endpoint
  app.post("/api/sync-airbnb", async (req, res) => {
    try {
      if (!process.env.AIRBNB_CALENDAR_URL) {
        return res.status(400).json({ 
          message: "Airbnb calendar URL not configured. Please set AIRBNB_CALENDAR_URL environment variable." 
        });
      }

      await airbnbSync.syncAirbnbBookings();
      res.json({ 
        message: "Airbnb calendar synced successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Airbnb sync error:", error);
      res.status(500).json({ message: "Error syncing Airbnb calendar: " + error.message });
    }
  });

  // Export calendar endpoint for Airbnb import
  app.get("/api/calendar/export", async (req, res) => {
    try {
      // Get all cabin bookings from our system
      const cabinBookings = await storage.getBookingsByType('cabin');
      
      let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lough Hyne Cottage//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Lough Hyne Cottage Bookings
X-WR-TIMEZONE:Europe/Dublin
X-WR-CALDESC:Bookings for Lough Hyne Cottage
`;

      // Add each booking as a VEVENT
      for (const booking of cabinBookings) {
        if (booking.source !== 'airbnb') { // Don't re-export Airbnb bookings
          const startDate = new Date(booking.checkIn).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const endDate = booking.checkOut 
            ? new Date(booking.checkOut).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
            : startDate;
          
          icalContent += `BEGIN:VEVENT
UID:lhc-${booking.id}@loughhynecottage.ie
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${booking.customerName} - Cabin Booking
DESCRIPTION:Guests: ${booking.guests}${booking.specialRequests ? '\\nSpecial Requests: ' + booking.specialRequests : ''}
STATUS:CONFIRMED
END:VEVENT
`;
        }
      }

      icalContent += 'END:VCALENDAR';

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="lough-hyne-cottage-bookings.ics"');
      res.send(icalContent);
    } catch (error: any) {
      console.error("Calendar export error:", error);
      res.status(500).json({ message: "Error exporting calendar" });
    }
  });

  // Guest experience approval endpoints
  app.get("/api/guest-experiences/pending", async (req, res) => {
    try {
      const experiences = await db.select()
        .from(guestExperiences)
        .where(eq(guestExperiences.isApproved, false))
        .orderBy(desc(guestExperiences.createdAt));
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching pending guest experiences:", error);
      res.status(500).json({ message: "Failed to fetch pending experiences" });
    }
  });

  app.get("/api/guest-experiences/approved", async (req, res) => {
    try {
      const experiences = await db.select()
        .from(guestExperiences)
        .where(eq(guestExperiences.isApproved, true))
        .orderBy(desc(guestExperiences.createdAt));
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching approved guest experiences:", error);
      res.status(500).json({ message: "Failed to fetch approved experiences" });
    }
  });

  app.get("/api/guest-experiences/rejected", async (req, res) => {
    try {
      const experiences = await db.select()
        .from(guestExperiences)
        .where(and(
          eq(guestExperiences.isApproved, false),
          eq(guestExperiences.isPublic, false)
        ))
        .orderBy(desc(guestExperiences.createdAt));
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching rejected guest experiences:", error);
      res.status(500).json({ message: "Failed to fetch rejected experiences" });
    }
  });

  app.post("/api/guest-experiences/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const [experience] = await db.update(guestExperiences)
        .set({ 
          isApproved: true,
          isPublic: true
        })
        .where(eq(guestExperiences.id, parseInt(id)))
        .returning();
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json({ message: "Experience approved successfully", experience });
    } catch (error) {
      console.error("Error approving guest experience:", error);
      res.status(500).json({ message: "Failed to approve experience" });
    }
  });

  app.post("/api/guest-experiences/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const [experience] = await db.update(guestExperiences)
        .set({ 
          isApproved: false,
          isPublic: false
        })
        .where(eq(guestExperiences.id, parseInt(id)))
        .returning();
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json({ message: "Experience rejected successfully", experience });
    } catch (error) {
      console.error("Error rejecting guest experience:", error);
      res.status(500).json({ message: "Failed to reject experience" });
    }
  });

  app.post("/api/guest-experiences/:id/toggle-public", async (req, res) => {
    try {
      const { id } = req.params;
      const { isPublic } = req.body;
      
      const [experience] = await db.update(guestExperiences)
        .set({ isPublic })
        .where(eq(guestExperiences.id, parseInt(id)))
        .returning();
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json({ message: "Experience visibility updated successfully", experience });
    } catch (error) {
      console.error("Error updating experience visibility:", error);
      res.status(500).json({ message: "Failed to update experience visibility" });
    }
  });

  // Update the public guest experiences endpoint to only show approved and public stories
  app.get("/api/guest-experiences/public", async (req, res) => {
    try {
      const experiences = await db.select()
        .from(guestExperiences)
        .where(and(
          eq(guestExperiences.isApproved, true),
          eq(guestExperiences.isPublic, true)
        ))
        .orderBy(desc(guestExperiences.createdAt));
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching public guest experiences:", error);
      res.status(500).json({ message: "Failed to fetch public experiences" });
    }
  });

  // SEO routes for search engine optimization
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = 'https://www.loughhynecottage.com';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const pages = [
      { url: baseUrl, lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
      { url: `${baseUrl}/booking`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { url: `${baseUrl}/blog`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
      { url: `${baseUrl}/our-story`, lastmod: currentDate, changefreq: 'monthly', priority: '0.6' },
      { url: `${baseUrl}/events-experiences`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
      { url: `${baseUrl}/cabin-booking`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { url: `${baseUrl}/sauna-booking`, lastmod: currentDate, changefreq: 'daily', priority: '0.8' },
      { url: `${baseUrl}/yoga-booking`, lastmod: currentDate, changefreq: 'weekly', priority: '0.7' },
      { url: `${baseUrl}/bread-booking`, lastmod: currentDate, changefreq: 'weekly', priority: '0.7' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://www.loughhynecottage.com/sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific booking pages
Allow: /booking
Allow: /cabin-booking
Allow: /sauna-booking
Allow: /yoga-booking
Allow: /bread-booking

# Crawl delay
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
