import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Euro, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

function PaymentForm({ 
  customerDetails, 
  onCustomerDetailsChange,
  bookingDetails,
  onSuccess 
}: { 
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (details: CustomerDetails) => void;
  bookingDetails: any;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (!customerDetails.name || !customerDetails.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address",
        variant: "destructive",
      });
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
        // Payment successful - booking will be confirmed via webhook
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
      {/* Customer Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-emerald-800">Your Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={customerDetails.name}
              onChange={(e) => onCustomerDetailsChange({...customerDetails, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={customerDetails.email}
              onChange={(e) => onCustomerDetailsChange({...customerDetails, email: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={customerDetails.phone}
            onChange={(e) => onCustomerDetailsChange({...customerDetails, phone: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="requests">Special Requests</Label>
          <Textarea
            id="requests"
            value={customerDetails.specialRequests}
            onChange={(e) => onCustomerDetailsChange({...customerDetails, specialRequests: e.target.value})}
            rows={3}
            placeholder="Any dietary requirements, accessibility needs, or special requests..."
          />
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-emerald-800">Payment Information</h3>
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-forest text-white hover:bg-forest/80"
        size="lg"
      >
        <Euro className="w-5 h-5 mr-2" />
        {isProcessing ? "Processing..." : `Pay €${bookingDetails?.totalPrice || '0'}`}
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const [location] = useLocation();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    specialRequests: ""
  });
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const { toast } = useToast();

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const clientSecret = urlParams.get('clientSecret');
  const bookingId = urlParams.get('bookingId');

  useEffect(() => {
    // Get booking details from URL parameters or session storage
    const savedBookingDetails = sessionStorage.getItem('bookingDetails');
    if (savedBookingDetails) {
      setBookingDetails(JSON.parse(savedBookingDetails));
      sessionStorage.removeItem('bookingDetails'); // Clean up
    }
  }, []);

  const handlePaymentSuccess = () => {
    toast({
      title: "Booking Confirmed",
      description: "Your experience has been booked successfully!",
    });
    // Redirect to success page or home
    window.location.href = "/";
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-emerald-800 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">
              There was an issue processing your booking. Please try again.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Booking Summary */}
          {bookingDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-800">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{bookingDetails.experienceName}</h3>
                  <p className="text-gray-600">{bookingDetails.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-gray-600">
                        {format(new Date(bookingDetails.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-gray-600">{bookingDetails.guests} people</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-emerald-600">€{bookingDetails.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800">Complete Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  customerDetails={customerDetails}
                  onCustomerDetailsChange={setCustomerDetails}
                  bookingDetails={bookingDetails}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}