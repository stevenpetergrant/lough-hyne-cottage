import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, User, MapPin, Star } from "lucide-react";
import { format } from "date-fns";

interface GuestExperience {
  id: number;
  guestName: string;
  experienceTitle: string;
  experienceDescription: string;
  recommendation?: string;
  stayDate: string;
  photos: string[];
}

export default function GuestStories() {
  const { data: experiences = [], isLoading } = useQuery<GuestExperience[]>({
    queryKey: ["/api/guest-experiences/public"],
  });

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Guest Stories - Lough Hyne Cottage"
        description="Read authentic stories and experiences from our guests who have stayed at Lough Hyne Cottage, Ireland's unique marine nature reserve retreat."
        keywords="guest reviews, testimonials, Lough Hyne Cottage experiences, West Cork stories"
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Heart className="h-10 w-10 text-sage" />
              <h1 className="text-4xl md:text-6xl font-bold text-forest">
                Guest Stories
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the magic of Lough Hyne through the eyes of our guests. 
              Real stories, authentic experiences, and unforgettable memories from Ireland's 
              first marine nature reserve.
            </p>
          </div>

          {/* Stories Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                Stories Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Our guests are creating beautiful memories every day. 
                Check back soon to read their inspiring stories about their stay at Lough Hyne Cottage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((experience: GuestExperience) => (
                <Card key={experience.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-sage/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sage/10 text-sage">
                        <User className="h-3 w-3 mr-1" />
                        {experience.guestName}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(experience.stayDate), 'MMM yyyy')}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-forest group-hover:text-sage transition-colors">
                      {experience.experienceTitle}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Photos */}
                    {experience.photos && experience.photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {experience.photos.slice(0, 4).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo.startsWith('http') ? photo : `/uploads/${photo}`}
                            alt={`Guest photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Experience Description */}
                    <div>
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
                        {experience.experienceDescription}
                      </p>
                    </div>
                    
                    {/* Recommendation */}
                    {experience.recommendation && (
                      <div className="bg-sage p-4 rounded-lg border-l-4 border-sage">
                        <div className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-white mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white mb-1">Guest Recommendation</p>
                            <p className="text-sm text-white italic">
                              "{experience.recommendation}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-20 text-center bg-gradient-to-r from-sage/10 to-forest/10 rounded-2xl p-12">
            <MapPin className="h-12 w-12 text-forest mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-forest mb-4">
              Create Your Own Story
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the community of guests who have discovered the magic of Lough Hyne. 
              Book your stay and become part of our story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-forest hover:bg-forest/80 transition-colors"
              >
                Book Your Stay
              </a>
              <a
                href="/events-experiences"
                className="inline-flex items-center justify-center px-8 py-3 border border-forest text-base font-medium rounded-full text-forest bg-transparent hover:bg-forest hover:text-white transition-colors"
              >
                Explore Experiences
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}