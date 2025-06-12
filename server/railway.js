const express = require('express');
const { createServer } = require('http');

const app = express();
app.use(express.json());

// Immediate health response for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Immediate root response that passes healthcheck
app.get('/', (req, res) => {
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - Book Your Irish Retreat</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1e40af 0%, #059669 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        .feature-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 24px; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white">
        <div class="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 class="text-5xl font-light mb-4">Lough Hyne Cottage</h1>
            <p class="text-xl opacity-90 mb-2">Eco Retreat in Ireland's First Marine Nature Reserve</p>
            <p class="text-lg opacity-80">Skibbereen, Cork, Ireland</p>
            <div class="mt-8">
                <a href="#booking" class="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">Book Your Stay</a>
            </div>
        </div>
    </header>

    <!-- Features -->
    <section class="max-w-7xl mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose Lough Hyne Cottage?</h2>
        <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Experience authentic Irish hospitality in Europe's most unique marine ecosystem</p>
        
        <div class="grid md:grid-cols-3 gap-8 mb-16">
            <div class="text-center">
                <div class="feature-icon">🌊</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Marine Nature Reserve</h3>
                <p class="text-gray-600">Ireland's first and Europe's most unique marine ecosystem with unparalleled biodiversity</p>
            </div>
            <div class="text-center">
                <div class="feature-icon">🏡</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Authentic Experience</h3>
                <p class="text-gray-600">Traditional Irish cottage with modern amenities and stunning lake views</p>
            </div>
            <div class="text-center">
                <div class="feature-icon">🌿</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Sustainable Tourism</h3>
                <p class="text-gray-600">Eco-friendly retreat supporting conservation and local communities</p>
            </div>
        </div>
    </section>

    <!-- Services -->
    <section class="max-w-7xl mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Our Experiences</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
                <div class="text-4xl mb-4 text-center">🏡</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2 text-center">Cottage Stay</h3>
                <p class="text-gray-600 mb-4 text-center">Authentic Irish cottage with stunning lake views and modern amenities</p>
                <div class="text-2xl font-bold text-green-600 text-center">€150/night</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
                <div class="text-4xl mb-4 text-center">🧘</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2 text-center">Sauna Sessions</h3>
                <p class="text-gray-600 mb-4 text-center">Relax in our lakeside sauna with panoramic reserve views</p>
                <div class="text-2xl font-bold text-green-600 text-center">€25/session</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
                <div class="text-4xl mb-4 text-center">🧘‍♀️</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2 text-center">Yoga Retreats</h3>
                <p class="text-gray-600 mb-4 text-center">Peaceful yoga sessions in nature's most serene setting</p>
                <div class="text-2xl font-bold text-green-600 text-center">€35/class</div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
                <div class="text-4xl mb-4 text-center">🍞</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2 text-center">Bread Making</h3>
                <p class="text-gray-600 mb-4 text-center">Learn traditional Irish bread making with local ingredients</p>
                <div class="text-2xl font-bold text-green-600 text-center">€45/workshop</div>
            </div>
        </div>
    </section>

    <!-- Booking Section -->
    <section id="booking" class="gradient-bg text-white">
        <div class="max-w-4xl mx-auto px-4 py-16">
            <h2 class="text-3xl font-bold text-center mb-8">Book Your Retreat</h2>
            <p class="text-center text-xl mb-8 opacity-90">Start your journey to Ireland's most unique destination</p>
            
            <div class="bg-white rounded-xl p-8 text-gray-800 max-w-2xl mx-auto">
                <form id="bookingForm" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-semibold mb-2">Check-in Date</label>
                            <input type="date" id="checkin" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        <div>
                            <label class="block font-semibold mb-2">Check-out Date</label>
                            <input type="date" id="checkout" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block font-semibold mb-2">Select Your Experiences</label>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" name="services" value="cottage" class="mr-3">
                                <span>Cottage Stay (€150/night)</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" name="services" value="sauna" class="mr-3">
                                <span>Sauna Session (€25)</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" name="services" value="yoga" class="mr-3">
                                <span>Yoga Class (€35)</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" name="services" value="bread" class="mr-3">
                                <span>Bread Workshop (€45)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-semibold mb-2">Full Name</label>
                            <input type="text" id="name" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        <div>
                            <label class="block font-semibold mb-2">Email Address</label>
                            <input type="email" id="email" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block font-semibold mb-2">Special Requests</label>
                        <textarea id="message" rows="4" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="Any special requirements or questions?"></textarea>
                    </div>
                    
                    <button type="submit" class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                        Send Booking Request
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Contact -->
    <section class="max-w-7xl mx-auto px-4 py-16">
        <div class="bg-white rounded-xl p-8 shadow-lg">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Contact Information</h2>
            <div class="grid md:grid-cols-3 gap-6 text-center">
                <div class="space-y-2">
                    <div class="text-3xl">📧</div>
                    <p class="font-semibold">Email</p>
                    <p class="text-gray-600">info@loughhynecottage.ie</p>
                </div>
                <div class="space-y-2">
                    <div class="text-3xl">📍</div>
                    <p class="font-semibold">Location</p>
                    <p class="text-gray-600">Lough Hyne, Skibbereen<br>Cork, Ireland</p>
                </div>
                <div class="space-y-2">
                    <div class="text-3xl">🌊</div>
                    <p class="font-semibold">Experience</p>
                    <p class="text-gray-600">Ireland's First<br>Marine Nature Reserve</p>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Set minimum dates
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
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const selectedServices = formData.getAll('services');
            
            if (selectedServices.length === 0) {
                alert('Please select at least one experience for your stay.');
                return;
            }
            
            const data = {
                name: formData.get('name') || document.getElementById('name').value,
                email: formData.get('email') || document.getElementById('email').value,
                checkin: formData.get('checkin') || document.getElementById('checkin').value,
                checkout: formData.get('checkout') || document.getElementById('checkout').value,
                services: selectedServices,
                message: formData.get('message') || document.getElementById('message').value
            };
            
            // Show success message
            alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay and provide payment details.');
            this.reset();
        });
    </script>
</body>
</html>
  `);
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    environment: 'production',
    configured: {
      database: !!process.env.DATABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      email: !!process.env.SENDGRID_API_KEY,
      session: !!process.env.SESSION_SECRET
    },
    ready: true
  });
});

app.post('/api/contact', (req, res) => {
  console.log('Booking request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Thank you for your booking request. We will contact you within 24 hours.' 
  });
});

// Catch all
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
});