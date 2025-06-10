import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";

interface SaunaSlot {
  dateTime: string;
  label: string;
  available: boolean;
}

interface SaunaAvailability {
  availableSlots: SaunaSlot[];
  alreadyBooked: boolean;
}

export default function SaunaAddonBooking() {
  const { toast } = useToast();
  const [bookingId, setBookingId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Get booking ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('booking');
    if (id) {
      setBookingId(id);
    }
  }, []);

  const { data: availability, isLoading, error } = useQuery<SaunaAvailability>({
    queryKey: ['/api/cabin-sauna-availability', bookingId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/cabin-sauna-availability/${bookingId}`);
      return response.json();
    },
    enabled: !!bookingId,
  });

  const bookSaunaMutation = useMutation({
    mutationFn: async (selectedDateTime: string) => {
      const response = await apiRequest("POST", "/api/book-included-sauna", {
        cabinBookingId: parseInt(bookingId),
        selectedDateTime
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sauna Session Booked!",
        description: `Your sauna session has been confirmed for ${new Date(data.dateTime).toLocaleString()}`,
      });
      // Refresh availability data
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book sauna session",
        variant: "destructive",
      });
    }
  });

  const handleBookSlot = () => {
    if (!selectedSlot) {
      toast({
        title: "Please Select a Time",
        description: "Choose your preferred sauna session time",
        variant: "destructive",
      });
      return;
    }
    bookSaunaMutation.mutate(selectedSlot);
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Invalid Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                This page requires a valid booking reference. Please check your confirmation email for the correct link.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your sauna availability...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Access Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Unable to access sauna booking for this reservation. Please ensure you have a valid cabin booking with sauna add-on.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book Your Sauna Session
            </h1>
            <p className="text-xl text-gray-600">
              Select your preferred time for the included sauna experience
            </p>
          </div>

          {availability.alreadyBooked ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600 flex items-center gap-2 justify-center">
                  <Check className="w-5 h-5" />
                  Sauna Session Already Booked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  You have already reserved your sauna session for this stay. Check your email for the confirmation details.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Available Time Slots
                </CardTitle>
                <CardDescription>
                  Choose from the available sauna sessions during your cabin stay. Each session lasts 1 hour.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-600">
                      No sauna slots are currently available during your stay. Please contact us if you'd like to arrange an alternative time.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3">
                      {availability.availableSlots.map((slot) => (
                        <div
                          key={slot.dateTime}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedSlot === slot.dateTime
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                          }`}
                          onClick={() => setSelectedSlot(slot.dateTime)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{slot.label}</span>
                            </div>
                            <Badge variant={slot.available ? "default" : "secondary"}>
                              {slot.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">What's Included</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• 1-hour private sauna session</li>
                          <li>• Fresh towels and robes</li>
                          <li>• Complimentary herbal tea</li>
                          <li>• Access to outdoor cooling area</li>
                        </ul>
                      </div>

                      <Button 
                        onClick={handleBookSlot}
                        disabled={!selectedSlot || bookSaunaMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {bookSaunaMutation.isPending ? (
                          "Booking Your Session..."
                        ) : (
                          "Confirm Sauna Booking"
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        This sauna session is included with your cabin booking at no additional charge.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}