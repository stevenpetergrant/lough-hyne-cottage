import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BookingForm from "@/components/booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Wheat, Flame, Gift, Clock, Users, ChefHat } from "lucide-react";
import { Link } from "wouter";
import type { Experience } from "@shared/schema";

export default function BreadBooking() {
  const { data: experience, isLoading, error } = useQuery<Experience>({
    queryKey: ["/api/experiences/bread"],
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
              <p className="text-gray-600 mb-4">The bread making workshop could not be loaded.</p>
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
    { time: "9:00 AM - 9:30 AM", activity: "Welcome & Introduction to Artisan Bread Making", icon: Users },
    { time: "9:30 AM - 11:00 AM", activity: "Creating Your Sourdough Starter", icon: Wheat },
    { time: "11:00 AM - 12:30 PM", activity: "Mixing and Kneading Traditional Doughs", icon: ChefHat },
    { time: "12:30 PM - 1:30 PM", activity: "Farm-to-Table Lunch Break", icon: Gift },
    { time: "1:30 PM - 3:00 PM", activity: "Shaping and Scoring Techniques", icon: ChefHat },
    { time: "3:00 PM - 4:30 PM", activity: "Wood-Fired Oven Baking Experience", icon: Flame },
    { time: "4:30 PM - 5:00 PM", activity: "Tasting & Take-Home Preparation", icon: Gift }
  ];

  const techniques = [
    "Traditional sourdough starter cultivation",
    "Hand-kneading and dough development",
    "Artisan shaping and scoring methods",
    "Wood-fired oven temperature management",
    "Seasonal ingredient incorporation",
    "Bread storage and preservation"
  ];

  const takeHome = [
    "2-3 fresh baked artisan loaves",
    "Your own sourdough starter culture",
    "Recipe collection with seasonal variations",
    "Bread making equipment starter kit",
    "Digital access to video tutorials",
    "Certificate of completion"
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
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Artisan bread making workshop" 
                className="rounded-2xl shadow-lg col-span-2 object-cover h-64" 
              />
              <img 
                src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Fresh artisan bread loaves with herbs" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
              <img 
                src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Wood-fired bread oven" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
            </div>

            <h3 className="font-heading text-2xl font-bold text-forest mb-4">Workshop Schedule</h3>
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

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-heading text-xl font-bold text-forest mb-3">What You'll Learn</h3>
                <div className="space-y-2">
                  {techniques.map((technique, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-sage mr-2">•</span>
                      <span className="text-gray-700 text-sm">{technique}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-forest mb-3">Take Home Package</h3>
                <div className="space-y-2">
                  {takeHome.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-sage mr-2">•</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <BookingForm experience={experience} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
