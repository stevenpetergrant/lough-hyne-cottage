import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Users, Clock, Euro, CreditCard, Loader2, Waves, TreePine, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { format, addDays, isAfter, isBefore, startOfDay, parseISO } from "date-fns";
import Navigation from "@/components/navigation";
import SEOHead from "@/components/seo-head";

// Import cottage images
import cabinExterior from "@assets/875e18f0-63ff-403a-96b2-00b46f716b15.jpg";
import cabinDeck from "@assets/20240828_112944.jpg";
import loughSunset from "@assets/299595f2-bc99-44f7-9ff6-b8e1841f403b.jpg";
import cabinInterior from "@assets/1fcdcbe1-8e25-4379-8348-5cf861dcb9a9.avif";
import cottageExterior from "@assets/3e6384b4-52b2-4806-a231-cfeac7f37ecd.avif";
import waterfrontViews from "@assets/7a9c92b2-d126-400f-80d1-e94fefe359df.avif";
import naturalSurroundings from "@assets/31d30d30-f0ad-4f30-948b-750ffef9b695.avif";
import deckOverlook from "@assets/47f2fc56-77da-4be3-ac46-28261dc0e195-1.avif";
import outdoorSpaces from "@assets/47f2fc56-77da-4be3-ac46-28261dc0e195.avif";
import cottageAmenities from "@assets/0065e263-1c66-4e24-ac8d-7e970e07c613.avif";
import interiorDesign from "@assets/564ffca7-24e6-4a46-b1c3-01594660fee4 (1).avif";
import livingSpaces from "@assets/952f61ad-3790-4119-9d33-e66172515cd5.avif";
import propertyFacilities from "@assets/40755218-51a7-4bac-8253-f0945d021716.avif";
import cabinComfort from "@assets/a9b87a9f-a157-4e44-81b2-4ad272b82ff6.avif";
import natureSurroundings from "@assets/b676476a-ceb8-4432-bf28-51f88ff4f9bd.avif";
import architecturalDetails from "@assets/ce5ac8e3-23d5-4aa9-9fcf-e0e13a896f0a.avif";
import scenicViews from "@assets/fc4dfcd6-c8fe-489e-a579-b1dd9cbb58fc.avif";
import cottageExperience from "@assets/fef784d5-721e-4814-939c-9d3ce871e60d.avif";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  specialRequests: string;
  experienceType: string;
  duration?: number;
  addOns: {
    saunaSession: boolean;
    breakfastBasket: boolean;
  };
}

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

