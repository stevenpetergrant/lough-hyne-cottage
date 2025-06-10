import ICAL from 'node-ical';
import { storage } from './storage';
import https from 'https';
import http from 'http';

interface AirbnbEvent {
  start: Date;
  end: Date;
  summary: string;
  uid: string;
}

interface AirbnbPricing {
  date: string;
  price: number;
  currency: string;
  available: boolean;
}

export class AirbnbCalendarSync {
  private airbnbCalendarUrl: string;

  constructor(airbnbCalendarUrl: string) {
    this.airbnbCalendarUrl = airbnbCalendarUrl;
  }

  async fetchAirbnbCalendar(): Promise<AirbnbEvent[]> {
    try {
      console.log('Fetching Airbnb calendar from:', this.airbnbCalendarUrl);
      
      // Fetch the iCal data using a Promise-based approach
      const icalData = await new Promise<string>((resolve, reject) => {
        const protocol = this.airbnbCalendarUrl.startsWith('https:') ? https : http;
        
        protocol.get(this.airbnbCalendarUrl, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve(data);
          });
        }).on('error', (error) => {
          reject(error);
        });
      });

      console.log('iCal data length:', icalData.length);
      
      // Parse the iCal data
      const data = ICAL.parseICS(icalData);
      const events: AirbnbEvent[] = [];

      for (const key in data) {
        const event = data[key];
        if (event.type === 'VEVENT') {
          events.push({
            start: new Date(event.start),
            end: new Date(event.end),
            summary: event.summary || 'Airbnb Booking',
            uid: event.uid || key
          });
        }
      }

      console.log('Found', events.length, 'Airbnb events');
      return events;
    } catch (error) {
      console.error('Error fetching Airbnb calendar:', error);
      throw new Error('Failed to fetch Airbnb calendar');
    }
  }

  async syncAirbnbBookings(): Promise<void> {
    try {
      const airbnbEvents = await this.fetchAirbnbCalendar();
      
      for (const event of airbnbEvents) {
        // Check if this Airbnb booking already exists in our system
        const existingBookings = await storage.getBookingsByType('cabin');
        const existingBooking = existingBookings.find(booking => 
          booking.airbnbUid === event.uid
        );

        if (!existingBooking) {
          // Create a new booking from Airbnb data
          await storage.createBooking({
            customerName: 'Airbnb Guest',
            customerEmail: 'airbnb@loughhynecottage.ie',
            customerPhone: '',
            checkIn: event.start,
            checkOut: event.end,
            guests: 2, // Default for Airbnb bookings
            type: 'cabin',
            totalPrice: '0', // Airbnb handles payment
            status: 'confirmed',
            paymentIntentId: `airbnb_${event.uid}`,
            specialRequests: `Airbnb booking: ${event.summary}`,
            airbnbUid: event.uid,
            source: 'airbnb'
          });
        }
      }
    } catch (error) {
      console.error('Error syncing Airbnb bookings:', error);
      throw error;
    }
  }

  async checkAvailabilityWithAirbnb(date: Date): Promise<boolean> {
    try {
      const airbnbEvents = await this.fetchAirbnbCalendar();
      
      // Check if the requested date conflicts with any Airbnb booking
      const hasConflict = airbnbEvents.some(event => {
        return date >= event.start && date < event.end;
      });

      return !hasConflict;
    } catch (error) {
      console.error('Error checking Airbnb availability:', error);
      // If we can't check Airbnb, default to local availability only
      return true;
    }
  }

  generateICalForExport(): string {
    // This would generate an iCal feed that Airbnb can import
    // to sync our local bookings to Airbnb's calendar
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lough Hyne Cottage//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Lough Hyne Cottage Bookings
X-WR-TIMEZONE:Europe/Dublin
X-WR-CALDESC:Bookings for Lough Hyne Cottage
END:VCALENDAR`;
  }
}

export const airbnbSync = new AirbnbCalendarSync(
  'https://www.airbnb.ie/calendar/ical/43575772.ics?s=07e65c83ee4912c33bf1af089bc9844d'
);