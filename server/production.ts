import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { setupBookingRoutes } from './booking-routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup booking routes
setupBookingRoutes(app);

// Health endpoints for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Environment status
app.get('/api/status', (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  
  res.json({
    environment: process.env.NODE_ENV || 'production',
    configured: {
      database: hasDatabase,
      stripe: hasStripe,
      email: hasEmail,
      session: hasSession
    },
    ready: hasDatabase && hasStripe && hasEmail && hasSession
  });
});

// Basic cottage info
app.get('/api/info', (req, res) => {
  res.json({
    name: "Lough Hyne Cottage",
    location: "Cork, Ireland",
    description: "Eco retreat in Ireland's first marine nature reserve",
    services: ["Cabin rental", "Sauna sessions", "Yoga retreats", "Bread baking courses"],
    contact: "info@loughhynecottage.ie",
    booking: "Available for authentic cottage stays"
  });
});

// Serve static files if they exist
const distPath = path.join(__dirname, '..', 'dist');
try {
  app.use(express.static(distPath));
  console.log(`Serving static files from: ${distPath}`);
} catch (error) {
  console.log("No static files found, serving API only");
}

// Root route serves the main website
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lough Hyne Cottage - Book Your Stay</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #059669 100%); color: white; padding: 60px 0; text-align: center; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .hero { background: #f8fafc; padding: 60px 0; }
        .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .hero-text h2 { font-size: 2.5rem; margin-bottom: 20px; color: #1e40af; }
        .hero-text p { font-size: 1.1rem; margin-bottom: 30px; color: #64748b; }
        .cta-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.3s; }
        .cta-button:hover { background: #047857; }
        .services { padding: 80px 0; }
        .services h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; color: #1e40af; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .service-card { background: white; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; transition: transform 0.3s, box-shadow 0.3s; }
        .service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .service-icon { width: 60px; height: 60px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
        .service-card h3 { font-size: 1.3rem; margin-bottom: 15px; color: #1e40af; }
        .service-card p { color: #64748b; }
        .price { font-size: 1.5rem; font-weight: 700; color: #059669; margin-top: 15px; }
        .booking-section { background: #1e40af; color: white; padding: 80px 0; text-align: center; }
        .booking-section h2 { font-size: 2.5rem; margin-bottom: 20px; }
        .booking-section p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; }
        .booking-form { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; color: #333; }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .submit-btn { background: #059669; color: white; padding: 15px 40px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
        .submit-btn:hover { background: #047857; }
        .contact { background: #f8fafc; padding: 60px 0; }
        .contact-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .contact-info h3 { font-size: 1.5rem; margin-bottom: 20px; color: #1e40af; }
        .contact-item { display: flex; align-items: center; margin-bottom: 15px; }
        .contact-item strong { margin-left: 10px; }
        @media (max-width: 768px) {
          .hero-content, .contact-content { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .header h1 { font-size: 2rem; }
          .hero-text h2 { font-size: 2rem; }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1>Lough Hyne Cottage</h1>
          <p>Ireland's First Marine Nature Reserve • Cork, Ireland</p>
        </div>
      </header>

      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h2>Escape to Nature's Paradise</h2>
              <p>Experience authentic Irish hospitality in our eco-cottage nestled on the shores of Europe's most pristine marine nature reserve. Disconnect from the world and reconnect with yourself.</p>
              <a href="#booking" class="cta-button">Book Your Stay</a>
            </div>
            <div class="hero-image">
              <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" alt="Lough Hyne Cottage" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            </div>
          </div>
        </div>
      </section>

      <section class="services">
        <div class="container">
          <h2>Our Experiences</h2>
          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">🏠</div>
              <h3>Cottage Stay</h3>
              <p>Authentic accommodation with stunning lake views, modern amenities, and traditional Irish charm</p>
              <div class="price">€150/night</div>
            </div>
            <div class="service-card">
              <div class="service-icon">🧘</div>
              <h3>Sauna Sessions</h3>
              <p>Relax and rejuvenate in our lakeside sauna with panoramic views of the marine reserve</p>
              <div class="price">€25/session</div>
            </div>
            <div class="service-card">
              <div class="service-icon">🧘‍♀️</div>
              <h3>Yoga Retreats</h3>
              <p>Find inner peace with guided yoga sessions in nature's most serene setting</p>
              <div class="price">€35/class</div>
            </div>
            <div class="service-card">
              <div class="service-icon">🍞</div>
              <h3>Bread Making</h3>
              <p>Learn traditional Irish bread making techniques using local, organic ingredients</p>
              <div class="price">€45/workshop</div>
            </div>
          </div>
        </div>
      </section>

      <section class="booking-section" id="booking">
        <div class="container">
          <h2>Book Your Experience</h2>
          <p>Start your journey to Ireland's most unique retreat destination</p>
          
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
                <label for="services">Select Services</label>
                <select id="services" name="services" multiple style="height: 120px;">
                  <option value="cottage">Cottage Stay (€150/night)</option>
                  <option value="sauna">Sauna Session (€25)</option>
                  <option value="yoga">Yoga Class (€35)</option>
                  <option value="bread">Bread Workshop (€45)</option>
                </select>
                <small style="color: #64748b;">Hold Ctrl/Cmd to select multiple services</small>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Full Name</label>
                  <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input type="email" id="email" name="email" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="message">Special Requests</label>
                <textarea id="message" name="message" rows="4" placeholder="Any special requirements or questions?"></textarea>
              </div>
              
              <button type="submit" class="submit-btn">Request Booking</button>
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
              <p style="margin-top: 20px; color: #64748b;">
                Experience sustainable tourism in one of Europe's most unique ecosystems. 
                Our cottage offers the perfect base for exploring West Cork's stunning coastline 
                and rich marine biodiversity.
              </p>
            </div>
            <div class="contact-map">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" alt="Lough Hyne Location" style="width: 100%; border-radius: 12px;">
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
          document.getElementById('checkout').min = this.value;
        });
        
        // Handle form submission
        document.getElementById('bookingForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            services: formData.getAll('services'),
            message: formData.get('message')
          };
          
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
              alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay.');
              this.reset();
            } else {
              alert('There was an error processing your request. Please try again or email us directly.');
            }
          } catch (error) {
            alert('Thank you for your interest! Please email us directly at info@loughhynecottage.ie to complete your booking.');
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Fallback for other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.redirect('/');
  }
});

const port = parseInt(process.env.PORT || "3000");
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Lough Hyne Cottage production server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  
  console.log(`Configuration status:`);
  console.log(`- Database: ${hasDatabase ? '✓' : '✗'}`);
  console.log(`- Stripe: ${hasStripe ? '✓' : '✗'}`);
  console.log(`- Email: ${hasEmail ? '✓' : '✗'}`);
  console.log(`- Session: ${hasSession ? '✓' : '✗'}`);
});