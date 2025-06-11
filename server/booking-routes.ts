import type { Express } from "express";
import express from "express";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export function setupBookingRoutes(app: Express) {
  app.use(express.json());

  // Basic booking information
  app.get('/api/bookings/info', (req, res) => {
    res.json({
      services: [
        {
          id: 'cabin',
          name: 'Cabin Stay',
          description: 'Authentic cottage accommodation with stunning views',
          basePrice: 150,
          currency: 'EUR'
        },
        {
          id: 'sauna',
          name: 'Sauna Session',
          description: 'Relaxing sauna experience by the water',
          basePrice: 25,
          currency: 'EUR'
        },
        {
          id: 'yoga',
          name: 'Yoga Retreat',
          description: 'Peaceful yoga sessions in nature',
          basePrice: 35,
          currency: 'EUR'
        },
        {
          id: 'bread',
          name: 'Bread Making Course',
          description: 'Traditional bread making workshop',
          basePrice: 45,
          currency: 'EUR'
        }
      ],
      availability: {
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
      }
    });
  });

  // Create payment intent for booking
  app.post('/api/bookings/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'eur', services } = req.body;

      if (!amount || amount < 50) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          services: JSON.stringify(services || []),
          cottage: 'lough-hyne'
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Confirm booking after payment
  app.post('/api/bookings/confirm', async (req, res) => {
    try {
      const { paymentIntentId, guestDetails, bookingDetails } = req.body;

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // Create booking record
      const booking = {
        id: Date.now(),
        paymentIntentId,
        guestName: guestDetails.name,
        guestEmail: guestDetails.email,
        services: bookingDetails.services,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        totalAmount: paymentIntent.amount / 100,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      // Send confirmation email (simulated)
      console.log('Booking confirmed:', booking);
      
      res.json({
        success: true,
        booking,
        message: 'Booking confirmed successfully'
      });
    } catch (error: any) {
      console.error('Booking confirmation error:', error);
      res.status(500).json({ error: 'Booking confirmation failed' });
    }
  });

  // Get available dates
  app.get('/api/bookings/availability', (req, res) => {
    const { month, year } = req.query;
    
    // Generate availability for the next 90 days
    const availability = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Simulate some bookings (weekends less available)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isAvailable = Math.random() > (isWeekend ? 0.7 : 0.3);
      
      availability.push({
        date: date.toISOString().split('T')[0],
        available: isAvailable,
        price: isWeekend ? 180 : 150
      });
    }
    
    res.json({ availability });
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message, service } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields required' });
      }

      // Log contact submission
      console.log('Contact form submission:', { name, email, service, message });
      
      res.json({
        success: true,
        message: 'Thank you for your inquiry. We will respond within 24 hours.'
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
}