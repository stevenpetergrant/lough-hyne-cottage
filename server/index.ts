import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simplified booking endpoints for Railway deployment
app.post('/api/bookings', (req, res) => {
  console.log('Booking received:', req.body);
  res.json({ 
    success: true, 
    message: 'Booking request received. We will contact you shortly to confirm your reservation.',
    id: Date.now()
  });
});

app.get('/api/bookings/public/:type', (req, res) => {
  // Return sample booked dates for calendar display
  const bookedDates = [
    { checkIn: '2025-01-15', checkOut: '2025-01-17' },
    { checkIn: '2025-02-10', checkOut: '2025-02-12' },
    { checkIn: '2025-03-05', checkOut: '2025-03-07' }
  ];
  res.json(bookedDates);
});

app.get('/api/experiences/:type', (req, res) => {
  const experiences = {
    cabin: {
      id: 1,
      type: 'cabin',
      name: 'Eco Cabin Experience',
      description: 'Sustainable luxury in our eco-designed cabins overlooking Lough Hyne Marine Nature Reserve.',
      basePrice: '180.00',
      maxGuests: 6,
      available: true
    },
    sauna: {
      id: 2,
      type: 'sauna',
      name: 'Sauna Sessions',
      description: 'Traditional wood-fired sauna experience.',
      basePrice: '70.00',
      maxGuests: 6,
      available: true
    },
    yoga: {
      id: 3,
      type: 'yoga',
      name: 'Yoga Retreats',
      description: 'Monthly wellness retreats.',
      basePrice: '120.00',
      maxGuests: 12,
      available: true
    },
    bread: {
      id: 4,
      type: 'bread',
      name: 'Bread Making Workshop',
      description: 'Traditional wood-fired bread making.',
      basePrice: '135.00',
      maxGuests: 8,
      available: true
    }
  };
  
  const experience = experiences[req.params.type as keyof typeof experiences];
  if (experience) {
    res.json(experience);
  } else {
    res.status(404).json({ error: 'Experience not found' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const server = createServer(app);
const PORT = parseInt(process.env.PORT || "5000");

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});