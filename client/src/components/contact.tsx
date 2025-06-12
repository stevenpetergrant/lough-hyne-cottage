import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  experience: string;
  message: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    experience: "",
    message: ""
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for your message! We will respond within 2 hours.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        experience: "",
        message: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Lough Hyne Cottage",
      subtitle: "Skibbereen, Co Cork"
    },
    {
      icon: Phone,
      title: "+353 87 319 1119",
      subtitle: "Daily 8am - 8pm IST"
    },
    {
      icon: Mail,
      title: "info@loughhynecottage.com",
      subtitle: "We respond within 2 hours"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-forest text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-4xl font-bold mb-6 text-white">Plan Your Escape</h2>
            <p className="text-xl mb-8 text-gray-200">
              Ready to reconnect with nature and rejuvenate your spirit? Our team is here to help you plan the perfect sustainable retreat experience.
            </p>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="flex items-center">
                    <div className="organic-shape bg-sage bg-opacity-30 w-12 h-12 flex items-center justify-center mr-4">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{info.title}</h4>
                      <p className="text-white">{info.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Card className="text-gray-700">
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-bold text-forest mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium mb-2">First Name</Label>
                    <Input 
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="focus:ring-2 focus:ring-sage"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium mb-2">Last Name</Label>
                    <Input 
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="focus:ring-2 focus:ring-sage"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-2">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="focus:ring-2 focus:ring-sage"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience" className="text-sm font-medium mb-2">Interested Experience</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleChange("experience", value)}>
                    <SelectTrigger className="focus:ring-2 focus:ring-sage">
                      <SelectValue placeholder="Select an experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cabin">Eco Cabin Stay</SelectItem>
                      <SelectItem value="sauna">Sauna Experience</SelectItem>
                      <SelectItem value="yoga">Yoga Retreat</SelectItem>
                      <SelectItem value="bread">Bread Making Workshop</SelectItem>
                      <SelectItem value="all">All Experiences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium mb-2">Message</Label>
                  <Textarea 
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="focus:ring-2 focus:ring-sage"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-forest text-white hover:bg-forest/90 py-3 rounded-lg font-semibold"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