function PaymentForm({ 
  totalPrice, 
  bookingData, 
  onSuccess 
}: { 
  totalPrice: number; 
  bookingData: any; 
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalPrice,
        bookingData
      });
      
      const { clientSecret } = await response.json();

      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
        }
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <Label className="text-sm font-medium mb-2 block">Card Details</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-3 text-lg font-semibold"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay €{totalPrice.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    checkIn: null,
    checkOut: null,
    guests: 1,
    specialRequests: "",
    experienceType: "cabin",
    duration: 1,
    addOns: {
      saunaSession: false,
      breakfastBasket: false,
    },
  });
  
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch experiences
  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  // Fetch availability for selected dates
  const { data: availability = [] } = useQuery({
    queryKey: ["/api/availability", formData.experienceType, formData.checkIn],
    enabled: !!formData.checkIn && !!formData.experienceType,
  });

  const selectedExperience = experiences.find(exp => exp.type === formData.experienceType);

  const calculatePrice = () => {
    if (!selectedExperience) return 0;
    
    const basePrice = parseFloat(selectedExperience.basePrice);
    let totalPrice = 0;
    
    if (formData.experienceType === "cabin" && formData.checkIn && formData.checkOut) {
      const nights = Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      totalPrice = basePrice * nights;
    } else if (formData.experienceType === "sauna" && formData.duration) {
      totalPrice = basePrice * formData.duration;
    } else {
      totalPrice = basePrice;
    }

    // Add-on pricing
    if (formData.addOns.saunaSession) {
      totalPrice += 70; // €70 for sauna session
    }
    if (formData.addOns.breakfastBasket) {
      totalPrice += 25; // €25 for breakfast basket
    }

    return totalPrice;
  };

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowPayment(true);
    },
    onError: () => {
      toast({
        title: "Booking Error",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.checkIn) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.experienceType === "cabin" && !formData.checkOut) {
      toast({
        title: "Missing Check-out Date",
        description: "Please select a check-out date for cabin bookings.",
        variant: "destructive",
      });
      return;
    }

    if (formData.experienceType === "cabin" && formData.checkIn && formData.checkOut) {
      const nights = Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights < 2) {
        toast({
          title: "Minimum Stay Required",
          description: "Cabin bookings require a minimum stay of 2 nights.",
          variant: "destructive",
        });
        return;
      }
    }

    const bookingData = {
      type: formData.experienceType,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      duration: formData.duration,
      guests: formData.guests,
      totalPrice: calculatePrice().toString(),
      specialRequests: formData.specialRequests,
      status: "pending",
      paymentStatus: "pending"
    };

    bookingMutation.mutate(bookingData);
  };

  const handleChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If changing dates, check if breakfast basket should be disabled
      if ((field === 'checkIn' || field === 'checkOut') && newData.addOns.breakfastBasket) {
        const checkIn = newData.checkIn;
        const checkOut = newData.checkOut;
        
        if (!checkIn || !checkOut) {
          // Clear breakfast basket if dates are incomplete
          newData.addOns.breakfastBasket = false;
        } else {
          // Check if new dates include Friday or Saturday nights
          let includesWeekendNight = false;
          for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) {
              includesWeekendNight = true;
              break;
            }
          }
          if (!includesWeekendNight) {
            newData.addOns.breakfastBasket = false;
          }
        }
      }
      
      return newData;
    });
  };

  const isDateUnavailable = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return true;
    
    // Check availability data here
    return false;
  };

  // Fetch real Airbnb booking data
  const { data: airbnbBookings = [] } = useQuery({
    queryKey: ["/api/airbnb-bookings"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isDateBooked = (date: Date): boolean => {
    if (!Array.isArray(airbnbBookings) || !airbnbBookings.length) return false;
    
    const checkDate = date.toISOString().split('T')[0];
    
    return airbnbBookings.some((booking: any) => {
      const startDate = booking.start;
      const endDate = booking.end;
      return checkDate >= startDate && checkDate < endDate;
    });
  };

  // Check if breakfast basket is available (only for stays that include Friday or Saturday nights)
  const isBreakfastBasketAvailable = () => {
    if (!formData.checkIn || !formData.checkOut) return false;
    
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    
    // Check each night of the stay
    for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
        return true;
      }
    }
    return false;
  };

  const getDateClassName = (date: Date) => {
    const today = startOfDay(new Date());
    
    if (isBefore(date, today)) {
      return "bg-gray-200 text-gray-400 cursor-not-allowed";
    }
    
    if (isDateBooked(date)) {
      return "bg-red-500 text-white cursor-not-allowed";
    }
    
    return "bg-green-500 text-white hover:bg-green-600";
  };

  const bookingStructuredData = {
    "@context": "https://schema.org",
    "@type": "ReservationPackage",
    "name": "Lough Hyne Cottage Booking",
    "description": "Book your stay at Lough Hyne Cottage - eco luxury accommodation in West Cork",
    "provider": {
      "@type": "LodgingBusiness",
      "name": "Lough Hyne Cottage",
      "url": "https://loughhynecottage.com"
    },
    "includesObject": [
      {
        "@type": "Accommodation",
        "name": "Eco Cabin",
        "amenityFeature": ["Sauna", "Yoga Classes", "Bread Making Workshop"]
      }
    ]
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-natural-white">
        <SEOHead
          title="Complete Booking - Lough Hyne Cottage"
          description="Complete your booking for eco luxury accommodation at Lough Hyne Cottage, West Cork. Secure payment and instant confirmation."
          keywords="book Lough Hyne Cottage, West Cork booking, eco accommodation payment"
          url="https://loughhynecottage.com/booking"
          structuredData={bookingStructuredData}
        />
        <Navigation />
        <div className="py-20">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-forest text-center">
                Complete Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-sage/10 rounded-lg">
                <h3 className="font-semibold text-forest mb-2">{selectedExperience?.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Guest: {formData.customerName}</p>
                  <p>Email: {formData.customerEmail}</p>
                  <p>Check-in: {formData.checkIn ? format(formData.checkIn, "PPP") : "N/A"}</p>
                  {formData.checkOut && <p>Check-out: {format(formData.checkOut, "PPP")}</p>}
                  <p>Guests: {formData.guests}</p>
                  <p className="font-semibold text-terracotta">Total: €{calculatePrice().toFixed(2)}</p>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  totalPrice={calculatePrice()}
                  bookingData={formData}
                  onSuccess={() => {
                    toast({
                      title: "Booking Confirmed",
                      description: "Your booking has been successfully confirmed!",
                    });
                    // Redirect or reset form
                  }}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Book Your Stay - Lough Hyne Cottage West Cork"
        description="Book eco luxury accommodation at Lough Hyne Cottage, Ireland's first marine nature reserve. Choose from cabin stays, sauna sessions, yoga retreats and bread making workshops."
        keywords="book West Cork accommodation, Lough Hyne cottage booking, eco cabin rental Ireland, sauna booking Cork, yoga retreat booking"
        url="https://loughhynecottage.com/booking"
        structuredData={bookingStructuredData}
      />
      <Navigation />
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-6">
              Book Your Stay
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-12">
              Choose your dates and experience the tranquility of Lough Hyne Cottage
            </p>

            {/* Cottage Details Section - Integrated Layout */}
            <div className="bg-cream rounded-2xl p-8 mb-12 text-left">
              <h2 className="font-heading text-3xl font-bold text-forest mb-8 text-center">
                A Contemporary Cabin on Nature's Doorstep
              </h2>
              
              {/* Introduction with hero image */}
              <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
                <div>
                  <p className="leading-relaxed text-gray-700 text-lg">
                    Nestled on the shores of Lough Hyne, our architecturally designed wood cabin combines the best of both worlds: nature and luxury. Built with local timber by skilled craftsmen, the cabin is cosy, bright and inspired by Danish Hygge principles. With heated concrete floors, a luxury double shower and plush Brooklin linens, we've created a space where you can relax, recharge and truly unwind.
                  </p>
                </div>
                <div className="rounded-xl shadow-lg overflow-hidden h-64 bg-sage/10 flex items-center justify-center">
                  <img 
                    src={interiorDesign}
                    alt="Interior design and furnishings"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Cosy Comfort section with images */}
              <div className="mb-10">
                <h3 className="font-semibold text-forest text-xl mb-4">Cosy Comfort with a View</h3>
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2">
                    <p className="leading-relaxed text-gray-700 mb-4">
                      The open-plan design features a folding double bed, perfect for stretching out after a day of exploring. Want more space? The mezzanine offers an ideal spot for reading or stargazing, with stunning views over Lough Hyne.
                    </p>
                    <p className="leading-relaxed text-gray-700">
                      When the weather's nice, the deck becomes your personal sanctuary—perfect for sipping coffee, reading a book or just soaking in the natural beauty.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg shadow-md overflow-hidden h-32 bg-sage/10">
                      <img 
                        src={cabinInterior}
                        alt="Cabin interior with mezzanine"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="rounded-lg shadow-md overflow-hidden h-32 bg-sage/10">
                      <img 
                        src={cabinDeck}
                        alt="Private cabin deck"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Life section with farm images */}
              <div className="mb-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg shadow-md overflow-hidden h-40 bg-sage/10">
                        <img 
                          src={cottageExterior}
                          alt="Cottage exterior and grounds"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="rounded-lg shadow-md overflow-hidden h-40 bg-sage/10">
                        <img 
                          src={naturalSurroundings}
                          alt="Farm and natural surroundings"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="font-semibold text-forest text-xl mb-4">A Taste of Local Life</h3>
                    <p className="leading-relaxed text-gray-700">
                      At Lough Hyne Cottage, we take food seriously. Every Sunday, we bake wood-fired sourdough for the local market, using organic ingredients and old-school baking techniques. We also grow fresh veggies for top local restaurants, so if you're into farm-to-table, you're in the right place. Feel free to wander around the farm and sample whatever's in season. On Saturdays, we offer a breakfast basket with fresh bread and pastries for just €20.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lough Experience with water views */}
              <div className="mb-10">
                <h3 className="font-semibold text-forest text-xl mb-4">The Lough Experience</h3>
                <div className="grid lg:grid-cols-5 gap-6 items-center">
                  <div className="lg:col-span-3">
                    <p className="leading-relaxed text-gray-700 mb-4">
                      Step outside, and you're just 50 metres from the Lough itself, where you can take a refreshing swim in Europe's only saltwater lake. In the colder months, the outdoor wood-fired bath is perfect for warming up and stargazing.
                    </p>
                    <p className="leading-relaxed text-gray-700">
                      In winter, the cottage becomes a snug retreat, ideal for romantic getaways or quiet weekends spent reading, relaxing and enjoying the quiet.
                    </p>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="rounded-lg shadow-md overflow-hidden h-40 bg-sage/10">
                      <img 
                        src={loughSunset}
                        alt="Sunset over Lough Hyne"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="rounded-lg shadow-md overflow-hidden h-40 bg-sage/10">
                      <img 
                        src={waterfrontViews}
                        alt="Lough Hyne waterfront"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* West Cork and Year-Round sections with remaining images */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-forest text-xl mb-4">West Cork</h3>
                  <p className="leading-relaxed text-gray-700 mb-4">
                    Lough Hyne is situated in the heart of West Cork, known for its culinary scene and bohemian charm. With festivals, food markets and plenty of artistic energy, there's always something to explore.
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    But honestly, some of the best days are spent just soaking in the scenery, sipping coffee and enjoying the simple pleasures of life.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-forest text-xl mb-4">Year-Round Bliss</h3>
                  <p className="leading-relaxed text-gray-700">
                    Whether it's summer swims in the Lough or winter nights by the outdoor bath, Lough Hyne Cottage offers a peaceful escape all year long. We've created a space where you can slow down and enjoy nature at its best. We can't wait to share it with you!
                  </p>
                </div>
              </div>

              {/* Remaining images gallery */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={deckOverlook}
                    alt="Deck overlooking Lough Hyne"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={outdoorSpaces}
                    alt="Outdoor spaces"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={cottageAmenities}
                    alt="Cottage amenities"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={cabinExterior}
                    alt="Cabin exterior"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={livingSpaces}
                    alt="Living spaces"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={propertyFacilities}
                    alt="Property facilities"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={cabinComfort}
                    alt="Cabin comfort"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={natureSurroundings}
                    alt="Nature surroundings"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={architecturalDetails}
                    alt="Architectural details"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={scenicViews}
                    alt="Scenic views"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-2 rounded-lg shadow-md overflow-hidden h-24 bg-sage/10">
                  <img 
                    src={cottageExperience}
                    alt="Cottage experience"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* What's Included section */}
              <div className="pt-8 border-t border-sage/20">
                <h3 className="font-heading text-xl font-semibold text-forest mb-6 text-center">What's Included</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-sage/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Waves className="h-8 w-8 text-sage" />
                    </div>
                    <h4 className="font-medium text-forest mb-2">Wood-Fired Bathtub</h4>
                    <p className="text-sm text-gray-600">Private outdoor bathing under the stars with views of the lough</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-sage/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <TreePine className="h-8 w-8 text-sage" />
                    </div>
                    <h4 className="font-medium text-forest mb-2">Nature Access</h4>
                    <p className="text-sm text-gray-600">Direct access to Ireland's first marine nature reserve and woodlands</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-sage/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Leaf className="h-8 w-8 text-sage" />
                    </div>
                    <h4 className="font-medium text-forest mb-2">Sustainable Comfort</h4>
                    <p className="text-sm text-gray-600">Eco-friendly materials, solar power, and locally-sourced furnishings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Booking Form */}
            <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-forest">
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Accommodation Selection */}
                <div>
                  <Label htmlFor="experienceType">Accommodation Type *</Label>
                  <Select value={formData.experienceType} onValueChange={(value) => handleChange("experienceType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      {experiences
                        .filter(exp => exp.type === "cabin")
                        .map((exp) => (
                        <SelectItem key={exp.id} value={exp.type}>
                          Cabin at Lough Hyne Cottage w/ woodfired bathtub - €{exp.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  {/* Availability Legend */}
                  <div className="bg-cream p-4 rounded-lg">
                    <h4 className="font-semibold text-forest mb-3">Date Availability Guide</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Available dates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Booked dates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <span>Past dates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-terracotta rounded"></div>
                        <span>Selected dates</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection - Horizontal Layout */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-4">
                      <Label className="text-lg font-semibold text-forest">Check-in Date *</Label>
                      {formData.experienceType === "cabin" && (
                        <Label className="text-lg font-semibold text-forest">Check-out Date *</Label>
                      )}
                    </div>
                    
                    <div className={`grid gap-6 ${formData.experienceType === "cabin" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-md mx-auto"}`}>
                      <div className="flex flex-col items-center">
                        <Calendar
                          mode="single"
                          selected={formData.checkIn || undefined}
                          onSelect={(date) => handleChange("checkIn", date)}
                          disabled={(date) => isDateUnavailable(date) || isDateBooked(date)}
                          className="rounded-md border bg-white shadow-sm"
                          modifiers={{
                            available: (date) => !isDateUnavailable(date) && !isDateBooked(date),
                            booked: isDateBooked,
                            past: (date) => isBefore(date, startOfDay(new Date()))
                          }}
                          modifiersClassNames={{
                            available: "bg-green-500 text-white hover:bg-green-600",
                            booked: "bg-red-500 text-white cursor-not-allowed",
                            past: "bg-gray-200 text-gray-400 cursor-not-allowed",
                            selected: "bg-terracotta text-white hover:bg-terracotta/90"
                          }}
                          classNames={{
                            day_selected: "bg-terracotta text-white hover:bg-terracotta/90",
                            day_today: "border-2 border-sage font-semibold"
                          }}
                        />
                      </div>
                      
                      {formData.experienceType === "cabin" && (
                        <div className="flex flex-col items-center">
                          <Calendar
                            mode="single"
                            selected={formData.checkOut || undefined}
                            onSelect={(date) => handleChange("checkOut", date)}
                            disabled={(date) => 
                              isDateUnavailable(date) || 
                              isDateBooked(date) ||
                              !formData.checkIn || 
                              !isAfter(date, addDays(formData.checkIn, 1)) // Minimum 2 nights
                            }
                            className="rounded-md border bg-white shadow-sm"
                            modifiers={{
                              available: (date) => !isDateUnavailable(date) && !isDateBooked(date) && !!formData.checkIn && isAfter(date, addDays(formData.checkIn, 1)),
                              booked: isDateBooked,
                              past: (date) => isBefore(date, startOfDay(new Date()))
                            }}
                            modifiersClassNames={{
                              available: "bg-green-500 text-white hover:bg-green-600",
                              booked: "bg-red-500 text-white cursor-not-allowed",
                              past: "bg-gray-200 text-gray-400 cursor-not-allowed",
                              selected: "bg-terracotta text-white hover:bg-terracotta/90"
                            }}
                            classNames={{
                              day_selected: "bg-terracotta text-white hover:bg-terracotta/90",
                              day_today: "border-2 border-sage font-semibold"
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {formData.experienceType === "cabin" && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <strong>Note:</strong> Cabin bookings require a minimum stay of 2 nights. Check-out must be at least 2 days after check-in.
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleChange("customerName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleChange("customerEmail", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange("customerPhone", e.target.value)}
                  />
                </div>

                {/* Guests and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Select value={formData.guests.toString()} onValueChange={(value) => handleChange("guests", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: selectedExperience?.maxGuests || 8 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "Guest" : "Guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.experienceType === "sauna" && (
                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Select value={formData.duration?.toString()} onValueChange={(value) => handleChange("duration", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour} {hour === 1 ? "Hour" : "Hours"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Add-On Options */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-forest">Enhance Your Stay</Label>
                  
                  <div className="space-y-3 bg-sage/5 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="saunaSession"
                        checked={formData.addOns.saunaSession}
                        onCheckedChange={(checked) => 
                          handleChange("addOns", {
                            ...formData.addOns,
                            saunaSession: checked === true
                          })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="saunaSession" className="text-base font-medium cursor-pointer">
                          Sauna Session
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          1-hour authentic sauna experience with eucalyptus aromatherapy
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-terracotta">€70</span>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="breakfastBasket"
                        checked={formData.addOns.breakfastBasket}
                        disabled={!isBreakfastBasketAvailable()}
                        onCheckedChange={(checked) => 
                          handleChange("addOns", {
                            ...formData.addOns,
                            breakfastBasket: checked === true
                          })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="breakfastBasket" className={`text-base font-medium cursor-pointer ${!isBreakfastBasketAvailable() ? 'text-gray-400' : ''}`}>
                          Morning Breakfast Basket {!isBreakfastBasketAvailable() ? '(Only available on Saturdays)' : '(Saturday only)'}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Fresh artisan breads and local produce from Lough Hyne Bakery - delivered on Saturday mornings
                        </p>
                      </div>
                      <span className={`text-lg font-semibold ${!isBreakfastBasketAvailable() ? 'text-gray-400' : 'text-terracotta'}`}>€25</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleChange("specialRequests", e.target.value)}
                    placeholder="Any special requests or dietary requirements..."
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-sage/10 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-forest">
                      {selectedExperience?.name} 
                      {formData.experienceType === "cabin" && formData.checkIn && formData.checkOut 
                        ? ` (${Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights)`
                        : formData.experienceType === "sauna" && formData.duration 
                        ? ` (${formData.duration} hours)`
                        : ""
                      }
                    </span>
                    <span className="font-semibold">
                      €{selectedExperience ? (
                        formData.experienceType === "cabin" && formData.checkIn && formData.checkOut
                          ? (parseFloat(selectedExperience.basePrice) * Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)
                          : formData.experienceType === "sauna" && formData.duration
                          ? (parseFloat(selectedExperience.basePrice) * formData.duration).toFixed(2)
                          : selectedExperience.basePrice
                      ) : "0.00"}
                    </span>
                  </div>

                  {formData.addOns.saunaSession && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Finnish Sauna Session</span>
                      <span>€70.00</span>
                    </div>
                  )}

                  {formData.addOns.breakfastBasket && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Morning Breakfast Basket</span>
                      <span>€25.00</span>
                    </div>
                  )}

                  {(formData.addOns.saunaSession || formData.addOns.breakfastBasket) && (
                    <Separator />
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-forest">Total Price:</span>
                    <span className="text-2xl font-bold text-terracotta">€{calculatePrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-forest text-white hover:bg-forest/90 py-3 text-lg font-semibold"
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}