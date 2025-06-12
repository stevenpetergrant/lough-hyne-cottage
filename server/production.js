import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Stripe
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Health endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Environment status
app.get('/api/status', (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;
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
    ready: true
  });
});

// Booking API endpoints
app.get('/api/bookings/services', (req, res) => {
  res.json({
    services: [
      {
        id: 'cottage',
        name: 'Cottage Accommodation',
        description: 'Authentic Irish cottage with stunning lake views',
        basePrice: 150,
        currency: 'EUR',
        category: 'accommodation'
      },
      {
        id: 'sauna',
        name: 'Sauna Session',
        description: 'Relaxing sauna experience by the water',
        basePrice: 25,
        currency: 'EUR',
        category: 'wellness'
      },
      {
        id: 'yoga',
        name: 'Yoga Class',
        description: 'Peaceful yoga sessions in nature',
        basePrice: 35,
        currency: 'EUR',
        category: 'wellness'
      },
      {
        id: 'bread',
        name: 'Bread Making Workshop',
        description: 'Traditional bread making course',
        basePrice: 45,
        currency: 'EUR',
        category: 'experience'
      }
    ]
  });
});

app.post('/api/bookings/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  try {
    const { amount, currency = 'eur', services } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
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
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, services, checkin, checkout } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Log the booking request
    console.log('Booking request received:', {
      name,
      email,
      services: services?.join(', ') || 'None specified',
      checkin,
      checkout,
      message
    });
    
    res.json({
      success: true,
      message: 'Thank you for your booking request. We will contact you within 24 hours to confirm your stay.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/availability', (req, res) => {
  const { month, year, service } = req.query;
  
  // Generate availability for the next 90 days
  const availability = [];
  const today = new Date();
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Simulate availability (weekends less available)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isAvailable = Math.random() > (isWeekend ? 0.7 : 0.3);
    
    availability.push({
      date: date.toISOString().split('T')[0],
      available: isAvailable,
      price: service === 'cottage' ? (isWeekend ? 180 : 150) : null
    });
  }
  
  res.json({ availability });
});

// Serve static files if they exist
const distPath = path.join(__dirname, '..', 'dist');
try {
  app.use(express.static(distPath));
} catch (error) {
  console.log('No static files found, serving SPA mode');
}

// Root route serves the React application or fallback HTML
app.get('/', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Serve inline React application
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - Eco Retreat Booking</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1e40af 0%, #059669 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function LoughHyneCottage() {
            const [services, setServices] = useState([]);
            const [selectedServices, setSelectedServices] = useState([]);
            const [formData, setFormData] = useState({
                name: '',
                email: '',
                checkin: '',
                checkout: '',
                message: ''
            });
            const [loading, setLoading] = useState(false);

            useEffect(() => {
                fetch('/api/bookings/services')
                    .then(res => res.json())
                    .then(data => setServices(data.services))
                    .catch(err => console.error('Error loading services:', err));
            }, []);

            const handleServiceToggle = (serviceId) => {
                setSelectedServices(prev => 
                    prev.includes(serviceId) 
                        ? prev.filter(id => id !== serviceId)
                        : [...prev, serviceId]
                );
            };

            const calculateTotal = () => {
                return selectedServices.reduce((total, serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    return total + (service?.basePrice || 0);
                }, 0);
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                
                if (!formData.name || !formData.email || selectedServices.length === 0) {
                    alert('Please fill in all required fields and select at least one service');
                    return;
                }

                setLoading(true);
                
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            services: selectedServices
                        })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        alert(result.message);
                        setFormData({ name: '', email: '', checkin: '', checkout: '', message: '' });
                        setSelectedServices([]);
                    } else {
                        alert('Error processing request. Please try again.');
                    }
                } catch (error) {
                    alert('Thank you for your interest! Please email us directly at info@loughhynecottage.ie');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="gradient-bg text-white">
                        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                            <h1 className="text-5xl font-light mb-4">Lough Hyne Cottage</h1>
                            <p className="text-xl opacity-90 mb-2">Eco Retreat in Ireland's First Marine Nature Reserve</p>
                            <p className="text-lg opacity-80">Skibbereen, Cork, Ireland</p>
                        </div>
                    </header>

                    {/* Services */}
                    <section className="max-w-7xl mx-auto px-4 py-16">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Experiences</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {services.map(service => (
                                <div key={service.id} className="bg-white rounded-xl p-6 shadow-lg card-hover">
                                    <div className="text-4xl mb-4 text-center">
                                        {service.id === 'cottage' && '🏡'}
                                        {service.id === 'sauna' && '🧘'}
                                        {service.id === 'yoga' && '🧘‍♀️'}
                                        {service.id === 'bread' && '🍞'}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                                    <p className="text-gray-600 mb-4">{service.description}</p>
                                    <div className="text-2xl font-bold text-green-600">€{service.basePrice}/{service.id === 'cottage' ? 'night' : 'session'}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Booking Form */}
                    <section className="gradient-bg text-white">
                        <div className="max-w-4xl mx-auto px-4 py-16">
                            <h2 className="text-3xl font-bold text-center mb-8">Book Your Retreat</h2>
                            
                            <div className="bg-white rounded-xl p-8 text-gray-800">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Service Selection */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">Select Your Experiences</label>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {services.map(service => (
                                                <label key={service.id} className={className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all \${selectedServices.includes(service.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}"}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedServices.includes(service.id)}
                                                        onChange={() => handleServiceToggle(service.id)}
                                                        className="mr-3"
                                                    />
                                                    <span>{service.name} (€{service.basePrice})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold mb-2">Check-in Date</label>
                                            <input 
                                                type="date" 
                                                value={formData.checkin}
                                                onChange={(e) => setFormData({...formData, checkin: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-2">Check-out Date</label>
                                            <input 
                                                type="date" 
                                                value={formData.checkout}
                                                onChange={(e) => setFormData({...formData, checkout: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                min={formData.checkin || new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Guest Details */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold mb-2">Full Name *</label>
                                            <input 
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-2">Email Address *</label>
                                            <input 
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block font-semibold mb-2">Special Requests</label>
                                        <textarea 
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            rows="4"
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                            placeholder="Any special requirements or questions?"
                                        />
                                    </div>

                                    {/* Total */}
                                    {selectedServices.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold">Estimated Total:</span>
                                                <span className="text-2xl font-bold text-green-600">€{calculateTotal()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={loading || selectedServices.length === 0}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending Request...' : 'Request Booking'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="max-w-7xl mx-auto px-4 py-16">
                        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                            <div className="grid md:grid-cols-3 gap-6 text-gray-600">
                                <div>
                                    <div className="text-3xl mb-2">📧</div>
                                    <strong>info@loughhynecottage.ie</strong>
                                </div>
                                <div>
                                    <div className="text-3xl mb-2">📍</div>
                                    <strong>Lough Hyne, Skibbereen, Cork</strong>
                                </div>
                                <div>
                                    <div className="text-3xl mb-2">🌊</div>
                                    <strong>Ireland's First Marine Nature Reserve</strong>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            );
        }

        ReactDOM.render(<LoughHyneCottage />, document.getElementById('root'));
    </script>
</body>
</html>
      `);
    }
  });
});

// API route fallback
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
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database configured: ${!!process.env.DATABASE_URL}`);
  console.log(`Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`Email configured: ${!!process.env.SENDGRID_API_KEY}`);
});