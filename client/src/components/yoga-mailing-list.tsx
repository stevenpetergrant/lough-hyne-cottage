import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionData {
  email: string;
  firstName: string;
  lastName: string;
  experienceType: string;
}

export default function YogaMailingList() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionData) => {
      const response = await apiRequest("POST", "/api/mailing-list/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "Successfully Subscribed!",
        description: "You'll receive notifications when new yoga retreat dates are available.",
      });
      setFormData({ email: "", firstName: "", lastName: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Unable to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate({
      ...formData,
      experienceType: "yoga"
    });
  };

  if (isSubscribed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">You're All Set!</h3>
            <p className="text-gray-600">
              You'll be the first to know when new yoga retreat dates become available at Lough Hyne Cottage.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Check your email for a confirmation message and add us to your contacts to ensure you don't miss any updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          Stay Notified
        </CardTitle>
        <CardDescription>
          Get email updates when new yoga retreat dates are announced at our lakeside sanctuary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">What You'll Receive</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Early notifications of new retreat dates</li>
                  <li>• Direct booking links for quick reservation</li>
                  <li>• Special announcements and retreat updates</li>
                  <li>• Unsubscribe anytime with one click</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? "Subscribing..." : "Subscribe to Updates"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. Your email will only be used for yoga retreat notifications.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}