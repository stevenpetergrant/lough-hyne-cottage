import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Thermometer, Clock, Droplets, Leaf, Users, Euro, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Experience } from "@shared/schema";

export default function SaunaBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: experience, isLoading, error } = useQuery<Experience>({
    queryKey: ["/api/experiences/sauna"],
  });

  const { data: saunaAvailability = [] } = useQuery({
    queryKey: ['/api/admin/availability', 'sauna'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/availability/sauna");
      return response.json();
    }
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-experience-payment", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      // Store booking details for payment page
      const bookingDetails = {
        experienceName: "Sauna Sessions",
        description: "Relax and rejuvenate in our traditional Finnish sauna",
        experienceType: "sauna",
        date: selectedDate?.toISOString(),
        time: selectedTime,
        guests: guests,
        totalPrice: calculatePrice().toFixed(2)
      };
      
      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
      queryClient.invalidateQueries({ queryKey: ['/api/admin/availability'] });
      
      // Redirect to payment page with client secret
      window.location.href = `/payment?clientSecret=${data.clientSecret}&bookingId=${data.bookingId}`;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const availableTimeSlots = [
    { time: "19:00", label: "7:00 PM", duration: "1 hour", price: 70 },
    { time: "20:00", label: "8:00 PM", duration: "1 hour", price: 70 }
  ];

  const calculatePrice = () => {
    return 70; // €70 flat rate for private session regardless of guests
  };

  const getAvailableDates = () => {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // For now, make all dates in the next 30 days available
    // In production, this would filter based on actual availability data
    return { from: today, to: nextMonth };
  };

  const handleBookNow = () => {
    if (!selectedDate || !selectedTime || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and fill in your contact details",
        variant: "destructive",
      });
      return;
    }

    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    createPaymentMutation.mutate({
      experienceId: experience?.id || 0,
      experienceType: "sauna",
      date: selectedDateTime.toISOString(),
      guests: guests,
      totalPrice: calculatePrice(),
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      duration: 1
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-natural-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-natural-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Experience Not Found</h1>
              <p className="text-gray-600 mb-4">The sauna experience could not be loaded.</p>
              <Link href="/">
                <button className="text-forest hover:underline">← Return to Home</button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const features = [
    { icon: Thermometer, text: "Traditional Finnish design with authentic wood burning" },
    { icon: Leaf, text: "Eucalyptus aromatherapy for enhanced relaxation" },
    { icon: Clock, text: "Flexible scheduling with hourly and daily options" },
    { icon: Droplets, text: "Pure spring water for steam and cooling" }
  ];

  const benefits = [
    "Detoxification through deep sweating",
    "Improved circulation and cardiovascular health",
    "Stress relief and mental relaxation",
    "Enhanced skin health and appearance",
    "Better sleep quality",
    "Muscle recovery after outdoor activities"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/events-experiences">
          <button className="flex items-center text-forest hover:text-forest/80 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiences
          </button>
        </Link>

        {/* Hero Section with Main Image */}
        <div className="mb-12">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-8">
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2024/08/Sauna-Experience-1.jpg" 
              alt="Sauna Experience at Lough Hyne Cottage" 
              className="w-full h-full object-cover object-top" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                  Sauna Sessions
                </h1>
                <p className="text-lg md:text-xl max-w-2xl">
                  Immerse yourself in the traditional sauna experience overlooking the pristine waters of Lough Hyne
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Steps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Select Date */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center text-emerald-800">
                  <CalendarIcon className="w-6 h-6 mr-3" />
                  Step 1: Choose Your Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                      className="rounded-lg border"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Available Every Day</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                        Two daily sessions available
                      </li>
                      <li className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-emerald-600" />
                        Maximum 6 guests per session
                      </li>
                      <li className="flex items-center">
                        <Thermometer className="w-4 h-4 mr-2 text-emerald-600" />
                        Traditional wood-fired sauna
                      </li>
                    </ul>
                    {selectedDate && (
                      <div className="bg-emerald-100 p-4 rounded-lg">
                        <p className="font-medium text-emerald-800">
                          Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Select Time */}
            <Card className={`border-2 ${selectedDate ? 'border-emerald-200' : 'border-gray-200 opacity-50'}`}>
              <CardHeader className={selectedDate ? "bg-emerald-50" : "bg-gray-50"}>
                <CardTitle className={`flex items-center ${selectedDate ? 'text-emerald-800' : 'text-gray-500'}`}>
                  <Clock className="w-6 h-6 mr-3" />
                  Step 2: Choose Your Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedDate ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableTimeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          selectedTime === slot.time
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-lg">{slot.label}</span>
                          <Badge variant="secondary">€{slot.price} total</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{slot.duration} private session</p>
                        <p className="text-xs text-emerald-600 mt-1">Private session for your group</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Please select a date first</p>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Guest Details */}
            <Card className={`border-2 ${selectedTime ? 'border-emerald-200' : 'border-gray-200 opacity-50'}`}>
              <CardHeader className={selectedTime ? "bg-emerald-50" : "bg-gray-50"}>
                <CardTitle className={`flex items-center ${selectedTime ? 'text-emerald-800' : 'text-gray-500'}`}>
                  <Users className="w-6 h-6 mr-3" />
                  Step 3: Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedTime ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guests">Number of Guests</Label>
                        <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Guest' : 'Guests'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="bg-emerald-100 p-3 rounded-lg w-full">
                          <p className="text-sm text-emerald-700">Total Price (Private Session)</p>
                          <p className="font-bold text-xl text-emerald-800">€{calculatePrice()}</p>
                          <p className="text-xs text-emerald-600">Flat rate for up to {guests} guests</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requests">Special Requests</Label>
                      <Textarea
                        id="requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requirements or requests..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Please select a time slot first</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Images */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="sticky top-8">
              <CardHeader className="bg-emerald-600 text-white">
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedDate && (
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">
                      {availableTimeSlots.find(slot => slot.time === selectedTime)?.label}
                    </p>
                  </div>
                )}
                {guests > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold">{guests} {guests === 1 ? 'person' : 'people'}</p>
                  </div>
                )}
                {selectedTime && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-xl text-emerald-600">€{calculatePrice()}</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleBookNow}
                  disabled={!selectedDate || !selectedTime || !customerName || !customerEmail || createPaymentMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  <Euro className="w-5 h-5 mr-2" />
                  {createPaymentMutation.isPending ? "Processing..." : "Book Now & Pay"}
                </Button>
              </CardContent>
            </Card>

            {/* Sauna Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">Sauna Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl overflow-hidden shadow-md bg-white">
                    <img 
                      src="https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-81-1.jpg" 
                      alt="Sauna exterior view" 
                      className="w-full h-32 object-cover" 
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-800">Exterior View</p>
                    </div>
                  </div>
                  
                  <div className="rounded-xl overflow-hidden shadow-md bg-white">
                    <img 
                      src="https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-.jpg" 
                      alt="Sauna relaxation area" 
                      className="w-full h-32 object-cover" 
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-800">Relaxation Area</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-800">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Thermometer, text: "Traditional wood-fired sauna" },
                  { icon: Droplets, text: "Fresh towels and robes" },
                  { icon: Leaf, text: "Natural birch whisks" },
                  { icon: Clock, text: "Full 1-hour private session" }
                ].map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-center">
                      <IconComponent className="text-emerald-600 mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
