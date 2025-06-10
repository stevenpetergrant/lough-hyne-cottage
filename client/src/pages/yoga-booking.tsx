import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BookingForm from "@/components/booking-form";
import YogaMailingList from "@/components/yoga-mailing-list";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sun, Leaf, Mountain, Users, Heart, Brain } from "lucide-react";
import { Link } from "wouter";
import type { Experience } from "@shared/schema";

export default function YogaBooking() {
  const { data: experience, isLoading, error } = useQuery<Experience>({
    queryKey: ["/api/experiences/yoga"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-natural-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-natural-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Experience Not Found</h1>
              <p className="text-gray-600 mb-4">The yoga retreat experience could not be loaded.</p>
              <Link href="/">
                <button className="text-forest hover:underline">← Return to Home</button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const schedule = [
    { time: "7:00 AM - 8:30 AM", activity: "Sunrise Meditation & Gentle Flow", icon: Sun },
    { time: "9:00 AM - 10:00 AM", activity: "Organic Breakfast & Connection Circle", icon: Leaf },
    { time: "10:30 AM - 12:00 PM", activity: "Vinyasa Flow & Breathwork", icon: Heart },
    { time: "12:00 PM - 1:30 PM", activity: "Mindful Lunch & Rest", icon: Leaf },
    { time: "2:00 PM - 3:30 PM", activity: "Nature Walking Meditation", icon: Mountain },
    { time: "4:00 PM - 5:30 PM", activity: "Restorative Yoga & Sound Bath", icon: Brain },
    { time: "6:00 PM - 7:00 PM", activity: "Closing Circle & Tea Ceremony", icon: Heart }
  ];

  const benefits = [
    "Deep stress relief and mental clarity",
    "Improved flexibility and strength",
    "Enhanced mind-body connection",
    "Breathwork for anxiety management",
    "Connection with nature and community",
    "Sustainable wellness practices"
  ];

  return (
    <div className="min-h-screen bg-natural-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center text-forest hover:text-forest/80 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h1 className="font-heading text-4xl font-bold text-forest mb-6">
              {experience.name}
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {experience.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Outdoor yoga retreat at sunrise" 
                className="rounded-2xl shadow-lg col-span-2 object-cover h-64" 
              />
              <img 
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Group yoga session in nature" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
              <img 
                src="https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Meditative yoga in forest setting" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
            </div>

            <h3 className="font-heading text-2xl font-bold text-forest mb-4">Daily Schedule</h3>
            <div className="space-y-3 mb-8">
              {schedule.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-start">
                    <IconComponent className="text-terracotta mr-3 h-5 w-5 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-forest text-sm">{item.time}</div>
                      <div className="text-gray-700 text-sm">{item.activity}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="font-heading text-2xl font-bold text-forest mb-4">Benefits</h3>
            <div className="grid grid-cols-1 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-sage mr-2">•</span>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <BookingForm experience={experience} />
            
            {/* Mailing List Signup */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-forest mb-2">Stay Updated on Future Retreats</h3>
                <p className="text-gray-600">
                  Can't make this date? Join our mailing list to be notified when new yoga retreat dates become available.
                </p>
              </div>
              <YogaMailingList />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
