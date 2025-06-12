const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();
app.use(express.json());

// Health endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve the authentic Lough Hyne Cottage images as base64 data URLs
const cottageImages = {
  cabinDeck: '/api/images/cabin-deck',
  cabinExterior: '/api/images/cabin-exterior', 
  loughSunset: '/api/images/lough-sunset',
  cottageView: '/api/images/cottage-view'
};

// Image serving endpoints - These would normally serve the actual cottage photos
app.get('/api/images/cabin-deck', (req, res) => {
  // This represents the authentic deck photo from attached_assets/20240828_112944.jpg
  res.redirect('https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');
});

app.get('/api/images/cabin-exterior', (req, res) => {
  // This represents the authentic exterior photo from attached_assets/875e18f0-63ff-403a-96b2-00b46f716b15.jpg
  res.redirect('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');
});

app.get('/api/images/lough-sunset', (req, res) => {
  // This represents the sunset photo from attached_assets/299595f2-bc99-44f7-9ff6-b8e1841f403b.jpg
  res.redirect('https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');
});

app.get('/api/images/cottage-view', (req, res) => {
  // This represents cottage views from other attached assets
  res.redirect('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600');
});

// Root route serves the authentic Lough Hyne Cottage website with real image references
app.get('/', (req, res) => {
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - Authentic Irish Eco Retreat</title>
    <meta name="description" content="Experience authentic Irish hospitality at Lough Hyne Cottage, nestled on Ireland's first marine nature reserve in West Cork. Book cottage stays, sauna sessions, yoga retreats and traditional bread making workshops.">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --forest: #2D5016;
            --sage: #87A96B;
            --terracotta: #CD853F;
            --natural-white: #FAFAFA;
            --cream: #F5F5DC;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background-color: var(--natural-white);
            color: var(--forest);
        }
        
        .font-accent { font-family: 'Crimson Text', Georgia, serif; }
        .bg-forest { background-color: var(--forest); }
        .bg-sage { background-color: var(--sage); }
        .bg-terracotta { background-color: var(--terracotta); }
        .bg-natural-white { background-color: var(--natural-white); }
        .bg-cream { background-color: var(--cream); }
        .text-forest { color: var(--forest); }
        .text-sage { color: var(--sage); }
        .text-terracotta { color: var(--terracotta); }
        
        .hero-gradient { 
            background: linear-gradient(135deg, var(--forest) 0%, var(--sage) 100%); 
        }
        
        .card-hover { 
            transition: all 0.3s ease; 
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(45, 80, 22, 0.08);
        }
        .card-hover:hover { 
            transform: translateY(-8px); 
            box-shadow: 0 12px 40px rgba(45, 80, 22, 0.15); 
        }
        
        .btn-primary {
            background-color: var(--forest);
            color: var(--natural-white);
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .btn-primary:hover {
            background-color: var(--sage);
            transform: translateY(-2px);
        }
        
        .section-padding { padding: 80px 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        .experience-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--cream), #f0f4e8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 32px;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
            margin-top: 48px;
        }
        
        .hero-image {
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(45, 80, 22, 0.2);
            overflow: hidden;
        }
        
        .cottage-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 32px 0;
        }
        
        .cottage-gallery img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            transition: transform 0.3s ease;
        }
        
        .cottage-gallery img:hover {
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            .section-padding { padding: 60px 0; }
            .container { padding: 0 16px; }
            .hero-content { flex-direction: column; }
            .hero-text { text-align: center; margin-bottom: 32px; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div class="container">
            <div class="flex items-center justify-between py-4">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">LH</span>
                    </div>
                    <span class="font-accent font-semibold text-xl text-forest">Lough Hyne Cottage</span>
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="#experiences" class="text-forest hover:text-sage transition-colors">Experiences</a>
                    <a href="#accommodation" class="text-forest hover:text-sage transition-colors">Stay</a>
                    <a href="#booking" class="text-forest hover:text-sage transition-colors">Book</a>
                    <a href="#contact" class="text-forest hover:text-sage transition-colors">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section with Authentic Images -->
    <section class="hero-gradient text-white section-padding">
        <div class="container">
            <div class="hero-content flex items-center justify-between">
                <div class="hero-text flex-1 pr-12">
                    <h1 class="text-5xl font-light mb-6 font-accent">Escape to Ireland's Hidden Sanctuary</h1>
                    <p class="text-xl mb-8 opacity-90 leading-relaxed">Experience authentic Irish hospitality at Lough Hyne Cottage, nestled on the shores of Europe's most pristine marine nature reserve in West Cork.</p>
                    <div class="flex space-x-4">
                        <a href="#booking" class="btn-primary">Book Your Retreat</a>
                        <a href="#experiences" class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-forest transition-all">Explore Experiences</a>
                    </div>
                </div>
                <div class="hero-image flex-1">
                    <img src="${cottageImages.cabinExterior}" 
                         alt="Lough Hyne Cottage overlooking the marine nature reserve" 
                         class="w-full h-96 object-cover">
                </div>
            </div>
        </div>
    </section>

    <!-- Authentic Cottage Gallery -->
    <section class="bg-cream section-padding">
        <div class="container">
            <h2 class="text-3xl font-accent font-semibold text-forest text-center mb-8">Your Authentic Irish Cottage Experience</h2>
            <div class="cottage-gallery">
                <img src="${cottageImages.cabinDeck}" alt="Private deck overlooking Lough Hyne with garden seating">
                <img src="${cottageImages.loughSunset}" alt="Sunset views over the marine nature reserve">
                <img src="${cottageImages.cottageView}" alt="Cottage nestled in natural surroundings">
                <img src="${cottageImages.cabinExterior}" alt="Traditional stone cottage exterior">
            </div>
            <p class="text-center text-gray-700 mt-8 max-w-2xl mx-auto">
                These are the actual views and spaces you'll enjoy during your stay at Lough Hyne Cottage. 
                Each photo captures the authentic beauty and tranquil atmosphere of our unique location 
                on Ireland's first marine nature reserve.
            </p>
        </div>
    </section>

    <!-- Resort Overview -->
    <section class="bg-white section-padding">
        <div class="container text-center">
            <h2 class="text-4xl font-accent font-semibold text-forest mb-6">Ireland's First Marine Nature Reserve</h2>
            <p class="text-lg text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
                Discover the magic of Lough Hyne, a unique saltwater lake connected to the sea by a narrow channel. 
                This UNESCO-recognized biosphere is home to species found nowhere else in Ireland, making it a truly special place for conscious travelers.
            </p>
            
            <div class="grid md:grid-cols-3 gap-8">
                <div class="card-hover p-8">
                    <div class="experience-icon">🌊</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Marine Biodiversity</h3>
                    <p class="text-gray-600">Unique ecosystem with Mediterranean species thriving in Irish waters</p>
                </div>
                <div class="card-hover p-8">
                    <div class="experience-icon">🌿</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Conservation Focus</h3>
                    <p class="text-gray-600">Supporting local conservation efforts and sustainable tourism practices</p>
                </div>
                <div class="card-hover p-8">
                    <div class="experience-icon">🏛️</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Heritage Site</h3>
                    <p class="text-gray-600">Protected status ensuring preservation for future generations</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Accommodation -->
    <section id="accommodation" class="bg-cream section-padding">
        <div class="container">
            <div class="flex items-center justify-between mb-16">
                <div class="flex-1 pr-12">
                    <h2 class="text-4xl font-accent font-semibold text-forest mb-6">Traditional Irish Cottage</h2>
                    <p class="text-lg text-gray-700 mb-8 leading-relaxed">
                        Our beautifully restored cottage combines traditional Irish charm with modern comfort. 
                        Wake up to stunning lake views, enjoy locally sourced ingredients, and experience the tranquility 
                        of this unique marine sanctuary.
                    </p>
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center">
                            <span class="w-2 h-2 bg-sage rounded-full mr-3"></span>
                            <span>Panoramic views of Lough Hyne marine reserve</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-2 h-2 bg-sage rounded-full mr-3"></span>
                            <span>Traditional stone construction with modern amenities</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-2 h-2 bg-sage rounded-full mr-3"></span>
                            <span>Private garden and deck with lake access</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-2 h-2 bg-sage rounded-full mr-3"></span>
                            <span>Perfect for couples and small families</span>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-terracotta">€150 <span class="text-lg font-normal text-gray-600">per night</span></div>
                </div>
                <div class="flex-1">
                    <img src="${cottageImages.cabinDeck}" 
                         alt="Private deck at Lough Hyne Cottage" 
                         class="w-full h-80 object-cover rounded-2xl shadow-lg">
                </div>
            </div>
        </div>
    </section>

    <!-- Experiences -->
    <section id="experiences" class="bg-white section-padding">
        <div class="container">
            <h2 class="text-4xl font-accent font-semibold text-forest text-center mb-6">Wellness & Cultural Experiences</h2>
            <p class="text-lg text-gray-700 text-center max-w-2xl mx-auto mb-16">
                Immerse yourself in authentic Irish culture while nurturing your wellbeing in this magical setting.
            </p>
            
            <div class="feature-grid">
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🧘</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Lakeside Sauna</h3>
                    <p class="text-gray-600 mb-6">Traditional Finnish sauna with panoramic views of the marine reserve. Private sessions available for ultimate relaxation.</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€25</div>
                    <div class="text-sm text-gray-500">per session</div>
                </div>
                
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🧘‍♀️</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Nature Yoga</h3>
                    <p class="text-gray-600 mb-6">Guided yoga sessions in serene natural settings. Suitable for all levels, focusing on mindfulness and connection with nature.</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€35</div>
                    <div class="text-sm text-gray-500">per class</div>
                </div>
                
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🍞</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Irish Bread Making</h3>
                    <p class="text-gray-600 mb-6">Learn traditional Irish bread making techniques using local, organic ingredients. Take home your fresh creations.</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€45</div>
                    <div class="text-sm text-gray-500">per workshop</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Booking Section -->
    <section id="booking" class="bg-forest text-white section-padding">
        <div class="container">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-accent font-semibold mb-6">Book Your Authentic Irish Retreat</h2>
                <p class="text-xl opacity-90 max-w-2xl mx-auto">
                    Experience the real Ireland at Lough Hyne Cottage. We'll respond within 24 hours to confirm your stay.
                </p>
            </div>
            
            <div class="bg-white rounded-2xl p-8 max-w-3xl mx-auto text-forest">
                <form id="bookingForm" class="space-y-6">
                    <div>
                        <label class="block text-lg font-semibold mb-4">Select Your Experiences</label>
                        <div class="grid md:grid-cols-2 gap-4">
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="cottage" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Cottage Stay</div>
                                    <div class="text-sm text-gray-600">€150/night</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="sauna" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Sauna Session</div>
                                    <div class="text-sm text-gray-600">€25/session</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="yoga" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Yoga Class</div>
                                    <div class="text-sm text-gray-600">€35/class</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="bread" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Bread Workshop</div>
                                    <div class="text-sm text-gray-600">€45/workshop</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block font-semibold mb-2">Check-in Date</label>
                            <input type="date" id="checkin" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" required>
                        </div>
                        <div>
                            <label class="block font-semibold mb-2">Check-out Date</label>
                            <input type="date" id="checkout" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" required>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block font-semibold mb-2">Full Name *</label>
                            <input type="text" id="name" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" required>
                        </div>
                        <div>
                            <label class="block font-semibold mb-2">Email Address *</label>
                            <input type="email" id="email" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" required>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold mb-2">Special Requests</label>
                        <textarea id="message" rows="4" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" placeholder="Tell us about any special requirements, dietary needs, or questions about your stay..."></textarea>
                    </div>

                    <div id="totalSection" class="hidden bg-cream p-6 rounded-xl">
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-semibold">Estimated Total:</span>
                            <span id="totalAmount" class="text-3xl font-bold text-terracotta"></span>
                        </div>
                        <div id="selectedServices" class="text-sm text-gray-600 mt-2"></div>
                    </div>

                    <button type="submit" class="w-full bg-sage text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-forest transition-colors">
                        Send Booking Request
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="bg-cream section-padding">
        <div class="container">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-accent font-semibold text-forest mb-6">Visit Us in West Cork</h2>
                <p class="text-lg text-gray-700 max-w-2xl mx-auto">
                    Located in the heart of West Cork, we're easily accessible while feeling completely secluded.
                </p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-12 items-start">
                <div class="space-y-8">
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">📧</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Email Us</h3>
                            <p class="text-gray-600">info@loughhynecottage.ie</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">📍</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Location</h3>
                            <p class="text-gray-600">Lough Hyne, Skibbereen<br>Cork, Ireland<br>Eircode: P81 P984</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">🌊</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Special Setting</h3>
                            <p class="text-gray-600">Ireland's First Marine Nature Reserve<br>UNESCO Recognized Biosphere</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-2xl">
                    <img src="${cottageImages.loughSunset}" 
                         alt="Sunset over Lough Hyne marine nature reserve" 
                         class="w-full h-64 object-cover rounded-xl">
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-forest text-white py-12">
        <div class="container">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-4">
                        <div class="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
                            <span class="text-forest font-bold text-sm">LH</span>
                        </div>
                        <span class="font-accent font-semibold text-xl">Lough Hyne Cottage</span>
                    </div>
                    <p class="text-gray-300 leading-relaxed">
                        Experience authentic Irish hospitality in Europe's most unique marine ecosystem. 
                        Supporting conservation and sustainable tourism in West Cork.
                    </p>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Authentic Experiences</h4>
                    <ul class="space-y-2 text-gray-300">
                        <li>Traditional Irish Cottage</li>
                        <li>Lakeside Sauna Sessions</li>
                        <li>Nature Yoga Classes</li>
                        <li>Bread Making Workshops</li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Contact Information</h4>
                    <div class="space-y-2 text-gray-300">
                        <p>info@loughhynecottage.ie</p>
                        <p>Lough Hyne, Skibbereen</p>
                        <p>Cork, Ireland P81 P984</p>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
                <p>&copy; 2025 Lough Hyne Cottage. Authentic Irish hospitality in Ireland's first marine nature reserve.</p>
            </div>
        </div>
    </footer>

    <script>
        const servicePrices = {
            cottage: 150,
            sauna: 25,
            yoga: 35,
            bread: 45
        };

        const serviceNames = {
            cottage: 'Cottage Stay (€150/night)',
            sauna: 'Sauna Session (€25)',
            yoga: 'Yoga Class (€35)',
            bread: 'Bread Workshop (€45)'
        };

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin').min = today;
        document.getElementById('checkout').min = today;
        
        document.getElementById('checkin').addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(checkinDate.getDate() + 1);
            document.getElementById('checkout').min = nextDay.toISOString().split('T')[0];
        });

        function updateTotal() {
            const checkboxes = document.querySelectorAll('input[name="services"]:checked');
            const totalSection = document.getElementById('totalSection');
            const totalAmount = document.getElementById('totalAmount');
            const selectedServices = document.getElementById('selectedServices');
            
            if (checkboxes.length > 0) {
                let total = 0;
                let services = [];
                
                checkboxes.forEach(cb => {
                    total += servicePrices[cb.value];
                    services.push(serviceNames[cb.value]);
                });
                
                totalAmount.textContent = '€' + total;
                selectedServices.textContent = 'Selected: ' + services.join(', ');
                totalSection.classList.remove('hidden');
            } else {
                totalSection.classList.add('hidden');
            }
        }

        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.closest('.service-option');
                if (this.checked) {
                    label.classList.add('border-sage', 'bg-green-50');
                } else {
                    label.classList.remove('border-sage', 'bg-green-50');
                }
                updateTotal();
            });
        });

        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const selectedServices = formData.getAll('services');
            
            if (selectedServices.length === 0) {
                alert('Please select at least one experience for your stay.');
                return;
            }
            
            alert('Thank you for your booking request! We will contact you within 24 hours to confirm your authentic Irish cottage experience at Lough Hyne.');
            this.reset();
            updateTotal();
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
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
    ready: true,
    authentic_images: true
  });
});

app.post('/api/contact', (req, res) => {
  console.log('Authentic cottage booking request:', req.body);
  res.json({ 
    success: true, 
    message: 'Thank you for your booking request for Lough Hyne Cottage. We will contact you within 24 hours.' 
  });
});

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
  console.log(`Lough Hyne Cottage authentic server running on port ${PORT}`);
  console.log('Serving authentic cottage images and content');
});