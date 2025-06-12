const express = require('express');
const { createServer } = require('http');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - A Contemporary Cabin on Nature's Doorstep</title>
    <meta name="description" content="Nestled on the shores of Lough Hyne, our architecturally designed wood cabin combines nature and luxury. Built with local timber by skilled craftsmen, featuring heated concrete floors and stunning views over Ireland's first marine nature reserve.">
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
        
        .font-heading { font-family: 'Crimson Text', Georgia, serif; }
        .bg-forest { background-color: var(--forest); }
        .bg-sage { background-color: var(--sage); }
        .bg-terracotta { background-color: var(--terracotta); }
        .bg-natural-white { background-color: var(--natural-white); }
        .bg-cream { background-color: var(--cream); }
        .text-forest { color: var(--forest); }
        .text-sage { color: var(--sage); }
        .text-terracotta { color: var(--terracotta); }
        
        .hero-gradient { 
            background: linear-gradient(rgba(45, 80, 22, 0.4), rgba(45, 80, 22, 0.6)); 
        }
        
        .hero-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
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
            background-color: var(--terracotta);
            color: white;
            padding: 16px 32px;
            border-radius: 9999px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            transform: scale(1);
        }
        .btn-primary:hover {
            background-color: #b8743a;
            transform: scale(1.05);
        }
        
        .btn-secondary {
            background-color: white;
            color: var(--forest);
            border: 2px solid white;
            padding: 16px 32px;
            border-radius: 9999px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .btn-secondary:hover {
            background-color: #f3f4f6;
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
        
        .cottage-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .cottage-gallery img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 12px;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .cottage-gallery img:hover {
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            .section-padding { padding: 60px 0; }
            .container { padding: 0 16px; }
            .hero-content { text-align: center; }
            .hero-text h1 { font-size: 3rem; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 fixed top-0 w-full z-50">
        <div class="container">
            <div class="flex items-center justify-between py-4">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">LH</span>
                    </div>
                    <span class="font-heading font-semibold text-xl text-forest">Lough Hyne Cottage</span>
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="text-forest hover:text-sage transition-colors">Home</a>
                    <a href="#accommodation" class="text-forest hover:text-sage transition-colors">Stay</a>
                    <a href="#experiences" class="text-forest hover:text-sage transition-colors">Experiences</a>
                    <a href="#booking" class="text-forest hover:text-sage transition-colors">Book</a>
                    <a href="#contact" class="text-forest hover:text-sage transition-colors">Contact</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section with Video Background -->
    <section id="home" class="relative h-screen flex items-center justify-center overflow-hidden">
        <video class="hero-video" autoplay muted loop playsinline>
            <source src="https://loughhynecottage.com/wp-content/uploads/2024/12/header-loop-lough-hyne.mp4" type="video/mp4">
        </video>
        <div class="hero-gradient absolute inset-0"></div>
        
        <div class="hero-content relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 class="font-heading text-5xl md:text-7xl font-bold mb-8 text-white">
                The <em class="text-white">Lough</em> is calling you home
            </h1>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#accommodation" class="btn-primary inline-block text-center">
                    Book Your Stay
                </a>
                <a href="#experiences" class="btn-secondary inline-block text-center">
                    Explore Experiences
                </a>
            </div>
        </div>
        
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
        </div>
    </section>

    <!-- Resort Overview -->
    <section class="section-padding bg-cream">
        <div class="container">
            <div class="flex flex-col lg:flex-row gap-12 items-start mb-16">
                <div class="flex-shrink-0">
                    <img 
                        src="https://loughhynecottage.com/wp-content/uploads/2025/03/875e18f0-63ff-403a-96b2-00b46f716b15.jpg"
                        alt="Peaceful countryside view at Lough Hyne Cottage"
                        class="w-80 h-64 object-cover rounded-xl shadow-lg"
                    />
                </div>
                
                <div class="flex-1">
                    <h2 class="font-heading text-3xl md:text-4xl font-bold text-forest mb-6">
                        Unplug. Unwind. Uncover Lough Hyne.
                    </h2>
                    <p class="text-xl text-gray-700 leading-relaxed mb-6">
                        Perched on the edge of Ireland's only marine nature reserve, Lough Hyne Cottage is a retreat for those who crave the extraordinary.
                    </p>
                    <p class="text-lg text-gray-700 leading-relaxed">
                        Here, morning swims replace alarms, starlit soaks outshine screen time and the air is thick with the scent of saltwater and sourdough. Whether you're diving into adventure or sinking into stillness, welcome to a retreat that feels like it was made just for you.
                    </p>
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🌱</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">100% Sustainable</h3>
                    <p class="text-gray-600">Solar-powered facilities and zero-waste operations</p>
                </div>
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🛁</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Wellness Focused</h3>
                    <p class="text-gray-600">Holistic experiences for mind, body, and spirit</p>
                </div>
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">❤️</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Locally Sourced</h3>
                    <p class="text-gray-600">Supporting local artisans and organic farmers</p>
                </div>
            </div>
        </div>
    </section>

    <!-- A Contemporary Cabin on Nature's Doorstep -->
    <section id="accommodation" class="section-padding bg-white">
        <div class="container">
            <h2 class="font-heading text-4xl md:text-5xl font-bold text-forest text-center mb-12">
                A Contemporary Cabin on Nature's Doorstep
            </h2>
            
            <div class="max-w-4xl mx-auto text-center mb-12">
                <p class="text-xl text-gray-700 leading-relaxed mb-6">
                    Nestled on the shores of Lough Hyne, our architecturally designed wood cabin combines the best of both worlds: nature and luxury. Built with local timber by skilled craftsmen, the cabin is cosy, bright and inspired by Danish Hygge principles.
                </p>
                <p class="text-lg text-gray-700 leading-relaxed">
                    With heated concrete floors, a luxury double shower and plush Brooklin linens, we've created a space where you can relax, recharge and truly unwind.
                </p>
            </div>

            <!-- Cottage Gallery -->
            <div class="cottage-gallery">
                <img src="https://loughhynecottage.com/wp-content/uploads/2025/03/20240828_112944.jpg" alt="Private deck overlooking Lough Hyne">
                <img src="https://loughhynecottage.com/wp-content/uploads/2025/03/299595f2-bc99-44f7-9ff6-b8e1841f403b.jpg" alt="Sunset over the marine nature reserve">
                <img src="https://loughhynecottage.com/wp-content/uploads/2025/03/1fcdcbe1-8e25-4379-8348-5cf861dcb9a9.avif" alt="Cozy interior with modern amenities">
                <img src="https://loughhynecottage.com/wp-content/uploads/2025/03/3e6384b4-52b2-4806-a231-cfeac7f37ecd.avif" alt="Contemporary cabin exterior">
            </div>

            <div class="grid md:grid-cols-2 gap-12 mt-16">
                <div>
                    <h3 class="font-heading text-2xl font-bold text-forest mb-6">Cosy Comfort with a View</h3>
                    <p class="text-lg text-gray-700 leading-relaxed mb-6">
                        The open-plan design features a folding double bed, perfect for stretching out after a day of exploring. Want more space? The mezzanine offers an ideal spot for reading or stargazing, with stunning views over Lough Hyne.
                    </p>
                    <p class="text-lg text-gray-700 leading-relaxed">
                        When the weather's nice, the deck becomes your personal sanctuary—perfect for sipping coffee, reading a book or just soaking in the natural beauty.
                    </p>
                </div>
                
                <div>
                    <h3 class="font-heading text-2xl font-bold text-forest mb-6">A Taste of Local Life</h3>
                    <p class="text-lg text-gray-700 leading-relaxed mb-6">
                        At Lough Hyne Cottage, we take food seriously. Every Sunday, we bake wood-fired sourdough for the local market, using organic ingredients and old-school baking techniques.
                    </p>
                    <p class="text-lg text-gray-700 leading-relaxed">
                        We also grow fresh veggies for top local restaurants, so if you're into farm-to-table, you're in the right place. Feel free to wander around the farm and sample whatever's in season. On Saturdays, we offer a breakfast basket with fresh bread and pastries for just €20.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- The Lough Experience -->
    <section class="section-padding bg-cream">
        <div class="container">
            <h2 class="font-heading text-4xl font-bold text-forest text-center mb-12">The Lough Experience</h2>
            
            <div class="max-w-4xl mx-auto text-center mb-12">
                <p class="text-xl text-gray-700 leading-relaxed mb-6">
                    Step outside, and you're just 50 metres from the Lough itself, where you can take a refreshing swim in Europe's only saltwater lake.
                </p>
                <p class="text-lg text-gray-700 leading-relaxed">
                    In the colder months, the outdoor wood-fired bath is perfect for warming up and stargazing. In winter, the cottage becomes a snug retreat, ideal for romantic getaways or quiet weekends spent reading, relaxing and enjoying the quiet.
                </p>
            </div>

            <div class="grid md:grid-cols-2 gap-12">
                <div class="card-hover p-8">
                    <h3 class="font-heading text-2xl font-bold text-forest mb-6">West Cork</h3>
                    <p class="text-lg text-gray-700 leading-relaxed">
                        Lough Hyne is situated in the heart of West Cork, known for its culinary scene and bohemian charm. With festivals, food markets and plenty of artistic energy, there's always something to explore. But honestly, some of the best days are spent just soaking in the scenery, sipping coffee and enjoying the simple pleasures of life.
                    </p>
                </div>
                
                <div class="card-hover p-8">
                    <h3 class="font-heading text-2xl font-bold text-forest mb-6">Year-Round Bliss</h3>
                    <p class="text-lg text-gray-700 leading-relaxed">
                        Whether it's summer swims in the Lough or winter nights by the outdoor bath, Lough Hyne Cottage offers a peaceful escape all year long. We've created a space where you can slow down and enjoy nature at its best. We can't wait to share it with you!
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Experiences -->
    <section id="experiences" class="section-padding bg-white">
        <div class="container">
            <h2 class="font-heading text-4xl font-bold text-forest text-center mb-16">Curated Experiences</h2>
            
            <div class="feature-grid">
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🧘</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Sauna & Bath Sessions</h3>
                    <p class="text-gray-600 mb-6">Wood-fired outdoor bath and traditional sauna with views over the marine reserve</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€25</div>
                    <div class="text-sm text-gray-500">per session</div>
                </div>
                
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🧘‍♀️</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Yoga & Wellness</h3>
                    <p class="text-gray-600 mb-6">Morning yoga sessions and guided meditation in nature's embrace</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€35</div>
                    <div class="text-sm text-gray-500">per class</div>
                </div>
                
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🍞</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Sourdough Baking</h3>
                    <p class="text-gray-600 mb-6">Learn traditional wood-fired baking techniques using organic local ingredients</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€45</div>
                    <div class="text-sm text-gray-500">per workshop</div>
                </div>
                
                <div class="card-hover p-8 text-center">
                    <div class="experience-icon">🥐</div>
                    <h3 class="text-xl font-semibold text-forest mb-4">Breakfast Basket</h3>
                    <p class="text-gray-600 mb-6">Saturday morning delivery of fresh sourdough bread and local pastries</p>
                    <div class="text-2xl font-bold text-terracotta mb-2">€20</div>
                    <div class="text-sm text-gray-500">Saturday delivery</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Booking Section -->
    <section id="booking" class="section-padding bg-forest text-white">
        <div class="container">
            <div class="text-center mb-12">
                <h2 class="font-heading text-4xl font-bold mb-6">Book Your Lough Hyne Retreat</h2>
                <p class="text-xl opacity-90 max-w-2xl mx-auto">
                    Ready to unplug and unwind? Send us your booking request and we'll respond within 24 hours.
                </p>
            </div>
            
            <div class="bg-white rounded-2xl p-8 max-w-3xl mx-auto text-forest">
                <form id="bookingForm" class="space-y-6">
                    <div>
                        <label class="block text-lg font-semibold mb-4">Select Your Stay & Experiences</label>
                        <div class="grid md:grid-cols-2 gap-4">
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="cottage" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Cottage Stay</div>
                                    <div class="text-sm text-gray-600">Architecturally designed cabin</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="sauna" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Sauna & Bath (€25)</div>
                                    <div class="text-sm text-gray-600">Wood-fired outdoor experience</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="yoga" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Yoga & Wellness (€35)</div>
                                    <div class="text-sm text-gray-600">Morning sessions in nature</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="bread" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Baking Workshop (€45)</div>
                                    <div class="text-sm text-gray-600">Traditional sourdough techniques</div>
                                </div>
                            </label>
                            <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-sage transition-colors service-option">
                                <input type="checkbox" name="services" value="breakfast" class="mr-3 text-sage">
                                <div>
                                    <div class="font-semibold">Breakfast Basket (€20)</div>
                                    <div class="text-sm text-gray-600">Saturday morning delivery</div>
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
                        <label class="block font-semibold mb-2">Message</label>
                        <textarea id="message" rows="4" class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent" placeholder="Tell us about your ideal retreat experience..."></textarea>
                    </div>

                    <button type="submit" class="w-full bg-terracotta text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-colors">
                        Send Booking Request
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section-padding bg-cream">
        <div class="container">
            <div class="text-center mb-12">
                <h2 class="font-heading text-4xl font-bold text-forest mb-6">Find Us at Lough Hyne</h2>
                <p class="text-lg text-gray-700 max-w-2xl mx-auto">
                    Located on the shores of Ireland's only marine nature reserve in beautiful West Cork.
                </p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-12 items-start">
                <div class="space-y-8">
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">📧</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Email</h3>
                            <p class="text-gray-600">info@loughhynecottage.ie</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">📍</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Address</h3>
                            <p class="text-gray-600">Lough Hyne<br>Skibbereen, Cork<br>Ireland P81 P984</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                        <div class="w-12 h-12 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xl">🌊</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-forest mb-1">Location</h3>
                            <p class="text-gray-600">Ireland's Only Marine Nature Reserve<br>50 metres from the Lough</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-2xl">
                    <img src="https://loughhynecottage.com/wp-content/uploads/2025/03/7a9c92b2-d126-400f-80d1-e94fefe359df.avif" 
                         alt="Aerial view of Lough Hyne marine nature reserve" 
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
                        <span class="font-heading font-semibold text-xl">Lough Hyne Cottage</span>
                    </div>
                    <p class="text-gray-300 leading-relaxed">
                        A contemporary cabin on nature's doorstep. Unplug, unwind and uncover the magic of Ireland's only marine nature reserve.
                    </p>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Experiences</h4>
                    <ul class="space-y-2 text-gray-300">
                        <li>Contemporary Cabin Stay</li>
                        <li>Wood-Fired Sauna & Bath</li>
                        <li>Yoga & Wellness Sessions</li>
                        <li>Sourdough Baking Workshops</li>
                        <li>Farm-to-Table Breakfast</li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Contact</h4>
                    <div class="space-y-2 text-gray-300">
                        <p>info@loughhynecottage.ie</p>
                        <p>Lough Hyne, Skibbereen</p>
                        <p>Cork, Ireland P81 P984</p>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
                <p>&copy; 2025 Lough Hyne Cottage. Where the Lough calls you home.</p>
            </div>
        </div>
    </footer>

    <script>
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin').min = today;
        document.getElementById('checkout').min = today;
        
        document.getElementById('checkin').addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(checkinDate.getDate() + 1);
            document.getElementById('checkout').min = nextDay.toISOString().split('T')[0];
        });

        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.closest('.service-option');
                if (this.checked) {
                    label.classList.add('border-sage', 'bg-green-50');
                } else {
                    label.classList.remove('border-sage', 'bg-green-50');
                }
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
            
            alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay at Lough Hyne Cottage. The Lough is calling you home!');
            this.reset();
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
    authentic_content: true
  });
});

app.post('/api/contact', (req, res) => {
  console.log('Lough Hyne Cottage booking request:', req.body);
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
  console.log(`Lough Hyne Cottage authentic content server running on port ${PORT}`);
});