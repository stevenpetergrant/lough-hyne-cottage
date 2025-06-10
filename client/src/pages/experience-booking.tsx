import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, Euro } from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Experience {
  id: number;
  type: string;
  name: string;
  description: string;
  basePrice: string;
  maxGuests: number;
  duration: string;
  amenities: string[];
  available: boolean;
}

interface BookingData {
  experienceId: number;
  experienceType: string;
  date: Date;
  guests: number;
  duration?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  totalPrice: number;
}

interface AvailabilityData {
  date: string;
  availableSlots: number;
  bookedSlots: number;
  isBlocked: boolean;
}

function PaymentForm({ bookingData, onSuccess }: { bookingData: BookingData; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/booking-success",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Pay €${bookingData.totalPrice}`}
      </Button>
    </form>
  );
}

export default function ExperienceBooking() {
  const [match, params] = useRoute("/book/:experienceType");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: ""
  });
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const experienceType = params?.experienceType;

  const { data: experience, isLoading: experienceLoading } = useQuery<Experience>({
    queryKey: ['/api/experiences', experienceType],
    enabled: !!experienceType,
  });

  const { data: availability = [], isLoading: availabilityLoading } = useQuery<AvailabilityData[]>({
    queryKey: ['/api/availability', experienceType],
    enabled: !!experienceType,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      const response = await apiRequest("POST", "/api/create-experience-payment", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!match || !experienceType) {
    return <div>Experience not found</div>;
  }

  if (experienceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!experience) {
    return <div>Experience not found</div>;
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.find(a => 
      format(new Date(a.date), 'yyyy-MM-dd') === dateStr
    );
    
    if (!dayAvailability) return false;
    return !dayAvailability.isBlocked && dayAvailability.availableSlots > dayAvailability.bookedSlots;
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(experience.basePrice);
    let total = basePrice;

    if (experienceType === 'sauna' && duration) {
      total = basePrice * duration; // €70 per hour
    } else if (experienceType === 'yoga' || experienceType === 'bread') {
      total = basePrice * guests;
    }

    return total;
  };

  const handleBooking = () => {
    if (!selectedDate || !customerData.name || !customerData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const bookingData: BookingData = {
      experienceId: experience.id,
      experienceType: experience.type,
      date: selectedDate,
      guests,
      duration: experienceType === 'sauna' ? duration : undefined,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      specialRequests: customerData.specialRequests,
      totalPrice: calculateTotalPrice()
    };

    createPaymentIntentMutation.mutate(bookingData);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast({
      title: "Booking Confirmed",
      description: "Your experience has been booked successfully!",
    });
    // Redirect to confirmation page or reset form
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Experiences
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experience Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-800">{experience.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{experience.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-emerald-600" />
                  <span>€{experience.basePrice}{experienceType === 'sauna' ? '/hour' : experienceType === 'cabin' ? '/night' : '/person'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Max {experience.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{experience.duration}</span>
                </div>
              </div>

              {experience.amenities && experience.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-2">What's Included:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {experience.amenities.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800">Book Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPayment ? (
                <>
                  {/* Calendar */}
                  <div>
                    <Label className="text-sm font-medium">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => 
                        isBefore(date, startOfDay(new Date())) || 
                        !isDateAvailable(date)
                      }
                      className="rounded-md border w-full"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: experience.maxGuests }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration for Sauna */}
                  {experienceType === 'sauna' && (
                    <div>
                      <Label htmlFor="duration">Duration (Hours)</Label>
                      <Select value={duration?.toString() || ""} onValueChange={(value) => setDuration(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Hour</SelectItem>
                          <SelectItem value="2">2 Hours</SelectItem>
                          <SelectItem value="3">3 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requests">Special Requests</Label>
                      <Textarea
                        id="requests"
                        value={customerData.specialRequests}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-emerald-600">€{calculateTotalPrice()}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBooking} 
                    className="w-full"
                    disabled={createPaymentIntentMutation.isPending}
                  >
                    {createPaymentIntentMutation.isPending ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </>
              ) : (
                clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Details</h3>
                      <PaymentForm bookingData={{
                        experienceId: experience.id,
                        experienceType: experience.type,
                        date: selectedDate!,
                        guests,
                        duration,
                        customerName: customerData.name,
                        customerEmail: customerData.email,
                        customerPhone: customerData.phone,
                        specialRequests: customerData.specialRequests,
                        totalPrice: calculateTotalPrice()
                      }} onSuccess={handlePaymentSuccess} />
                    </div>
                  </Elements>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}