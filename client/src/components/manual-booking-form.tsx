import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ManualBookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  type: string;
  totalPrice: string;
  status: string;
  paymentStatus: string;
  specialRequests: string;
  source: string;
}

export default function ManualBookingForm() {
  const { toast } = useToast();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<ManualBookingData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    checkIn: undefined,
    checkOut: undefined,
    guests: 2,
    type: "cabin",
    totalPrice: "0",
    status: "confirmed",
    paymentStatus: "paid",
    specialRequests: "",
    source: "direct"
  });

  // Fetch cabin bookings to determine unavailable dates
  const { data: cabinBookings = [] } = useQuery({
    queryKey: ["/api/bookings/public", "cabin"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings/public/cabin");
      return response.json();
    }
  });

  // Calculate disabled dates for cabin bookings
  const getDisabledDates = () => {
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

  const handleChange = (field: keyof ManualBookingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Manual booking has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowForm(false);
      // Reset form
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        checkIn: undefined,
        checkOut: undefined,
        guests: 2,
        type: "cabin",
        totalPrice: "0",
        status: "confirmed",
        paymentStatus: "paid",
        specialRequests: "",
        source: "direct"
      });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...formData,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: parseFloat(formData.totalPrice).toString()
    };

    createBookingMutation.mutate(bookingData);
  };

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Manual Booking Creation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Create direct bookings for phone reservations, walk-ins, or other manual entries.
          </p>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Manual Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Guest Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Guest Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Enter guest full name"
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
                  placeholder="Enter guest email"
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
                placeholder="Enter guest phone number"
              />
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Booking Details</h3>
            
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
                        
                        // Disable dates that are already booked
                        return disabledDates.some(disabledDate => 
                          disabledDate.toDateString() === date.toDateString()
                        );
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
                        
                        // Disable dates that are already booked
                        return disabledDates.some(disabledDate => 
                          disabledDate.toDateString() === date.toDateString()
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Select value={formData.guests.toString()} onValueChange={(value) => handleChange("guests", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalPrice">Total Price (€)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalPrice}
                  onChange={(e) => handleChange("totalPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="status">Booking Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests / Notes</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleChange("specialRequests", e.target.value)}
                placeholder="Any special requests or internal notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="flex items-center gap-2"
            >
              {createBookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}