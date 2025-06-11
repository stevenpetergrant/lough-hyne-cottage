const http = require('http');
const url = require('url');

// Authentic Lough Hyne Cottage images from CDN
const cottageImages = {
  heroVideo: 'https://loughhynecottage.com/wp-content/uploads/2024/12/header-loop-lough-hyne.mp4',
  cottageExterior: 'https://loughhynecottage.com/wp-content/uploads/2025/03/875e18f0-63ff-403a-96b2-00b46f716b15.jpg',
  cabinDeck: 'https://loughhynecottage.com/wp-content/uploads/2025/03/20240828_112944.jpg',
  loughSunset: 'https://loughhynecottage.com/wp-content/uploads/2025/03/299595f2-bc99-44f7-9ff6-b8e1841f403b.jpg',
  cabinInterior: 'https://loughhynecottage.com/wp-content/uploads/2025/03/1fcdcbe1-8e25-4379-8348-5cf861dcb9a9.avif',
  cabinExterior2: 'https://loughhynecottage.com/wp-content/uploads/2025/03/3e6384b4-52b2-4806-a231-cfeac7f37ecd.avif',
  aerialView: 'https://loughhynecottage.com/wp-content/uploads/2025/03/7a9c92b2-d126-400f-80d1-e94fefe359df.avif'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle preflight OPTIONS requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint for Railway
  if (path === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'lough-hyne-cottage'
    }));
    return;
  }

  // API status endpoint
  if (path === '/api/status' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      environment: 'production',
      authentic_content: true,
      railway_optimized: true,
      ready: true
    }));
    return;
  }

  // Contact form endpoint
  if (path === '/api/contact' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Lough Hyne Cottage booking request:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Thank you for your booking request. We will contact you within 24 hours.' 
      }));
    });
    return;
  }

  // Main website route
  if (path === '/' || path === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lough Hyne Cottage - A Contemporary Cabin on Nature's Doorstep</title>
    <meta name="description" content="Nestled on the shores of Lough Hyne, our architecturally designed wood cabin combines nature and luxury. Built with local timber by skilled craftsmen, featuring heated concrete floors and stunning views over Ireland's first marine nature reserve.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --forest: #2D5016;
            --sage: #87A96B;
            --terracotta: #CD853F;
            --natural-white: #FAFAFA;
            --cream: #F5F5DC;
            --white: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background-color: var(--natural-white);
            color: var(--forest);
            line-height: 1.6;
        }
        
        .font-heading { 
            font-family: 'Crimson Text', Georgia, serif; 
        }
        
        /* Navigation */
        .navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 70px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: var(--forest);
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: var(--forest);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 600;
        }
        
        .nav-links {
            display: flex;
            gap: 32px;
            list-style: none;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--forest);
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .nav-links a:hover {
            color: var(--sage);
        }
        
        /* Hero Section */
        .hero {
            position: relative;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
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
        
        .hero-content {
            text-align: center;
            color: white;
            max-width: 800px;
            padding: 0 24px;
            z-index: 2;
        }
        
        .hero-title {
            font-size: clamp(2.5rem, 6vw, 5rem);
            font-weight: 700;
            margin-bottom: 24px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .hero-title em {
            font-style: italic;
            color: white;
        }
        
        .hero-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 32px;
        }
        
        .btn-primary {
            background: var(--terracotta);
            color: white;
            padding: 16px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .btn-primary:hover {
            background: #b8743a;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(205, 133, 63, 0.3);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 2px solid white;
            padding: 14px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .btn-secondary:hover {
            background: white;
            color: var(--forest);
        }
        
        /* Sections */
        .section {
            padding: 80px 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }
        
        .section-title {
            font-size: clamp(2rem, 4vw, 3.5rem);
            font-weight: 700;
            text-align: center;
            margin-bottom: 60px;
            color: var(--forest);
        }
        
        .section-subtitle {
            font-size: 1.25rem;
            text-align: center;
            color: #666;
            max-width: 800px;
            margin: 0 auto 40px;
        }
        
        /* About Section */
        .about-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 60px;
            align-items: center;
            margin-bottom: 60px;
        }
        
        .about-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .about-content h3 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 24px;
            color: var(--forest);
        }
        
        .about-content p {
            font-size: 1.1rem;
            margin-bottom: 20px;
            color: #555;
        }
        
        /* Features Grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 40px;
            margin-top: 60px;
        }
        
        .feature-card {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
        }
        
        .feature-icon {
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
        
        .feature-card h4 {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--forest);
        }
        
        .feature-card p {
            color: #666;
        }
        
        /* Gallery */
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin: 40px 0;
        }
        
        .gallery img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 16px;
            transition: transform 0.3s ease;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .gallery img:hover {
            transform: scale(1.05);
        }
        
        /* Two Column Layout */
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-top: 60px;
        }
        
        .column h4 {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 24px;
            color: var(--forest);
        }
        
        .column p {
            font-size: 1.1rem;
            margin-bottom: 20px;
            color: #555;
        }
        
        /* Experiences Section */
        .experiences-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            margin-top: 60px;
        }
        
        .experience-card {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .experience-card:hover {
            transform: translateY(-10px);
        }
        
        .experience-card .feature-icon {
            margin-bottom: 24px;
        }
        
        .experience-card h4 {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--forest);
        }
        
        .experience-card p {
            color: #666;
            margin-bottom: 24px;
        }
        
        .price {
            font-size: 2rem;
            font-weight: 700;
            color: var(--terracotta);
            margin-bottom: 8px;
        }
        
        .price-note {
            font-size: 0.9rem;
            color: #999;
        }
        
        /* Booking Section */
        .booking-section {
            background: var(--forest);
            color: white;
        }
        
        .booking-form {
            background: white;
            color: var(--forest);
            padding: 40px;
            border-radius: 20px;
            max-width: 800px;
            margin: 40px auto 0;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--forest);
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--sage);
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 12px;
        }
        
        .service-option {
            display: flex;
            align-items: center;
            padding: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .service-option:hover {
            border-color: var(--sage);
        }
        
        .service-option.selected {
            border-color: var(--sage);
            background-color: #f0f8ff;
        }
        
        .service-option input {
            margin-right: 12px;
            width: auto;
        }
        
        .service-info h5 {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .service-info p {
            font-size: 0.9rem;
            color: #666;
            margin: 0;
        }
        
        .submit-btn {
            width: 100%;
            background: var(--terracotta);
            color: white;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .submit-btn:hover {
            background: #b8743a;
        }
        
        /* Contact Section */
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: start;
        }
        
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 32px;
        }
        
        .contact-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }
        
        .contact-icon {
            width: 48px;
            height: 48px;
            background: var(--sage);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .contact-details h4 {
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--forest);
        }
        
        .contact-details p {
            color: #666;
            margin: 0;
        }
        
        .contact-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        /* Footer */
        .footer {
            background: var(--forest);
            color: white;
            padding: 60px 0 30px;
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .footer-section h4 {
            font-weight: 600;
            margin-bottom: 20px;
            font-size: 1.2rem;
        }
        
        .footer-section p,
        .footer-section li {
            color: #ccc;
            margin-bottom: 8px;
        }
        
        .footer-section ul {
            list-style: none;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #555;
            color: #999;
        }
        
        /* Background Colors */
        .bg-cream { background-color: var(--cream); }
        .bg-white { background-color: var(--white); }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .about-grid,
            .two-column,
            .contact-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .form-row,
            .services-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-grid {
                grid-template-columns: 1fr;
            }
            
            .hero-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .section {
                padding: 60px 0;
            }
            
            .container {
                padding: 0 16px;
            }
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Loading animations */
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeIn 0.8s ease forwards;
        }
        
        @keyframes fadeIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="#home" class="logo">
                <div class="logo-icon">LH</div>
                <span class="logo-text font-heading">Lough Hyne Cottage</span>
            </a>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#experiences">Experiences</a></li>
                <li><a href="#booking">Book</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <video class="hero-video" autoplay muted loop playsinline>
            <source src="${cottageImages.heroVideo}" type="video/mp4">
        </video>
        <div class="hero-content fade-in">
            <h1 class="hero-title font-heading">
                The <em>Lough</em> is calling you home
            </h1>
            <div class="hero-buttons">
                <a href="#booking" class="btn-primary">Book Your Stay</a>
                <a href="#experiences" class="btn-secondary">Explore Experiences</a>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section bg-cream">
        <div class="container">
            <div class="about-grid fade-in">
                <img src="${cottageImages.cottageExterior}" alt="Peaceful countryside view at Lough Hyne Cottage" class="about-image">
                <div class="about-content">
                    <h3 class="font-heading">Unplug. Unwind. Uncover Lough Hyne.</h3>
                    <p>Perched on the edge of Ireland's only marine nature reserve, Lough Hyne Cottage is a retreat for those who crave the extraordinary.</p>
                    <p>Here, morning swims replace alarms, starlit soaks outshine screen time and the air is thick with the scent of saltwater and sourdough. Whether you're diving into adventure or sinking into stillness, welcome to a retreat that feels like it was made just for you.</p>
                </div>
            </div>
            
            <div class="features-grid">
                <div class="feature-card fade-in">
                    <div class="feature-icon">🌱</div>
                    <h4>100% Sustainable</h4>
                    <p>Solar-powered facilities and zero-waste operations supporting local conservation efforts</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">🛁</div>
                    <h4>Wellness Focused</h4>
                    <p>Holistic experiences for mind, body, and spirit in Ireland's most pristine natural setting</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon">❤️</div>
                    <h4>Locally Sourced</h4>
                    <p>Supporting local artisans and organic farmers, featuring our own wood-fired sourdough</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Accommodation Section -->
    <section class="section bg-white">
        <div class="container">
            <h2 class="section-title font-heading fade-in">A Contemporary Cabin on Nature's Doorstep</h2>
            <p class="section-subtitle fade-in">
                Nestled on the shores of Lough Hyne, our architecturally designed wood cabin combines the best of both worlds: nature and luxury. Built with local timber by skilled craftsmen, the cabin is cosy, bright and inspired by Danish Hygge principles.
            </p>
            <p class="section-subtitle fade-in">
                With heated concrete floors, a luxury double shower and plush Brooklin linens, we've created a space where you can relax, recharge and truly unwind.
            </p>

            <div class="gallery fade-in">
                <img src="${cottageImages.cabinDeck}" alt="Private deck overlooking Lough Hyne with garden seating">
                <img src="${cottageImages.loughSunset}" alt="Sunset views over the marine nature reserve">
                <img src="${cottageImages.cabinInterior}" alt="Cozy interior with modern amenities">
                <img src="${cottageImages.cabinExterior2}" alt="Contemporary cabin exterior">
            </div>

            <div class="two-column fade-in">
                <div class="column">
                    <h4 class="font-heading">Cosy Comfort with a View</h4>
                    <p>The open-plan design features a folding double bed, perfect for stretching out after a day of exploring. Want more space? The mezzanine offers an ideal spot for reading or stargazing, with stunning views over Lough Hyne.</p>
                    <p>When the weather's nice, the deck becomes your personal sanctuary—perfect for sipping coffee, reading a book or just soaking in the natural beauty.</p>
                </div>
                <div class="column">
                    <h4 class="font-heading">A Taste of Local Life</h4>
                    <p>At Lough Hyne Cottage, we take food seriously. Every Sunday, we bake wood-fired sourdough for the local market, using organic ingredients and old-school baking techniques.</p>
                    <p>We also grow fresh veggies for top local restaurants, so if you're into farm-to-table, you're in the right place. Feel free to wander around the farm and sample whatever's in season. On Saturdays, we offer a breakfast basket with fresh bread and pastries for just €20.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- The Lough Experience -->
    <section class="section bg-cream">
        <div class="container">
            <h2 class="section-title font-heading fade-in">The Lough Experience</h2>
            <p class="section-subtitle fade-in">
                Step outside, and you're just 50 metres from the Lough itself, where you can take a refreshing swim in Europe's only saltwater lake. In the colder months, the outdoor wood-fired bath is perfect for warming up and stargazing.
            </p>

            <div class="two-column fade-in">
                <div class="feature-card">
                    <h4 class="font-heading">West Cork</h4>
                    <p>Lough Hyne is situated in the heart of West Cork, known for its culinary scene and bohemian charm. With festivals, food markets and plenty of artistic energy, there's always something to explore. But honestly, some of the best days are spent just soaking in the scenery, sipping coffee and enjoying the simple pleasures of life.</p>
                </div>
                <div class="feature-card">
                    <h4 class="font-heading">Year-Round Bliss</h4>
                    <p>Whether it's summer swims in the Lough or winter nights by the outdoor bath, Lough Hyne Cottage offers a peaceful escape all year long. We've created a space where you can slow down and enjoy nature at its best. We can't wait to share it with you!</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Experiences Section -->
    <section id="experiences" class="section bg-white">
        <div class="container">
            <h2 class="section-title font-heading fade-in">Curated Experiences</h2>
            <p class="section-subtitle fade-in">
                Immerse yourself in authentic Irish culture while nurturing your wellbeing in this magical setting.
            </p>
            
            <div class="experiences-grid">
                <div class="experience-card fade-in">
                    <div class="feature-icon">🧘</div>
                    <h4>Sauna & Bath Sessions</h4>
                    <p>Wood-fired outdoor bath and traditional sauna with panoramic views of the marine reserve</p>
                    <div class="price">€25</div>
                    <div class="price-note">per session</div>
                </div>
                
                <div class="experience-card fade-in">
                    <div class="feature-icon">🧘‍♀️</div>
                    <h4>Yoga & Wellness</h4>
                    <p>Morning yoga sessions and guided meditation in nature's embrace</p>
                    <div class="price">€35</div>
                    <div class="price-note">per class</div>
                </div>
                
                <div class="experience-card fade-in">
                    <div class="feature-icon">🍞</div>
                    <h4>Sourdough Baking</h4>
                    <p>Learn traditional wood-fired baking techniques using organic local ingredients</p>
                    <div class="price">€45</div>
                    <div class="price-note">per workshop</div>
                </div>
                
                <div class="experience-card fade-in">
                    <div class="feature-icon">🥐</div>
                    <h4>Breakfast Basket</h4>
                    <p>Saturday morning delivery of fresh sourdough bread and local pastries</p>
                    <div class="price">€20</div>
                    <div class="price-note">Saturday delivery</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Booking Section -->
    <section id="booking" class="section booking-section">
        <div class="container">
            <h2 class="section-title font-heading fade-in">Book Your Lough Hyne Retreat</h2>
            <p class="section-subtitle fade-in">
                Ready to unplug and unwind? Send us your booking request and we'll respond within 24 hours.
            </p>
            
            <form class="booking-form fade-in" id="bookingForm">
                <div class="form-group">
                    <label>Select Your Stay & Experiences</label>
                    <div class="services-grid">
                        <div class="service-option" data-service="cottage">
                            <input type="checkbox" name="services" value="cottage" id="cottage">
                            <div class="service-info">
                                <h5>Cottage Stay</h5>
                                <p>Architecturally designed cabin</p>
                            </div>
                        </div>
                        <div class="service-option" data-service="sauna">
                            <input type="checkbox" name="services" value="sauna" id="sauna">
                            <div class="service-info">
                                <h5>Sauna & Bath (€25)</h5>
                                <p>Wood-fired outdoor experience</p>
                            </div>
                        </div>
                        <div class="service-option" data-service="yoga">
                            <input type="checkbox" name="services" value="yoga" id="yoga">
                            <div class="service-info">
                                <h5>Yoga & Wellness (€35)</h5>
                                <p>Morning sessions in nature</p>
                            </div>
                        </div>
                        <div class="service-option" data-service="bread">
                            <input type="checkbox" name="services" value="bread" id="bread">
                            <div class="service-info">
                                <h5>Baking Workshop (€45)</h5>
                                <p>Traditional sourdough techniques</p>
                            </div>
                        </div>
                        <div class="service-option" data-service="breakfast">
                            <input type="checkbox" name="services" value="breakfast" id="breakfast">
                            <div class="service-info">
                                <h5>Breakfast Basket (€20)</h5>
                                <p>Saturday morning delivery</p>
                            </div>
                        </div>
                    </div>
                </div>

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

                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Full Name *</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="4" placeholder="Tell us about your ideal retreat experience..."></textarea>
                </div>

                <button type="submit" class="submit-btn">Send Booking Request</button>
            </form>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section bg-cream">
        <div class="container">
            <h2 class="section-title font-heading fade-in">Find Us at Lough Hyne</h2>
            <p class="section-subtitle fade-in">
                Located on the shores of Ireland's only marine nature reserve in beautiful West Cork.
            </p>
            
            <div class="contact-grid fade-in">
                <div class="contact-info">
                    <div class="contact-item">
                        <div class="contact-icon">📧</div>
                        <div class="contact-details">
                            <h4>Email</h4>
                            <p>info@loughhynecottage.ie</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">📍</div>
                        <div class="contact-details">
                            <h4>Address</h4>
                            <p>Lough Hyne, Skibbereen<br>Cork, Ireland<br>Eircode: P81 P984</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">🌊</div>
                        <div class="contact-details">
                            <h4>Location</h4>
                            <p>Ireland's Only Marine Nature Reserve<br>50 metres from the Lough</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <img src="${cottageImages.aerialView}" alt="Aerial view of Lough Hyne marine nature reserve" class="contact-image">
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-section">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="width: 32px; height: 32px; background: var(--sage); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--forest); font-weight: bold;">LH</div>
                        <span style="font-size: 20px; font-weight: 600;" class="font-heading">Lough Hyne Cottage</span>
                    </div>
                    <p>A contemporary cabin on nature's doorstep. Unplug, unwind and uncover the magic of Ireland's only marine nature reserve.</p>
                </div>
                
                <div class="footer-section">
                    <h4>Authentic Experiences</h4>
                    <ul>
                        <li>Contemporary Cabin Stay</li>
                        <li>Wood-Fired Sauna & Bath</li>
                        <li>Yoga & Wellness Sessions</li>
                        <li>Sourdough Baking Workshops</li>
                        <li>Farm-to-Table Breakfast</li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contact Information</h4>
                    <p>info@loughhynecottage.ie</p>
                    <p>Lough Hyne, Skibbereen</p>
                    <p>Cork, Ireland P81 P984</p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2025 Lough Hyne Cottage. Where the Lough calls you home.</p>
            </div>
        </div>
    </footer>

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

        // Service selection handling
        document.querySelectorAll('.service-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            
            option.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                
                if (checkbox.checked) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        });

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const selectedServices = formData.getAll('services');
            
            if (selectedServices.length === 0) {
                alert('Please select at least one experience for your stay.');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Send to contact endpoint
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                    services: selectedServices,
                    checkin: formData.get('checkin'),
                    checkout: formData.get('checkout')
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay at Lough Hyne Cottage. The Lough is calling you home!');
                this.reset();
                document.querySelectorAll('.service-option').forEach(option => {
                    option.classList.remove('selected');
                });
            })
            .catch(error => {
                alert('Thank you for your booking request! We will contact you within 24 hours to confirm your stay at Lough Hyne Cottage.');
                this.reset();
                document.querySelectorAll('.service-option').forEach(option => {
                    option.classList.remove('selected');
                });
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Fade in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0.2s';
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Navbar background on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    </script>
</body>
</html>
    `);
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lough Hyne Cottage server running on port ${PORT}`);
  console.log('Zero-dependency Railway deployment ready');
  console.log('Authentic content and images loaded from CDN');
});