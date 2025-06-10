import { useState } from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, MapPin, Utensils, Zap, Euro } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AvailabilitySlot {
  id: number;
  experienceType: string;
  date: string;
  availableSlots: number;
  bookedSlots: number;
  isBlocked: boolean;
}

interface BookingSelection {
  selectedDate: string;
  guests: number;
}

export default function EventsExperiences() {
  const [bookingSelections, setBookingSelections] = useState<{[key: string]: BookingSelection}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: breadAvailability = [] } = useQuery<AvailabilitySlot[]>({
    queryKey: ['/api/admin/availability', 'bread'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/availability/bread");
      return response.json();
    }
  });

  const { data: yogaAvailability = [] } = useQuery<AvailabilitySlot[]>({
    queryKey: ['/api/admin/availability', 'yoga'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/availability/yoga");
      return response.json();
    }
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/create-experience-payment", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate availability cache to refresh spot counts
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

  const getAvailableSlots = (experienceType: string) => {
    const availability = experienceType === 'bread' ? breadAvailability : yogaAvailability;
    return availability.filter(slot => 
      !slot.isBlocked && 
      slot.availableSlots > slot.bookedSlots &&
      new Date(slot.date) > new Date()
    );
  };

  const handleBookingSelectionChange = (experienceType: string, field: string, value: string | number) => {
    setBookingSelections(prev => ({
      ...prev,
      [experienceType]: {
        ...prev[experienceType],
        [field]: value
      }
    }));
  };

  const handleBookExperience = (experience: any) => {
    const selection = bookingSelections[experience.bookingType];
    
    if (!selection?.selectedDate || !selection?.guests) {
      toast({
        title: "Missing Information",
        description: "Please select a date and number of guests",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = parseFloat(experience.price.replace('€', '')) * selection.guests;

    // Store booking details for payment page
    const bookingDetails = {
      experienceName: experience.title,
      description: experience.description,
      experienceType: experience.bookingType,
      date: selection.selectedDate,
      guests: selection.guests,
      totalPrice: totalPrice.toFixed(2)
    };
    
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

    createPaymentMutation.mutate({
      experienceId: experience.id,
      experienceType: experience.bookingType,
      date: selection.selectedDate,
      guests: selection.guests,
      totalPrice,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      specialRequests: ""
    });
  };

  const experiences = [
    {
      id: 1,
      title: "Wood-Fired Bread Making Workshop",
      description: "Join us monthly as we fire up our traditional wood stove to create artisanal bread and pastries. Learn the ancient art of sourdough baking while connecting with our local community.",
      duration: "11 am - 5pm",
      capacity: "8 people max",
      frequency: "Monthly",
      price: "€135",
      bookingType: "bread",
      highlights: [
        "A delicious vegetarian lunch made with organic, fresh, local ingredients",
        "Organic/Fair Trade tea and coffee served throughout the day",
        "Fresh sourdough starter to bring home with you",
        "A selection of breads you have baked yourself to bring home with you"
      ],
      icon: <Utensils className="w-6 h-6" />,
      imageUrl: "https://loughhynecottage.com/wp-content/uploads/2024/08/bread-course-4-1.jpg"
    },
    {
      id: 2,
      title: "Monthly Yoga Mini-Retreats",
      description: "Immerse yourself in tranquil yoga sessions surrounded by the natural beauty of Lough Hyne. Combined with hyper-local, veggie-filled meals inspired by California meets West Cork cuisine.",
      duration: "Full Day",
      capacity: "20 people max",
      frequency: "Monthly",
      price: "€80",
      bookingType: "yoga",
      highlights: ["Peaceful natural setting", "California-West Cork fusion meals", "All levels welcome"],
      icon: <Zap className="w-6 h-6" />,
      imageUrl: "https://loughhynecottage.com/wp-content/uploads/2024/08/yoga-3-1.jpg"
    },
    {
      id: 3,
      title: "Sauna Sessions",
      description: "Experience authentic Finnish sauna culture in our traditional wood-fired sauna. Relax, rejuvenate, and connect with nature in this timeless wellness practice.",
      duration: "1-2 Hours",
      capacity: "6 people max",
      frequency: "By Appointment",
      price: "€70",
      bookingType: "sauna",
      highlights: ["Wood-fired experience", "Natural setting", "Wellness focused"],
      icon: <Zap className="w-6 h-6" />,
      imageUrl: "https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-8.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-natural-white">
      <Navigation />
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-4">
              Events & Experiences
            </h1>
            <h2 className="text-2xl md:text-3xl text-terracotta font-semibold mb-6">
              Food, Fun and a Little Magic
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              From baking bread in our wood-fired oven to unwinding at a mini retreat, we're here to share the good stuff with our select retreats, courses and experiences.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-16">
            {experiences.map((experience) => (
              <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={experience.imageUrl} 
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="font-heading text-xl text-forest">
                      {experience.title}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-sage/20 text-forest">
                      {experience.price}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{experience.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {experience.duration}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {experience.capacity}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {experience.frequency}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lough Hyne
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-forest mb-2">What's Included:</h4>
                    <ul className="space-y-1">
                      {experience.highlights.map((highlight, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-sage rounded-full mr-2"></span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Add divider line for sauna sessions only */}
                  {experience.bookingType === 'sauna' && (
                    <div className="border-t border-gray-200"></div>
                  )}
                  
                  {/* Inline booking for bread and yoga, separate page for sauna */}
                  {(experience.bookingType === 'bread' || experience.bookingType === 'yoga') ? (
                    <div className="space-y-3">
                      {/* Date Selection */}
                      <div>
                        <Label className="text-sm font-medium">Select Date</Label>
                        <Select 
                          value={bookingSelections[experience.bookingType]?.selectedDate || ""} 
                          onValueChange={(value) => handleBookingSelectionChange(experience.bookingType, 'selectedDate', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose available date" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSlots(experience.bookingType).map((slot) => (
                              <SelectItem key={slot.id} value={slot.date}>
                                {format(new Date(slot.date), 'MMM dd, yyyy')} 
                                <span className="text-gray-500 ml-2">
                                  ({slot.availableSlots - slot.bookedSlots} spots left)
                                </span>
                              </SelectItem>
                            ))}
                            {getAvailableSlots(experience.bookingType).length === 0 && (
                              <SelectItem value="no-dates" disabled>
                                No dates available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Guest Count */}
                      <div>
                        <Label className="text-sm font-medium">Number of Guests</Label>
                        <Select 
                          value={bookingSelections[experience.bookingType]?.guests?.toString() || ""} 
                          onValueChange={(value) => handleBookingSelectionChange(experience.bookingType, 'guests', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select guests" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: experience.bookingType === 'bread' ? 8 : 20 }, (_, i) => i + 1).map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Guest' : 'Guests'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Display */}
                      {bookingSelections[experience.bookingType]?.guests && (
                        <div className="bg-sage/10 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Price:</span>
                            <span className="font-semibold text-forest">
                              €{(parseFloat(experience.price.replace('€', '')) * bookingSelections[experience.bookingType].guests).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={() => handleBookExperience(experience)}
                        disabled={!bookingSelections[experience.bookingType]?.selectedDate || !bookingSelections[experience.bookingType]?.guests || createPaymentMutation.isPending}
                        className="w-full bg-forest text-white hover:bg-forest/80"
                      >
                        <Euro className="w-4 h-4 mr-2" />
                        {createPaymentMutation.isPending ? "Processing..." : "Book Experience"}
                      </Button>
                    </div>
                  ) : (
                    <a href={`/book/${experience.bookingType}`}>
                      <Button 
                        className="w-full bg-forest text-white hover:bg-forest/80"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Experience
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-sage/10 rounded-lg p-8 text-center">
            <h3 className="font-heading text-2xl font-semibold text-forest mb-4">
              Join Our Community
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Each week at the local market, we share our fresh bread and pastries with the community. 
              We're part of a thriving artisan and artistic community that welcomes visitors with open arms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-forest text-white hover:bg-forest/80"
                onClick={() => window.location.href = '/booking'}
              >
                Book Your Stay
              </Button>
              <Button 
                variant="outline" 
                className="border-forest text-forest hover:bg-forest/10"
                onClick={() => window.location.href = '/our-story'}
              >
                Learn Our Story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}