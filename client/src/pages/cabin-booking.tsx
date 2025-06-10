import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BookingForm from "@/components/booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { Experience } from "@shared/schema";

export default function CabinBooking() {
  const { data: experience, isLoading, error } = useQuery<Experience>({
    queryKey: ["/api/experiences/cabin"],
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
              <p className="text-gray-600 mb-4">The eco cabin experience could not be loaded.</p>
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

  const features = [
    "Solar-powered with backup systems",
    "Private deck with nature views", 
    "Organic linens and amenities",
    "Kitchenette with local ingredients",
    "Rainwater harvesting system",
    "Locally sourced building materials"
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
                src="https://images.unsplash.com/photo-1518599807935-37015b9cefcb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Eco cabin exterior in forest" 
                className="rounded-2xl shadow-lg col-span-2 object-cover h-64" 
              />
              <img 
                src="https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Sustainable eco cabin with solar panels" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                alt="Eco cabin with mountain lake view" 
                className="rounded-2xl shadow-lg object-cover h-32" 
              />
            </div>

            <h3 className="font-heading text-2xl font-bold text-forest mb-4">Cabin Features</h3>
            <div className="grid grid-cols-1 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="text-sage mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
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
