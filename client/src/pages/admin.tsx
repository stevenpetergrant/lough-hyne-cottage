import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, RefreshCw, ExternalLink, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import AvailabilityManager from "@/components/availability-manager";

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
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [syncingAirbnb, setSyncingAirbnb] = useState(false);

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Sync Airbnb calendar mutation
  const syncAirbnbMutation = useMutation({
    mutationFn: async () => {
      setSyncingAirbnb(true);
      const response = await apiRequest("POST", "/api/sync-airbnb");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Airbnb Sync Complete",
        description: "Calendar has been synchronized successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setSyncingAirbnb(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Airbnb calendar",
        variant: "destructive",
      });
      setSyncingAirbnb(false);
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
  const airbnbBookings = bookings.filter(b => b.source === "airbnb");
  const directBookings = bookings.filter(b => b.source === "direct");

  if (isLoading) {
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
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-green-800">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">Manage bookings, availability, and Airbnb calendar sync</p>
          </div>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">Bookings & Sync</TabsTrigger>
              <TabsTrigger value="availability">
                <Settings className="w-4 h-4 mr-2" />
                Availability Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cabin Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cabinBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Direct Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{directBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Airbnb Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{airbnbBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Airbnb Integration Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Airbnb Calendar Integration
            </CardTitle>
            <CardDescription>
              Sync your Airbnb calendar and export bookings for import to Airbnb
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => syncAirbnbMutation.mutate()}
                disabled={syncingAirbnb}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncingAirbnb ? 'animate-spin' : ''}`} />
                {syncingAirbnb ? 'Syncing...' : 'Sync Airbnb Calendar'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={downloadCalendar}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Calendar for Airbnb
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Setup Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Set your Airbnb calendar URL in environment variable AIRBNB_CALENDAR_URL</li>
                <li>Use "Sync Airbnb Calendar" to import Airbnb bookings</li>
                <li>Use "Download Calendar" to get .ics file for importing to Airbnb</li>
                <li>In Airbnb, go to Calendar → Import Calendar and upload the .ics file</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{booking.customerName}</span>
                      <Badge variant={booking.source === 'airbnb' ? 'secondary' : 'default'}>
                        {booking.source}
                      </Badge>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' : 
                        booking.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} • {booking.guests} guests
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.checkIn).toLocaleDateString()} 
                      {booking.checkOut && ` - ${new Date(booking.checkOut).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">€{booking.totalPrice}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
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

            <TabsContent value="availability" className="space-y-8">
              <AvailabilityManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}