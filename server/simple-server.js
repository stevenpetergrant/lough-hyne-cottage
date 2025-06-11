import express from "express";
import { createServer } from "http";
import Stripe from "stripe";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Stripe if available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Health endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/status', (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;

  res.json({
    environment: process.env.NODE_ENV || 'development',
    configured: {
      database: hasDatabase,
      stripe: hasStripe,
      email: hasEmail,
      session: hasSession
    },
    ready: hasDatabase && hasStripe && hasEmail && hasSession
  });
});

// API routes
app.get('/api/bookings/info', (req, res) => {
  res.json({
    services: [
      {
        id: 'cabin',
        name: 'Cabin Stay',
        description: 'Authentic cottage accommodation overlooking Lough Hyne',
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
    ]
  });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, services } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields required' });
    }

    console.log('Contact form submission:', { name, email, services: services?.join(', '), message });
    
    res.json({
      success: true,
      message: 'Thank you for your inquiry. We will respond within 24 hours.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/bookings/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  try {
    const { amount, currency = 'eur' } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        cottage: 'lough-hyne'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Main website
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - Eco Retreat in Ireland's Marine Nature Reserve</title>
    <meta name="description" content="Book your stay at Lough Hyne Cottage, an eco-retreat on the shores of Ireland's first marine nature reserve in Cork. Authentic cottage accommodation, sauna, yoga, and bread making experiences.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #059669 100%); 
            color: white; 
            padding: 80px 0; 
            text-align: center; 
        }
        .header h1 { font-size: 3.5rem; margin-bottom: 10px; font-weight: 300; }
        .header .subtitle { font-size: 1.3rem; opacity: 0.9; margin-bottom: 20px; }
        .header .location { font-size: 1.1rem; opacity: 0.8; }
        
        .hero { background: #f8fafc; padding: 80px 0; }
        .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .hero-text h2 { font-size: 2.8rem; margin-bottom: 25px; color: #1e40af; line-height: 1.2; }
        .hero-text p { font-size: 1.2rem; margin-bottom: 35px; color: #64748b; }
        .cta-button { 
            display: inline-block; 
            background: #059669; 
            color: white; 
            padding: 18px 35px; 
            border-radius: 10px; 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 1.1rem;
            transition: all 0.3s ease; 
        }
        .cta-button:hover { background: #047857; transform: translateY(-2px); }
        
        .services { padding: 100px 0; background: white; }
        .services h2 { text-align: center; font-size: 2.8rem; margin-bottom: 60px; color: #1e40af; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .service-card { 
            background: white; 
            border-radius: 15px; 
            padding: 40px; 
            text-align: center; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.08); 
            border: 1px solid #e2e8f0; 
            transition: all 0.3s ease; 
        }
        .service-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .service-icon { 
            width: 80px; 
            height: 80px; 
            background: linear-gradient(135deg, #eff6ff, #dbeafe); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 25px; 
            font-size: 30px; 
        }
        .service-card h3 { font-size: 1.4rem; margin-bottom: 20px; color: #1e40af; }
        .service-card p { color: #64748b; margin-bottom: 20px; }
        .price { font-size: 1.8rem; font-weight: 700; color: #059669; }
        
        .booking-section { 
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); 
            color: white; 
            padding: 100px 0; 
            text-align: center; 
        }
        .booking-section h2 { font-size: 2.8rem; margin-bottom: 25px; }
        .booking-section p { font-size: 1.3rem; margin-bottom: 50px; opacity: 0.9; }
        .booking-form { 
            max-width: 700px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            padding: 50px; 
            color: #333; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .form-group { margin-bottom: 25px; text-align: left; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
        .form-group input, .form-group select, .form-group textarea { 
            width: 100%; 
            padding: 15px; 
            border: 2px solid #e5e7eb; 
            border-radius: 10px; 
            font-size: 16px; 
            transition: border-color 0.3s ease;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #059669;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .submit-btn { 
            background: linear-gradient(135deg, #059669, #047857); 
            color: white; 
            padding: 18px 50px; 
            border: none; 
            border-radius: 10px; 
            font-size: 1.1rem; 
            font-weight: 600; 
            cursor: pointer; 
            width: 100%; 
            transition: all 0.3s ease;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3); }
        
        .contact { background: #f8fafc; padding: 80px 0; }
        .contact-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .contact-info h3 { font-size: 1.8rem; margin-bottom: 30px; color: #1e40af; }
        .contact-item { 
            display: flex; 
            align-items: center; 
            margin-bottom: 20px; 
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .contact-item span { font-size: 24px; margin-right: 15px; }
        .contact-item strong { color: #374151; }
        .contact-desc { 
            margin-top: 30px; 
            color: #64748b; 
            line-height: 1.8; 
            font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
            .hero-content, .contact-content { grid-template-columns: 1fr; gap: 40px; }
            .form-row { grid-template-columns: 1fr; }
            .header h1 { font-size: 2.5rem; }
            .hero-text h2 { font-size: 2.2rem; }
            .services h2, .booking-section h2 { font-size: 2.2rem; }
            .booking-form { padding: 30px; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>Lough Hyne Cottage</h1>
            <p class="subtitle">Eco Retreat in Ireland's Marine Nature Reserve</p>
            <p class="location">Cork, Ireland • Europe's Most Unique Ecosystem</p>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h2>Escape to Nature's Paradise</h2>
                    <p>Experience authentic Irish hospitality in our eco-cottage nestled on the shores of Europe's most pristine marine nature reserve. Disconnect from the world and reconnect with yourself in this UNESCO-recognized sanctuary.</p>
                    <a href="#booking" class="cta-button">Book Your Stay</a>
                </div>
                <div class="hero-image">
                    <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&h=500" alt="Lough Hyne Cottage overlooking the marine reserve" style="width: 100%; border-radius: 15px; box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
                </div>
            </div>
        </div>
    </section>

    <section class="services">
        <div class="container">
            <h2>Our Authentic Experiences</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">🏡</div>
                    <h3>Cottage Accommodation</h3>
                    <p>Authentic Irish cottage with modern amenities, stunning lake views, and traditional charm. Perfect for couples or small families seeking tranquility.</p>
                    <div class="price">€150/night</div>
                </div>
                <div class="service-card">
                    <div class="service-icon">🧘</div>
                    <h3>Lakeside Sauna</h3>
                    <p>Relax and rejuvenate in our traditional sauna with panoramic views of the marine reserve. Available for private sessions.</p>
                    <div class="price">€25/session</div>
                </div>
                <div class="service-card">
                    <div class="service-icon">🧘‍♀️</div>
                    <h3>Nature Yoga</h3>
                    <p>Find inner peace with guided yoga sessions in nature's most serene setting. Suitable for all levels of experience.</p>
                    <div class="price">€35/class</div>
                </div>
                <div class="service-card">
                    <div class="service-icon">🍞</div>
                    <h3>Bread Making Workshop</h3>
                    <p>Learn traditional Irish bread making techniques using local, organic ingredients. Take home your fresh creations.</p>
                    <div class="price">€45/workshop</div>
                </div>
            </div>
        </div>
    </section>

    <section class="booking-section" id="booking">
        <div class="container">
            <h2>Book Your Retreat</h2>
            <p>Start your journey to Ireland's most unique and peaceful destination</p>
            
            <div class="booking-form">
                <form id="bookingForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="checkin">Check-in Date</label>
                            <input type="date" id="checkin" name="checkin" required>
                        </div>
                        <div class="form-group">
                            <label for="checkout">Check-out Date</label>
                            <input type="date" id="checkout" name="checkout" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="services">Select Your Experiences</label>
                        <select id="services" name="services" multiple style="height: 140px;">
                            <option value="cottage">Cottage Stay (€150/night)</option>
                            <option value="sauna">Sauna Session (€25)</option>
                            <option value="yoga">Yoga Class (€35)</option>
                            <option value="bread">Bread Workshop (€45)</option>
                        </select>
                        <small style="color: #6b7280; margin-top: 5px; display: block;">Hold Ctrl/Cmd to select multiple experiences</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" name="name" required placeholder="Your full name">
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" required placeholder="your@email.com">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Special Requests or Questions</label>
                        <textarea id="message" name="message" rows="4" placeholder="Tell us about any special requirements, dietary needs, or questions about your stay..."></textarea>
                    </div>
                    
                    <button type="submit" class="submit-btn">Send Booking Request</button>
                </form>
            </div>
        </div>
    </section>

    <section class="contact">
        <div class="container">
            <div class="contact-content">
                <div class="contact-info">
                    <h3>Contact Information</h3>
                    <div class="contact-item">
                        <span>📧</span>
                        <strong>info@loughhynecottage.ie</strong>
                    </div>
                    <div class="contact-item">
                        <span>📍</span>
                        <strong>Lough Hyne, Skibbereen, Cork, Ireland</strong>
                    </div>
                    <div class="contact-item">
                        <span>🌊</span>
                        <strong>Ireland's First Marine Nature Reserve</strong>
                    </div>
                    <div class="contact-item">
                        <span>🏞️</span>
                        <strong>UNESCO Recognized Biosphere</strong>
                    </div>
                    <p class="contact-desc">
                        Experience sustainable tourism in one of Europe's most unique ecosystems. 
                        Our cottage offers the perfect base for exploring West Cork's stunning coastline, 
                        rich marine biodiversity, and authentic Irish culture. We're committed to 
                        preserving this special place for future generations while sharing its 
                        natural beauty with conscious travelers.
                    </p>
                </div>
                <div class="contact-visual">
                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" alt="Aerial view of Lough Hyne marine reserve" style="width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                </div>
            </div>
        </div>
    </section>

    <script>
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin').min = today;
        document.getElementById('checkout').min = today;
        
        // Update checkout minimum when checkin changes
        document.getElementById('checkin').addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(checkinDate.getDate() + 1);
            document.getElementById('checkout').min = nextDay.toISOString().split('T')[0];
        });
        
        // Handle form submission
        document.getElementById('bookingForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const selectedServices = formData.getAll('services');
            
            if (selectedServices.length === 0) {
                alert('Please select at least one experience for your stay.');
                return;
            }
            
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                checkin: formData.get('checkin'),
                checkout: formData.get('checkout'),
                services: selectedServices,
                message: formData.get('message')
            };
            
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.textContent = 'Sending Request...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay and provide additional details.');
                    this.reset();
                } else {
                    alert('There was an error processing your request. Please try again or email us directly at info@loughhynecottage.ie');
                }
            } catch (error) {
                alert('Thank you for your interest! Please email us directly at info@loughhynecottage.ie to complete your booking, or try again later.');
            } finally {
                submitBtn.textContent = 'Send Booking Request';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
  `);
});

// Catch all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.redirect('/');
  }
});

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lough Hyne Cottage server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database configured: ${!!process.env.DATABASE_URL}`);
  console.log(`Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`Email configured: ${!!process.env.SENDGRID_API_KEY}`);
});