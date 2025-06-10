import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, CreditCard, Sun, Leaf, Mountain, WheatIcon, Flame, Gift } from "lucide-react";

export default function Experiences() {
  const experiences = [
    {
      id: "sauna",
      title: "Sauna Sessions",
      description: "Experience authentic sauna culture in our traditional wood-fired sauna. Relax, rejuvenate, and connect with nature in this timeless wellness practice.",
      price: "€70",
      image: "https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-8.jpg",
      duration: "1-2 Hours",
      icon: Clock,
      features: [
        { icon: Clock, text: "Wood-fired experience" },
        { icon: Leaf, text: "Natural setting" },
        { icon: Mountain, text: "Wellness focused" }
      ],
      bookingPath: "/sauna-booking"
    },
    {
      id: "yoga",
      title: "Monthly Yoga Mini-Retreats",
      description: "Immerse yourself in tranquil yoga sessions surrounded by the natural beauty of Lough Hyne. Combined with hyper-local, veggie-filled meals inspired by California meets West Cork cuisine.",
      price: "€80",
      image: "https://loughhynecottage.com/wp-content/uploads/2024/08/yoga-3-1.jpg",
      duration: "Full Day",
      icon: Users,
      features: [
        { icon: Sun, text: "Peaceful natural setting" },
        { icon: Leaf, text: "California-West Cork fusion meals" },
        { icon: Mountain, text: "All levels welcome" }
      ],
      bookingPath: "/yoga-booking"
    },
    {
      id: "bread",
      title: "Wood-Fired Bread Making Workshop",
      description: "Join us monthly as we fire up our traditional wood stove to create artisanal bread and pastries. Learn the ancient art of sourdough baking while connecting with our local community.",
      price: "€135",
      image: "https://loughhynecottage.com/wp-content/uploads/2024/08/bread-course-4-1.jpg",
      duration: "11 am - 5pm",
      icon: CreditCard,
      features: [
        { icon: WheatIcon, text: "Sourdough starter to take home" },
        { icon: Flame, text: "Wood-fired oven baking" },
        { icon: Gift, text: "Fresh breads to take home" }
      ],
      bookingPath: "/bread-booking"
    }
  ];

  const galleryImages = [
    {
      src: "https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-.jpg",
      alt: "Traditional wood-fired sauna exterior"
    },
    {
      src: "https://loughhynecottage.com/wp-content/uploads/2024/08/Sauna-Experience-1.jpg",
      alt: "Sauna interior with natural lighting"
    },
    {
      src: "https://loughhynecottage.com/wp-content/uploads/2024/08/yoga-3-1.jpg",
      alt: "Yoga session overlooking Lough Hyne"
    },
    {
      src: "https://loughhynecottage.com/wp-content/uploads/2024/08/bread-course-4-1.jpg",
      alt: "Artisan bread making process"
    }
  ];

  return (
    <section id="experiences" className="pt-16 pb-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-6">
            Food, Fun and a little magic through our restorative experiences
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover wellness, creativity, and connection through our carefully curated experiences designed to rejuvenate your mind, body, and spirit.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {experiences.map((experience) => {
            const IconComponent = experience.icon;
            return (
              <Card key={experience.id} className="experience-card overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-sage/10 hover:border-sage/30 rounded-2xl">
                <div className="relative h-64">
                  <img 
                    src={experience.image} 
                    alt={experience.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-terracotta text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {experience.price}
                  </div>
                </div>
                <CardContent className="p-8 bg-gradient-to-b from-white to-cream/30">
                  <h3 className="font-heading text-2xl font-bold text-forest mb-4">{experience.title}</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed text-base">
                    {experience.description}
                  </p>
                  <div className="flex items-center mb-5 text-sm text-gray-500 bg-sage/10 px-3 py-2 rounded-lg">
                    <IconComponent className="mr-2 h-4 w-4 text-sage" />
                    <span className="font-medium">{experience.duration}</span>
                  </div>
                  <div className="space-y-3 mb-7 text-sm">
                    {experience.features.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={index} className="flex items-center text-gray-700 bg-natural-white/80 px-3 py-2 rounded-lg">
                          <FeatureIcon className="w-4 h-4 mr-3 text-terracotta" />
                          <span className="font-medium">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Link href={experience.bookingPath}>
                    <Button className="w-full bg-sage text-white hover:bg-forest py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      {experience.id === "yoga" ? "Book Retreat" : experience.id === "bread" ? "Book Workshop" : "Book Session"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>


      </div>
    </section>
  );
}
