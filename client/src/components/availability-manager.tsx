import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, addDays } from "date-fns";
import { CalendarIcon, Clock, Users, Plus, Trash2, ChevronDown, ChevronRight, Mail, Phone, User } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/dateUtils";

interface AvailabilitySlot {
  id?: number;
  experienceType: string;
  date: Date;
  availableSlots: number;
  bookedSlots: number;
  isBlocked: boolean;
}

interface Experience {
  id: number;
  type: string;
  name: string;
  maxGuests: number;
  duration: string;
}

interface BookingDetail {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
  status: string;
  paymentStatus: string;
  totalPrice: string;
  specialRequests?: string;
  checkIn: string;
  checkOut?: string;
  source: string;
  createdAt: string;
}

// Component to display booking details for a specific slot
function BookingDetailsPanel({ experienceType, date }: { experienceType: string; date: string }) {
  const { data: bookingDetails = [], isLoading } = useQuery<BookingDetail[]>({
    queryKey: ['/api/admin/bookings/by-availability', experienceType, date],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/bookings/by-availability?experienceType=${experienceType}&date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch booking details');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (bookingDetails.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No bookings found for this date.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Booking Details ({bookingDetails.length} {bookingDetails.length === 1 ? 'booking' : 'bookings'})
      </h4>
      {bookingDetails.map((booking) => (
        <div key={booking.id} className="bg-white p-3 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{booking.customerName}</span>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-3 h-3" />
                <span>{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{booking.customerPhone}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-gray-400" />
                <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                <Badge variant="outline" className="text-xs">
                  €{booking.totalPrice}
                </Badge>
              </div>
              <div className="text-gray-600">
                <span className="text-xs">Source: {booking.source}</span>
              </div>
              <div className="text-gray-600">
                <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'} className="text-xs">
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Special requests:</span> {booking.specialRequests}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AvailabilityManager() {
  const [selectedExperience, setSelectedExperience] = useState<string>("bread");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<number>(1);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
  });

  const { data: availability = [], refetch: refetchAvailability } = useQuery<AvailabilitySlot[]>({
    queryKey: ['/api/admin/availability', selectedExperience],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/availability?type=${selectedExperience}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json();
    },
    enabled: !!selectedExperience,
  });

  // Function to fetch booking details for a specific availability slot
  const fetchBookingDetails = async (availabilityId: number, experienceType: string, date: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`/api/admin/bookings/by-availability?availabilityId=${availabilityId}&experienceType=${experienceType}&date=${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch booking details');
    return response.json();
  };

  const toggleSlotExpansion = (slotId: number) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(slotId)) {
      newExpanded.delete(slotId);
    } else {
      newExpanded.add(slotId);
    }
    setExpandedSlots(newExpanded);
  };

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: Omit<AvailabilitySlot, 'id' | 'bookedSlots'>) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create availability');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Availability slot created successfully",
      });
      refetchAvailability();
      setSelectedDate(undefined);
      setAvailableSlots(1);
      setIsBlocked(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create availability slot",
        variant: "destructive",
      });
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AvailabilitySlot> }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/availability/${id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
      refetchAvailability();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/availability/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete availability');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Availability slot deleted successfully",
      });
      refetchAvailability();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      });
    }
  });

  const bulkCreateAvailabilityMutation = useMutation({
    mutationFn: async (data: { experienceType: string; startDate: Date; endDate: Date; availableSlots: number }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/availability/bulk", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create bulk availability');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bulk availability created successfully",
      });
      refetchAvailability();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bulk availability",
        variant: "destructive",
      });
    }
  });

  const createMonthlyBreadMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/availability/monthly-bread", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to create monthly bread availability');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetchAvailability();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create monthly bread availability",
        variant: "destructive",
      });
    }
  });

  const bulkDeleteAvailabilityMutation = useMutation({
    mutationFn: async (experienceType: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/availability/bulk/${experienceType}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to delete availability');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      if (data.errors && data.errors.length > 0) {
        console.warn('Some deletion errors occurred:', data.errors);
      }
      refetchAvailability();
    },
    onError: (error: Error) => {
      console.error('Bulk delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete availability",
        variant: "destructive",
      });
    }
  });

  const createDailySaunaMutation = useMutation({
    mutationFn: async (data: { startDate: Date; endDate: Date }) => {
      const response = await apiRequest("POST", "/api/admin/availability/daily-sauna", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetchAvailability();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create daily sauna availability",
        variant: "destructive",
      });
    }
  });

  const selectedExp = experiences.find(exp => exp.type === selectedExperience);
  const defaultSlots = selectedExp ? (
    selectedExp.type === 'bread' ? 8 :
    selectedExp.type === 'yoga' ? 20 :
    selectedExp.type === 'sauna' ? 6 : 1
  ) : 1;

  const handleCreateAvailability = () => {
    if (!selectedDate || !selectedExperience) {
      toast({
        title: "Missing Information",
        description: "Please select a date and experience type",
        variant: "destructive",
      });
      return;
    }

    createAvailabilityMutation.mutate({
      experienceType: selectedExperience,
      date: selectedDate,
      availableSlots: availableSlots || defaultSlots,
      isBlocked
    });
  };

  const handleBulkCreate = (startDate: Date, endDate: Date) => {
    if (!selectedExperience) return;

    bulkCreateAvailabilityMutation.mutate({
      experienceType: selectedExperience,
      startDate,
      endDate,
      availableSlots: defaultSlots
    });
  };

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.find((slot) => 
      format(new Date(slot.date), 'yyyy-MM-dd') === dateStr
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-800">Availability Management</h2>
      </div>

      <Tabs value={selectedExperience} onValueChange={setSelectedExperience}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bread">Bread Making</TabsTrigger>
          <TabsTrigger value="yoga">Yoga Retreats</TabsTrigger>
          <TabsTrigger value="sauna">Sauna Sessions</TabsTrigger>
        </TabsList>

        {['bread', 'yoga', 'sauna'].map((expType) => (
          <TabsContent key={expType} value={expType} className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="w-4 h-4" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < startOfDay(new Date())}
                    modifiers={{
                      available: availability
                        .filter(a => !a.isBlocked && a.availableSlots > a.bookedSlots)
                        .map(a => new Date(a.date)),
                      fullyBooked: availability
                        .filter(a => !a.isBlocked && a.bookedSlots >= a.availableSlots)
                        .map(a => new Date(a.date)),
                      blocked: availability
                        .filter(a => a.isBlocked)
                        .map(a => new Date(a.date))
                    }}
                    modifiersStyles={{
                      available: { 
                        backgroundColor: '#dcfce7', 
                        border: '1px solid #bbf7d0',
                        color: '#166534'
                      },
                      fullyBooked: { 
                        backgroundColor: '#fed7aa', 
                        border: '1px solid #fdba74',
                        color: '#c2410c'
                      },
                      blocked: { 
                        backgroundColor: '#fecaca', 
                        border: '1px solid #fca5a5',
                        color: '#dc2626'
                      }
                    }}
                    className="rounded-md border w-full"
                  />
                  <div className="text-xs text-gray-600">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-100 border border-green-200 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-100 border border-orange-200 rounded"></div>
                        <span>Full</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-100 border border-red-200 rounded"></div>
                        <span>Blocked</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slots">Available Slots</Label>
                    <Input
                      id="slots"
                      type="number"
                      min="1"
                      max={defaultSlots}
                      value={availableSlots || defaultSlots}
                      onChange={(e) => setAvailableSlots(parseInt(e.target.value))}
                      placeholder={`Max: ${defaultSlots}`}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="blocked"
                      type="checkbox"
                      checked={isBlocked}
                      onChange={(e) => setIsBlocked(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="blocked">Block this date</Label>
                  </div>

                  <Button 
                    onClick={handleCreateAvailability}
                    disabled={createAvailabilityMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createAvailabilityMutation.isPending ? "Adding..." : "Add Availability"}
                  </Button>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Quick Actions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkCreate(new Date(), addDays(new Date(), 30))}
                        disabled={bulkCreateAvailabilityMutation.isPending}
                      >
                        Next 30 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkCreate(new Date(), addDays(new Date(), 90))}
                        disabled={bulkCreateAvailabilityMutation.isPending}
                      >
                        Next 3 Months
                      </Button>
                    </div>
                    
                    {expType === 'bread' && (
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => createMonthlyBreadMutation.mutate()}
                          disabled={createMonthlyBreadMutation.isPending}
                          className="w-full"
                        >
                          {createMonthlyBreadMutation.isPending ? "Creating..." : "Create 2026 Monthly Schedule"}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">First Sunday of each month</p>
                      </div>
                    )}
                    
                    {expType === 'sauna' && (
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => createDailySaunaMutation.mutate({
                            startDate: new Date(),
                            endDate: addDays(new Date(), 365)
                          })}
                          disabled={createDailySaunaMutation.isPending}
                          className="w-full"
                        >
                          {createDailySaunaMutation.isPending ? "Creating..." : "Create Daily Sessions (7pm & 8pm)"}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">Next 365 days, every night</p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => bulkDeleteAvailabilityMutation.mutate(expType)}
                        disabled={bulkDeleteAvailabilityMutation.isPending}
                        className="w-full"
                      >
                        {bulkDeleteAvailabilityMutation.isPending ? "Clearing..." : `Clear All ${expType} Slots`}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Remove all availability for this experience</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Current Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availability.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No availability slots created yet</p>
                    ) : (
                      availability
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((slot: any) => {
                          const slotDate = new Date(slot.date);
                          const today = new Date();
                          const isFuture = slotDate >= today;
                          const isFullyBooked = slot.bookedSlots >= slot.availableSlots;
                          const hasAvailability = slot.availableSlots > slot.bookedSlots;
                          
                          // Determine card styling based on status
                          let cardClass = "flex items-center justify-between p-3 border rounded-lg transition-colors ";
                          let statusBadge = null;
                          
                          if (slot.isBlocked) {
                            cardClass += "border-red-200 bg-red-50";
                            statusBadge = <Badge variant="destructive" className="text-xs">Blocked</Badge>;
                          } else if (!isFuture) {
                            cardClass += "border-gray-200 bg-gray-50 opacity-75";
                            statusBadge = <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">Past</Badge>;
                          } else if (isFullyBooked) {
                            cardClass += "border-orange-200 bg-orange-50";
                            statusBadge = <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">Fully Booked</Badge>;
                          } else if (hasAvailability) {
                            cardClass += "border-green-200 bg-green-50";
                            statusBadge = <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">Available</Badge>;
                          } else {
                            cardClass += "border-gray-200 bg-white";
                          }
                          
                          return (
                            <Collapsible key={slot.id} open={expandedSlots.has(slot.id)}>
                              <div className={cardClass}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-medium">
                                      {format(new Date(slot.date), 'MMM dd, yyyy')}
                                    </div>
                                    {statusBadge}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-3 h-3" />
                                    <span>{slot.bookedSlots}/{slot.availableSlots} booked</span>
                                    {hasAvailability && isFuture && !slot.isBlocked && (
                                      <span className="text-green-600 font-medium">
                                        ({slot.availableSlots - slot.bookedSlots} slots left)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {slot.bookedSlots > 0 && (
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSlotExpansion(slot.id)}
                                      >
                                        {expandedSlots.has(slot.id) ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                        Details
                                      </Button>
                                    </CollapsibleTrigger>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateAvailabilityMutation.mutate({
                                      id: slot.id,
                                      data: { isBlocked: !slot.isBlocked }
                                    })}
                                    disabled={updateAvailabilityMutation.isPending}
                                  >
                                    {slot.isBlocked ? "Unblock" : "Block"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                                    disabled={deleteAvailabilityMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {expandedSlots.has(slot.id) && (
                                <CollapsibleContent className="mt-2">
                                  <BookingDetailsPanel 
                                    experienceType={selectedExperience}
                                    date={slot.date}
                                  />
                                </CollapsibleContent>
                              )}
                            </Collapsible>
                          );
                        })
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Status Legend:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                        <span>Available (Future)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
                        <span>Fully Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                        <span>Blocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded opacity-75"></div>
                        <span>Past Dates</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Future available dates show remaining slots. Green background indicates open bookings.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}