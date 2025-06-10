import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, RefreshCw, ExternalLink, Settings, LogIn, Shield, LogOut, Home, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import AvailabilityManager from "@/components/availability-manager";
import MailingListManager from "@/components/mailing-list-manager";
import GuestStoryApprovalManager from "@/components/guest-story-approval-manager";
import ManualBookingForm from "@/components/manual-booking-form";

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  checkIn: string;
  checkOut: string | null;
  guests: number;
  type: string;
  totalPrice: string;
  status: string;
  source: string;
  airbnbUid?: string;
  emailsSent?: Array<{
    emailType: string;
    timestamp: string;
    recipients: {
      customer: string;
      staff: string;
      cc: string;
    };
  }>;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [syncingAirbnb, setSyncingAirbnb] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token with server
      fetch('/api/admin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
      setPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const { data: bookings = [], isLoading: dataLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
  });

  const syncAirbnbMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync-airbnb");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Synced ${data.newBookings} new bookings from Airbnb`,
      });
      refetch();
      setSyncingAirbnb(false);
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Could not sync Airbnb calendar. Please try again.",
        variant: "destructive",
      });
      setSyncingAirbnb(false);
    },
  });

  const runAutomatedEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/run-automated-emails");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email Check Complete",
        description: `Sent ${data.preArrivalSent} pre-arrival and ${data.thankYouSent} thank you emails`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Email Check Failed",
        description: "Failed to run automated email check",
        variant: "destructive",
      });
    },
  });

  const downloadCalendar = async () => {
    try {
      const response = await fetch("/api/calendar/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lough-hyne-cottage-bookings.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Calendar Downloaded",
        description: "Calendar file ready for Airbnb import",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download calendar file",
        variant: "destructive",
      });
    }
  };

  const cabinBookings = bookings.filter(b => b.type === "cabin");
  const experienceBookings = bookings.filter(b => b.type !== "cabin");
  const airbnbBookings = bookings.filter(b => b.source === "airbnb");
  const directBookings = bookings.filter(b => b.source === "direct");
  
  // Separate cabin and experience bookings by source
  const directCabinBookings = cabinBookings.filter(b => b.source === "direct");
  const airbnbCabinBookings = cabinBookings.filter(b => b.source === "airbnb");
  const directExperienceBookings = experienceBookings.filter(b => b.source === "direct");
  const airbnbExperienceBookings = experienceBookings.filter(b => b.source === "airbnb");

  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date, startDate: string, endDate: string | null) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    
    return checkDate >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
           checkDate <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  };

  const getBookingForDate = (date: Date) => {
    return bookings.find(booking => {
      if (booking.type !== "cabin") return false;
      return isDateInRange(date, booking.checkIn, booking.checkOut);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const days = [];
    const today = new Date();
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const booking = getBookingForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      
      let cellClass = "h-24 p-1 border border-gray-200 transition-colors duration-200 ";
      let contentClass = "h-full p-2 rounded text-xs ";
      
      if (isToday) {
        cellClass += "ring-2 ring-blue-400 ";
      }
      
      if (booking) {
        if (booking.source === "airbnb") {
          contentClass += "bg-orange-100 border border-orange-300 text-orange-800 ";
        } else {
          contentClass += "bg-green-100 border border-green-300 text-green-800 ";
        }
      } else {
        contentClass += "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 ";
      }
      
      days.push(
        <div key={day} className={cellClass}>
          <div className={contentClass}>
            <div className="font-semibold mb-1">{day}</div>
            {booking && (
              <div className="space-y-1">
                <div className="font-medium truncate">{booking.customerName}</div>
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${booking.source === "airbnb" ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-green-50 text-green-700 border-green-300"}`}
                >
                  {booking.source === "airbnb" ? "Airbnb" : "Direct"}
                </Badge>
                <div className="text-xs text-gray-600">
                  {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <h3 className="text-xl font-semibold text-gray-800">{monthYear}</h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Direct Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Airbnb Booking</span>
          </div>
        </div>
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center font-semibold text-gray-600 bg-gray-100 border border-gray-200">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {days}
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-green-700 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800">Verifying Access...</h2>
          <p className="text-gray-600">Please wait while we check your credentials</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-green-700 mb-4" />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your password to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-green-700 hover:bg-green-800 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loginLoading ? "Signing In..." : "Sign In"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-center flex-1 space-y-4">
              <h1 className="text-4xl font-bold text-green-800">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Manage bookings, availability, and Airbnb calendar sync</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="cabin" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="cabin" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 text-xs sm:text-sm">
                <Home className="w-4 h-4" />
                <span className="text-center">Cabin Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="experiences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 text-xs sm:text-sm">
                <Settings className="w-4 h-4" />
                <span className="text-center">Experiences</span>
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 text-xs sm:text-sm">
                <Settings className="w-4 h-4" />
                <span className="text-center">Availability</span>
              </TabsTrigger>
              <TabsTrigger value="guest-stories" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-center">Guest Stories</span>
              </TabsTrigger>
              <TabsTrigger value="mailing" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-center">Mailing List</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cabin" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Cabin Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cabinBookings.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Direct Cabin Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{directCabinBookings.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Airbnb Cabin Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{airbnbCabinBookings.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cabin Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      €{cabinBookings.reduce((total, booking) => total + parseFloat(booking.totalPrice), 0).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Manual Booking Creation */}
              <ManualBookingForm />

              {/* Calendar View within Cabin Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Cabin Booking Calendar
                  </CardTitle>
                  <CardDescription>
                    Visual overview of cabin availability and bookings. Green shows direct bookings, orange shows Airbnb bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCalendar()}
                </CardContent>
              </Card>

              {/* Current Month Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bookings:</span>
                        <span className="font-semibold">{cabinBookings.filter(b => {
                          const bookingMonth = new Date(b.checkIn).getMonth();
                          const bookingYear = new Date(b.checkIn).getFullYear();
                          return bookingMonth === currentMonth.getMonth() && bookingYear === currentMonth.getFullYear();
                        }).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Direct Bookings:</span>
                        <span className="font-semibold text-green-600">{cabinBookings.filter(b => {
                          const bookingMonth = new Date(b.checkIn).getMonth();
                          const bookingYear = new Date(b.checkIn).getFullYear();
                          return b.source === "direct" && bookingMonth === currentMonth.getMonth() && bookingYear === currentMonth.getFullYear();
                        }).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Airbnb Bookings:</span>
                        <span className="font-semibold text-orange-600">{cabinBookings.filter(b => {
                          const bookingMonth = new Date(b.checkIn).getMonth();
                          const bookingYear = new Date(b.checkIn).getFullYear();
                          return b.source === "airbnb" && bookingMonth === currentMonth.getMonth() && bookingYear === currentMonth.getFullYear();
                        }).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Occupancy Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((cabinBookings.filter(b => {
                          const bookingMonth = new Date(b.checkIn).getMonth();
                          const bookingYear = new Date(b.checkIn).getFullYear();
                          return bookingMonth === currentMonth.getMonth() && bookingYear === currentMonth.getFullYear();
                        }).reduce((acc, booking) => {
                          const checkIn = new Date(booking.checkIn);
                          const checkOut = booking.checkOut ? new Date(booking.checkOut) : new Date(booking.checkIn);
                          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                          return acc + Math.max(1, nights);
                        }, 0) / getDaysInMonth(currentMonth)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on booked nights this month
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Revenue Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        €{cabinBookings.filter(b => {
                          const bookingMonth = new Date(b.checkIn).getMonth();
                          const bookingYear = new Date(b.checkIn).getFullYear();
                          return bookingMonth === currentMonth.getMonth() && bookingYear === currentMonth.getFullYear();
                        }).reduce((total, booking) => total + parseFloat(booking.totalPrice), 0).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total confirmed bookings
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Airbnb Sync Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Airbnb Calendar Sync
                  </CardTitle>
                  <CardDescription>
                    Keep your bookings synchronized with Airbnb. Sync pulls new bookings from Airbnb, 
                    while export creates a calendar file to upload to Airbnb.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => {
                        setSyncingAirbnb(true);
                        syncAirbnbMutation.mutate();
                      }}
                      disabled={syncingAirbnb}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingAirbnb ? 'animate-spin' : ''}`} />
                      {syncingAirbnb ? 'Syncing...' : 'Sync from Airbnb'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={downloadCalendar}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Calendar
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Sync from Airbnb:</strong> Imports new bookings from your Airbnb calendar</p>
                    <p><strong>Export Calendar:</strong> Downloads .ics file to upload to Airbnb calendar settings</p>
                    <p className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <a 
                        href="https://www.airbnb.com/hosting/calendars" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Manage Airbnb Calendar
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest cabin bookings from all sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatDate(booking.checkIn)}</span>
                              {booking.checkOut && (
                                <>
                                  <span>→</span>
                                  <span>{formatDate(booking.checkOut)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-medium">€{booking.totalPrice}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={booking.source === "airbnb" ? "default" : "secondary"}>
                                {booking.source === "airbnb" ? "Airbnb" : "Direct"}
                              </Badge>
                              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Email Tracking Section */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Email History:</span>
                            {booking.emailsSent && booking.emailsSent.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {booking.emailsSent.map((email, index) => {
                                  const getEmailBadgeStyle = (emailType: string) => {
                                    const styles = {
                                      'booking_confirmation': 'bg-green-50 text-green-700 border-green-200',
                                      'pre_arrival_information': 'bg-blue-50 text-blue-700 border-blue-200',
                                      'thank_you_post_stay': 'bg-purple-50 text-purple-700 border-purple-200',
                                      'contact_form': 'bg-orange-50 text-orange-700 border-orange-200',
                                      'test_email': 'bg-gray-50 text-gray-700 border-gray-200'
                                    };
                                    return styles[emailType as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
                                  };

                                  const getEmailDisplayName = (emailType: string) => {
                                    const names = {
                                      'booking_confirmation': 'Booking Confirmation',
                                      'pre_arrival_information': 'Pre-Arrival Info',
                                      'thank_you_post_stay': 'Thank You',
                                      'contact_form': 'Contact Form',
                                      'test_email': 'Test Email'
                                    };
                                    return names[emailType as keyof typeof names] || emailType.replace('_', ' ');
                                  };

                                  return (
                                    <Badge 
                                      key={index}
                                      variant="outline" 
                                      className={`text-xs ${getEmailBadgeStyle(email.emailType)}`}
                                      title={`Sent: ${new Date(email.timestamp).toLocaleString()}`}
                                    >
                                      {getEmailDisplayName(email.emailType)}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                No emails sent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No bookings found. Start by syncing your Airbnb calendar or wait for direct bookings.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


            </TabsContent>

            <TabsContent value="experiences" className="space-y-8">
              {/* Experience Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Experience Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{experienceBookings.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Bread Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {experienceBookings.filter(b => b.type === "bread").length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Yoga Retreats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {experienceBookings.filter(b => b.type === "yoga").length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sauna Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {experienceBookings.filter(b => b.type === "sauna").length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Experience Type Tabs */}
              <Tabs defaultValue="bread" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bread" className="flex items-center gap-2">
                    <span>🍞</span>
                    Bread Courses
                  </TabsTrigger>
                  <TabsTrigger value="yoga" className="flex items-center gap-2">
                    <span>🧘</span>
                    Yoga Retreats
                  </TabsTrigger>
                  <TabsTrigger value="sauna" className="flex items-center gap-2">
                    <span>🔥</span>
                    Sauna Sessions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bread" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>🍞</span>
                        Bread Making Course Bookings
                      </CardTitle>
                      <CardDescription>
                        Artisan bread making workshops with customer experience details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {(() => {
                          const breadBookings = experienceBookings.filter(b => b.type === "bread");
                          if (breadBookings.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No bread course bookings found.
                              </div>
                            );
                          }

                          const groupedByDate = breadBookings.reduce((groups, booking) => {
                            const date = formatDate(booking.checkIn);
                            if (!groups[date]) {
                              groups[date] = [];
                            }
                            groups[date].push(booking);
                            return groups;
                          }, {} as Record<string, typeof breadBookings>);

                          return Object.entries(groupedByDate)
                            .sort(([dateA], [dateB]) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const dateAObj = new Date(dateA.split('/').reverse().join('-'));
                              const dateBObj = new Date(dateB.split('/').reverse().join('-'));
                              
                              const aIsFuture = dateAObj >= today;
                              const bIsFuture = dateBObj >= today;
                              
                              // Future dates first (ascending), then past dates (descending)
                              if (aIsFuture && !bIsFuture) return -1;
                              if (!aIsFuture && bIsFuture) return 1;
                              if (aIsFuture && bIsFuture) return dateAObj.getTime() - dateBObj.getTime();
                              return dateBObj.getTime() - dateAObj.getTime();
                            })
                            .map(([date, bookings]) => {
                              const courseDate = new Date(date.split('/').reverse().join('-'));
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPastDate = courseDate < today;
                              
                              return (
                                <div key={date} className={`border rounded-lg p-4 ${isPastDate ? 'bg-gray-50/50 opacity-60' : 'bg-amber-50/30'}`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${isPastDate ? 'text-gray-500' : 'text-amber-800'}`}>
                                      <span>🍞</span>
                                      Bread Course - {date}
                                      {isPastDate && <span className="text-xs font-normal">(Past)</span>}
                                    </h3>
                                    <Badge variant="outline" className={isPastDate ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}>
                                      {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <div className="space-y-3">
                                    {bookings.map((booking) => (
                                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-white transition-colors">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold">{booking.customerName}</h4>
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${booking.source === "airbnb" ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-green-50 text-green-700 border-green-300"}`}
                                            >
                                              {booking.source === "airbnb" ? "Airbnb" : "Direct"}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                              <span className="font-medium">Email:</span> {booking.customerEmail}
                                            </div>
                                            <div>
                                              <span className="font-medium">Guests:</span> {booking.guests}
                                            </div>
                                            <div>
                                              <span className="font-medium">Price:</span> €{booking.totalPrice}
                                            </div>
                                          </div>
                                          
                                          {/* Email History */}
                                          <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-medium text-gray-700">Email History:</span>
                                            </div>
                                            {booking.emailsSent && booking.emailsSent.length > 0 ? (
                                              <div className="flex flex-wrap gap-1">
                                                {booking.emailsSent.map((email: any, index: number) => {
                                                  const getEmailBadgeStyle = (emailType: string) => {
                                                    const styles = {
                                                      'booking_confirmation': 'bg-blue-50 text-blue-700 border-blue-200',
                                                      'pre_arrival_information': 'bg-purple-50 text-purple-700 border-purple-200',
                                                      'thank_you_post_stay': 'bg-green-50 text-green-700 border-green-200',
                                                      'contact_form': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                                      'test_email': 'bg-gray-50 text-gray-700 border-gray-200'
                                                    };
                                                    return styles[emailType as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
                                                  };

                                                  const getEmailDisplayName = (emailType: string) => {
                                                    const names = {
                                                      'booking_confirmation': 'Booking Confirmation',
                                                      'pre_arrival_information': 'Pre-Arrival Info',
                                                      'thank_you_post_stay': 'Thank You',
                                                      'contact_form': 'Contact Form',
                                                      'test_email': 'Test Email'
                                                    };
                                                    return names[emailType as keyof typeof names] || emailType.replace('_', ' ');
                                                  };

                                                  return (
                                                    <Badge 
                                                      key={index}
                                                      variant="outline" 
                                                      className={`text-xs ${getEmailBadgeStyle(email.emailType)}`}
                                                      title={`Sent: ${formatDateTime(email.timestamp)}`}
                                                    >
                                                      {getEmailDisplayName(email.emailType)}
                                                    </Badge>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                                No emails sent
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>


                <TabsContent value="yoga" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>🧘</span>
                        Yoga Retreat Bookings
                      </CardTitle>
                      <CardDescription>
                        Wellness and mindfulness retreats in nature.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {(() => {
                          const yogaBookings = experienceBookings.filter(b => b.type === "yoga");
                          if (yogaBookings.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No yoga retreat bookings found.
                              </div>
                            );
                          }

                          const groupedByDate = yogaBookings.reduce((groups, booking) => {
                            const date = formatDate(booking.checkIn);
                            if (!groups[date]) {
                              groups[date] = [];
                            }
                            groups[date].push(booking);
                            return groups;
                          }, {} as Record<string, typeof yogaBookings>);

                          return Object.entries(groupedByDate)
                            .sort(([dateA], [dateB]) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const dateAObj = new Date(dateA.split('/').reverse().join('-'));
                              const dateBObj = new Date(dateB.split('/').reverse().join('-'));
                              
                              const aIsFuture = dateAObj >= today;
                              const bIsFuture = dateBObj >= today;
                              
                              // Future dates first (ascending), then past dates (descending)
                              if (aIsFuture && !bIsFuture) return -1;
                              if (!aIsFuture && bIsFuture) return 1;
                              if (aIsFuture && bIsFuture) return dateAObj.getTime() - dateBObj.getTime();
                              return dateBObj.getTime() - dateAObj.getTime();
                            })
                            .map(([date, bookings]) => {
                              const retreatDate = new Date(date.split('/').reverse().join('-'));
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPastDate = retreatDate < today;
                              
                              return (
                                <div key={date} className={`border rounded-lg p-4 ${isPastDate ? 'bg-gray-50/50 opacity-60' : 'bg-purple-50/30'}`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${isPastDate ? 'text-gray-500' : 'text-purple-800'}`}>
                                      <span>🧘</span>
                                      Yoga Retreat - {date}
                                      {isPastDate && <span className="text-xs font-normal">(Past)</span>}
                                    </h3>
                                    <Badge variant="outline" className={isPastDate ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-800'}>
                                      {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                <div className="space-y-3">
                                  {bookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-white transition-colors">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-semibold">{booking.customerName}</h4>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${booking.source === "airbnb" ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-green-50 text-green-700 border-green-300"}`}
                                          >
                                            {booking.source === "airbnb" ? "Airbnb" : "Direct"}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                          <div>
                                            <span className="font-medium">Email:</span> {booking.customerEmail}
                                          </div>
                                          <div>
                                            <span className="font-medium">Guests:</span> {booking.guests}
                                          </div>
                                          <div>
                                            <span className="font-medium">Price:</span> €{booking.totalPrice}
                                          </div>
                                        </div>
                                        
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-700">Email History:</span>
                                          </div>
                                          {booking.emailsSent && booking.emailsSent.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {booking.emailsSent.map((email: any, index: number) => (
                                                <Badge 
                                                  key={index}
                                                  variant="outline" 
                                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                                  title={`Sent: ${formatDateTime(email.timestamp)}`}
                                                >
                                                  {email.emailType.replace('_', ' ')}
                                                </Badge>
                                              ))}
                                            </div>
                                          ) : (
                                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                              No emails sent
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              );
                            });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sauna" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>🔥</span>
                        Sauna Session Bookings
                      </CardTitle>
                      <CardDescription>
                        Private sauna sessions and wellness experiences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {(() => {
                          const saunaBookings = experienceBookings.filter(b => b.type === "sauna");
                          if (saunaBookings.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No sauna session bookings found.
                              </div>
                            );
                          }

                          const groupedByDate = saunaBookings.reduce((groups, booking) => {
                            const date = formatDate(booking.checkIn);
                            if (!groups[date]) {
                              groups[date] = [];
                            }
                            groups[date].push(booking);
                            return groups;
                          }, {} as Record<string, typeof saunaBookings>);

                          return Object.entries(groupedByDate)
                            .sort(([dateA], [dateB]) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const dateAObj = new Date(dateA.split('/').reverse().join('-'));
                              const dateBObj = new Date(dateB.split('/').reverse().join('-'));
                              
                              const aIsFuture = dateAObj >= today;
                              const bIsFuture = dateBObj >= today;
                              
                              // Future dates first (ascending), then past dates (descending)
                              if (aIsFuture && !bIsFuture) return -1;
                              if (!aIsFuture && bIsFuture) return 1;
                              if (aIsFuture && bIsFuture) return dateAObj.getTime() - dateBObj.getTime();
                              return dateBObj.getTime() - dateAObj.getTime();
                            })
                            .map(([date, bookings]) => {
                              const sessionDate = new Date(date.split('/').reverse().join('-'));
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPastDate = sessionDate < today;
                              
                              return (
                                <div key={date} className={`border rounded-lg p-4 ${isPastDate ? 'bg-gray-50/50 opacity-60' : 'bg-red-50/30'}`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold flex items-center gap-2 ${isPastDate ? 'text-gray-500' : 'text-red-800'}`}>
                                      <span>🔥</span>
                                      Sauna Session - {date}
                                      {isPastDate && <span className="text-xs font-normal">(Past)</span>}
                                    </h3>
                                    <Badge variant="outline" className={isPastDate ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'}>
                                      {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <div className="space-y-3">
                                    {bookings.map((booking) => (
                                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-white transition-colors">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold">{booking.customerName}</h4>
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${booking.source === "airbnb" ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-green-50 text-green-700 border-green-300"}`}
                                            >
                                              {booking.source === "airbnb" ? "Airbnb" : "Direct"}
                                            </Badge>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                              <span className="font-medium">Email:</span> {booking.customerEmail}
                                            </div>
                                            <div>
                                              <span className="font-medium">Guests:</span> {booking.guests}
                                            </div>
                                            <div>
                                              <span className="font-medium">Price:</span> €{booking.totalPrice}
                                            </div>
                                          </div>
                                          
                                          {/* Email History */}
                                          <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-medium text-gray-700">Email History:</span>
                                            </div>
                                            {booking.emailsSent && booking.emailsSent.length > 0 ? (
                                              <div className="flex flex-wrap gap-1">
                                                {booking.emailsSent.map((email: any, index: number) => {
                                                  const getEmailBadgeStyle = (emailType: string) => {
                                                    const styles = {
                                                      'booking_confirmation': 'bg-blue-50 text-blue-700 border-blue-200',
                                                      'pre_arrival_information': 'bg-purple-50 text-purple-700 border-purple-200',
                                                      'thank_you_post_stay': 'bg-green-50 text-green-700 border-green-200',
                                                      'contact_form': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                                      'test_email': 'bg-gray-50 text-gray-700 border-gray-200'
                                                    };
                                                    return styles[emailType as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
                                                  };

                                                  const getEmailDisplayName = (emailType: string) => {
                                                    const names = {
                                                      'booking_confirmation': 'Booking Confirmation',
                                                      'pre_arrival_information': 'Pre-Arrival Info',
                                                      'thank_you_post_stay': 'Thank You',
                                                      'contact_form': 'Contact Form',
                                                      'test_email': 'Test Email'
                                                    };
                                                    return names[emailType as keyof typeof names] || emailType.replace('_', ' ');
                                                  };

                                                  return (
                                                    <Badge 
                                                      key={index}
                                                      variant="outline" 
                                                      className={`text-xs ${getEmailBadgeStyle(email.emailType)}`}
                                                      title={`Sent: ${formatDateTime(email.timestamp)}`}
                                                    >
                                                      {getEmailDisplayName(email.emailType)}
                                                    </Badge>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                                No emails sent
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="availability" className="space-y-8">
              <AvailabilityManager />
            </TabsContent>

            <TabsContent value="guest-stories" className="space-y-8">
              <GuestStoryApprovalManager />
            </TabsContent>

            <TabsContent value="mailing" className="space-y-8">
              <MailingListManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}