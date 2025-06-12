import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import VoucherRedemption from "@/components/voucher-redemption";
import type { Experience } from "@shared/schema";

interface BookingFormProps {
  experience: Experience;
  onSuccess?: () => void;
}

interface BookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  duration: number;
  guests: number;
  specialRequests: string;
  breadExperience: string;
}

export default function BookingForm({ experience, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; amount: number } | null>(null);
  
  const [formData, setFormData] = useState<BookingData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    checkIn: undefined,
    checkOut: undefined,
    duration: 1,
    guests: 2,
    specialRequests: "",
    breadExperience: ""
  });

  // Fetch cabin bookings to determine unavailable dates
  const { data: cabinBookings = [] } = useQuery({
    queryKey: ["/api/bookings/public", "cabin"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings/public/cabin");
      return response.json();
    },
    enabled: experience.type === "cabin"
  });

  // Calculate disabled dates for cabin bookings
  const getDisabledDates = () => {
    if (experience.type !== "cabin") return [];
    
    const disabledDates: Date[] = [];
    
    cabinBookings.forEach((booking: any) => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = booking.checkOut ? parseISO(booking.checkOut) : checkIn;
      
      // Add all dates between check-in and check-out (inclusive of check-in, exclusive of check-out)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        disabledDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return disabledDates;
  };

  const disabledDates = getDisabledDates();

  const calculatePrice = () => {
    const basePrice = parseFloat(experience.basePrice);
    let totalPrice = 0;
    
    if (experience.type === "cabin" && checkInDate && checkOutDate) {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      totalPrice = basePrice * nights;
    } else if (experience.type === "sauna") {
      const hourlyRates: { [key: number]: number } = {
        1: 45,
        2: 85,
        4: 160, // half day
        8: 280  // full day
      };
      totalPrice = hourlyRates[formData.duration] || basePrice * formData.duration;
    } else {
      totalPrice = basePrice * formData.guests;
    }
    
    return totalPrice;
  };

  const getDiscountedPrice = () => {
    const originalPrice = calculatePrice();
    const discount = appliedVoucher?.amount || 0;
    return Math.max(0, originalPrice - discount);
  };

  const handleVoucherApplied = (voucherAmount: number, voucherCode: string) => {
    setAppliedVoucher({ amount: voucherAmount, code: voucherCode });
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(null);
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      
      // Auto-subscribe to yoga mailing list if booking yoga retreat
      if (data.type === "yoga") {
        try {
          await apiRequest("POST", "/api/auto-subscribe-yoga", {
            email: data.customerEmail,
            firstName: data.customerName.split(' ')[0],
            lastName: data.customerName.split(' ').slice(1).join(' ')
          });
        } catch (error) {
          console.log("Failed to auto-subscribe to yoga updates:", error);
          // Don't fail the booking if subscription fails
        }
      }
      
      return response;
    },
    onSuccess: () => {
      const subscriptionMessage = experience.type === "yoga" 
        ? " You've also been subscribed to receive updates about future yoga retreat dates."
        : "";
      
      toast({
        title: "Booking Confirmed!",
        description: `Your booking has been successfully submitted. We'll send you a confirmation email shortly.${subscriptionMessage}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (experience.type === "cabin" && (!checkInDate || !checkOutDate)) {
      toast({
        title: "Missing Dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (experience.type !== "cabin" && !checkInDate) {
      toast({
        title: "Missing Date",
        description: "Please select a date for your experience.",
        variant: "destructive",
      });
      return;
    }

    const originalPrice = calculatePrice();
    const finalPrice = getDiscountedPrice();
    
    const bookingData = {
      type: experience.type,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      checkIn: checkInDate!,
      checkOut: experience.type === "cabin" ? checkOutDate : undefined,
      duration: experience.type === "sauna" ? formData.duration : undefined,
      guests: formData.guests,
      totalPrice: finalPrice,
      originalPrice: originalPrice,
      voucherCode: appliedVoucher?.code,
      voucherDiscount: appliedVoucher?.amount || 0,
      specialRequests: experience.type === "bread" 
        ? `${formData.breadExperience ? `Bread Experience: ${formData.breadExperience}` : ''}${formData.breadExperience && formData.specialRequests ? '\n\n' : ''}${formData.specialRequests}`
        : formData.specialRequests,
      status: "pending"
    };

    bookingMutation.mutate(bookingData);
  };

  const handleChange = (field: keyof BookingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-forest">
          Book {experience.name}
        </CardTitle>
        <p className="text-gray-600">{experience.description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleChange("customerPhone", e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          {experience.type === "cabin" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : "Select check-in date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date);
                        handleChange("checkIn", date);
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date()) return true;
                        
                        // For cabin bookings, also disable dates that are already booked
                        if (experience.type === "cabin") {
                          return disabledDates.some(disabledDate => 
                            disabledDate.toDateString() === date.toDateString()
                          );
                        }
                        
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Select check-out date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => {
                        setCheckOutDate(date);
                        handleChange("checkOut", date);
                      }}
                      disabled={(date) => {
                        // Disable dates before check-in
                        if (date < (checkInDate || new Date())) return true;
                        
                        // For cabin bookings, also disable dates that are already booked
                        if (experience.type === "cabin") {
                          return disabledDates.some(disabledDate => 
                            disabledDate.toDateString() === date.toDateString()
                          );
                        }
                        
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <div>
              <Label>Experience Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select experience date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => {
                      setCheckInDate(date);
                      handleChange("checkIn", date);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {experience.type === "sauna" && (
            <div>
              <Label>Duration</Label>
              <Select value={formData.duration.toString()} onValueChange={(value) => handleChange("duration", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour - $45</SelectItem>
                  <SelectItem value="2">2 hours - $85</SelectItem>
                  <SelectItem value="4">Half day (4 hours) - $160</SelectItem>
                  <SelectItem value="8">Full day (8 hours) - $280</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Number of Guests</Label>
            <Select value={formData.guests.toString()} onValueChange={(value) => handleChange("guests", parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: experience.maxGuests || 6 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "guest" : "guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {experience.type === "bread" && (
            <div>
              <Label htmlFor="breadExperience">Bread Making Experience</Label>
              <Textarea
                id="breadExperience"
                value={formData.breadExperience}
                onChange={(e) => handleChange("breadExperience", e.target.value)}
                placeholder="What is your previous bread making experience and what are you hoping to get from your bread making day at Lough Hyne Cottage?"
                rows={4}
              />
            </div>
          )}

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              placeholder="Any special requests or dietary requirements?"
              rows={3}
            />
          </div>

          <VoucherRedemption
            totalAmount={calculatePrice()}
            onVoucherApplied={handleVoucherApplied}
            onVoucherRemoved={handleVoucherRemoved}
            appliedVoucher={appliedVoucher}
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            {appliedVoucher ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-600">€{calculatePrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Voucher Discount:</span>
                  <span className="text-sm text-green-600">-€{appliedVoucher.amount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-forest">Total Price:</span>
                  <span className="text-2xl font-bold text-terracotta">€{getDiscountedPrice().toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-forest">Total Price:</span>
                <span className="text-2xl font-bold text-terracotta">€{calculatePrice().toFixed(2)}</span>
              </div>
            )}
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
              "Confirm Booking"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
