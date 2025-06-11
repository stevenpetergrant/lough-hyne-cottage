import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Lough Hyne Cottage - Book Your Stay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 60px 20px; text-align: center; border-radius: 10px; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin: 0 0 10px 0; font-weight: 300; }
        .header p { font-size: 1.2rem; margin: 5px 0; opacity: 0.9; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 40px 0; }
        .service { background: white; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; transition: transform 0.3s ease; }
        .service:hover { transform: translateY(-5px); }
        .service h3 { color: #1e40af; margin-bottom: 15px; font-size: 1.3rem; }
        .service p { color: #64748b; margin-bottom: 15px; }
        .price { font-size: 1.5rem; font-weight: bold; color: #059669; margin-top: 15px; }
        .contact { background: linear-gradient(135deg, #e8f4f8, #f0f9ff); padding: 40px; border-radius: 15px; margin-top: 40px; text-align: center; }
        .contact h3 { color: #1e40af; margin-bottom: 20px; font-size: 1.5rem; }
        .contact p { margin: 10px 0; font-size: 1.1rem; }
        .contact strong { color: #374151; }
        .features { background: #f8fafc; padding: 40px 20px; border-radius: 10px; margin: 40px 0; }
        .features h3 { text-align: center; color: #1e40af; margin-bottom: 20px; }
        .feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .feature-item { background: white; padding: 20px; border-radius: 10px; text-align: center; }
        @media (max-width: 768px) { 
            .header h1 { font-size: 2rem; } 
            .services { grid-template-columns: 1fr; }
            .feature-list { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lough Hyne Cottage</h1>
        <p>Eco Retreat in Ireland's First Marine Nature Reserve</p>
        <p>Skibbereen, Cork, Ireland</p>
    </div>
    
    <div class="features">
        <h3>Why Choose Lough Hyne Cottage?</h3>
        <div class="feature-list">
            <div class="feature-item">
                <h4>🌊 Marine Nature Reserve</h4>
                <p>Ireland's first and Europe's most unique marine ecosystem</p>
            </div>
            <div class="feature-item">
                <h4>🏡 Authentic Experience</h4>
                <p>Traditional Irish cottage with modern amenities</p>
            </div>
            <div class="feature-item">
                <h4>🌿 Sustainable Tourism</h4>
                <p>Eco-friendly retreat supporting conservation</p>
            </div>
        </div>
    </div>
    
    <h2 style="text-align: center; color: #1e40af; margin: 40px 0;">Our Experiences</h2>
    <div class="services">
        <div class="service">
            <h3>🏠 Cottage Accommodation</h3>
            <p>Authentic Irish cottage with stunning lake views, modern amenities, and traditional charm. Perfect for couples or small families seeking tranquility.</p>
            <div class="price">€150/night</div>
        </div>
        <div class="service">
            <h3>🧘 Lakeside Sauna</h3>
            <p>Relax and rejuvenate in our traditional sauna with panoramic views of the marine reserve. Private sessions available.</p>
            <div class="price">€25/session</div>
        </div>
        <div class="service">
            <h3>🧘‍♀️ Nature Yoga</h3>
            <p>Find inner peace with guided yoga sessions in nature's most serene setting. Suitable for all experience levels.</p>
            <div class="price">€35/class</div>
        </div>
        <div class="service">
            <h3>🍞 Bread Making Workshop</h3>
            <p>Learn traditional Irish bread making techniques using local, organic ingredients. Take home your fresh creations.</p>
            <div class="price">€45/workshop</div>
        </div>
    </div>
    
    <div class="contact">
        <h3>Book Your Retreat</h3>
        <p><strong>Email:</strong> info@loughhynecottage.ie</p>
        <p><strong>Location:</strong> Lough Hyne, Skibbereen, Cork, Ireland</p>
        <p><strong>Eircode:</strong> P81 P984</p>
        <p style="margin-top: 20px; font-style: italic;">Experience sustainable tourism in one of Europe's most unique ecosystems. Our cottage offers the perfect base for exploring West Cork's stunning coastline and rich marine biodiversity.</p>
    </div>
</body>
</html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/status', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'production',
    configured: {
      database: !!process.env.DATABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      email: !!process.env.SENDGRID_API_KEY,
      session: !!process.env.SESSION_SECRET
    },
    ready: true
  });
});

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lough Hyne Cottage server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});