import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Mail, Phone } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
}

interface BookingData {
  services: Service[];
  availability: {
    checkIn: string;
    checkOut: string;
  };
}

export default function BookingPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingInfo();
  }, []);

  const fetchBookingInfo = async () => {
    try {
      const response = await fetch('/api/bookings/info');
      const data = await response.json();
      setBookingData(data);
      setCheckIn(data.availability.checkIn);
      setCheckOut(data.availability.checkOut);
    } catch (error) {
      console.error('Error fetching booking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    return selectedServices.reduce((total, serviceId) => {
      const service = bookingData.services.find(s => s.id === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  const handleBooking = async () => {
    if (!guestName || !guestEmail || selectedServices.length === 0) {
      alert('Please fill in all required fields and select at least one service');
      return;
    }

    try {
      setLoading(true);
      
      // Create payment intent
      const paymentResponse = await fetch('/api/bookings/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateTotal(),
          services: selectedServices,
          currency: 'eur'
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.error) {
        alert('Payment processing failed: ' + paymentData.error);
        return;
      }

      // Simulate successful payment and confirm booking
      const confirmResponse = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentData.paymentIntentId,
          guestDetails: { name: guestName, email: guestEmail },
          bookingDetails: {
            services: selectedServices,
            checkIn,
            checkOut
          }
        })
      });

      const confirmData = await confirmResponse.json();
      
      if (confirmData.success) {
        alert('Booking confirmed! You will receive a confirmation email shortly.');
        // Reset form
        setSelectedServices([]);
        setGuestName('');
        setGuestEmail('');
        setMessage('');
      } else {
        alert('Booking confirmation failed: ' + confirmData.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestName || !guestEmail || !message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName,
          email: guestEmail,
          message,
          service: selectedServices.join(', ')
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setGuestName('');
        setGuestEmail('');
        setMessage('');
      } else {
        alert('Failed to send message: ' + data.error);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lough Hyne Cottage</h1>
              <p className="text-gray-600">Ireland's First Marine Nature Reserve • Cork, Ireland</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Book Your Stay</span>
                </CardTitle>
                <CardDescription>
                  Select your services and dates for an authentic Irish cottage experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Services Selection */}
                <div>
                  <Label className="text-base font-semibold">Select Services</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    {bookingData?.services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedServices.includes(service.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            €{service.basePrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in Date</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out Date</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      €{calculateTotal()}
                    </span>
                  </div>
                  {selectedServices.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedServices.map(id => 
                        bookingData?.services.find(s => s.id === id)?.name
                      ).join(', ')}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleBooking}
                  disabled={loading || selectedServices.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Book Now'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Us</span>
                </CardTitle>
                <CardDescription>
                  Have questions? Send us a message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Name *</Label>
                      <Input
                        id="contact-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your inquiry..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cottage Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Lough Hyne Cottage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-sm text-gray-600">
                      Nestled on the shores of Ireland's first marine nature reserve in Cork
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Capacity</h4>
                    <p className="text-sm text-gray-600">
                      Perfect for couples, families, and small groups seeking tranquility
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-sm text-gray-600">
                      info@loughhynecottage.ie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}