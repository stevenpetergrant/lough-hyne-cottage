import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, TreePine, Star } from "lucide-react";

export default function Accommodations() {
  const features = [
    "Solar-powered with backup systems",
    "Private deck with nature views",
    "Organic linens and amenities",
    "Kitchenette with local ingredients"
  ];

  const testimonials = [
    {
      name: "Joseph",
      role: "June 2024",
      initials: "J",
      photo: "https://loughhynecottage.com/wp-content/uploads/2024/09/4d18acd7-7cd2-449a-9f11-a608b5e8ea7e.avif",
      text: "We had a really relaxing stay at Lough Hyne Cottage. The accommodation is set is a wonderful location overlooking the lake and is decorated very tastefully. Steven is a top class host and a lovely fella. We will be back!"
    },
    {
      name: "Anna", 
      role: "June 2024",
      initials: "A",
      photo: "https://loughhynecottage.com/wp-content/uploads/2024/09/4a24c08e-de08-4ba1-bc41-9ba7c651f6ce-150x150.avif",
      text: "We had such a wonderful stay at the Lough Hyne Cottage! It was the most beautiful, tranquil oasis. I don't think it matters what the weather's like, but we were blessed with sun, each window delivers luscious green views. Absolutely perfect getaway. Great recommendations from Steven & Claire, super friendly and helpful!"
    },
    {
      name: "Kerstin",
      role: "May 2024", 
      initials: "K",
      photo: "https://loughhynecottage.com/wp-content/uploads/2024/09/62d1d0db-4a6d-40da-951f-59749000cb2d-150x150.avif",
      text: "Steven and Claire are great hosts, very friendly and helpful. They gave us great tips for exploring the area. And we had the best brownies we've ever had! So delicious. Not to mention the eggs right out of the cage! Very nice and peaceful place. And I loved the view into the trees waking up. Highly recommended!"
    },
    {
      name: "Thia",
      role: "July 2024",
      initials: "T",
      photo: "https://loughhynecottage.com/wp-content/uploads/2024/09/409c9978-7053-40b6-b960-60b61717f4a7-150x150.avif",
      text: "We stayed three nights in the Lough Hyne Cottage and only wish we could have stayed longer! The space was beautiful and all details thoughtful — the eco-friendly design and amenities only adding to the peaceful, relaxing experience. We also did a seaweed bath on-site that exceeded all expectations."
    }
  ];

  const renderStars = () => (
    <div className="flex text-terracotta mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );

  return (
    <section id="accommodations" className="pt-20 pb-4 bg-natural-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-forest mb-2">
              Come stay in our cosy cabin
            </h2>
            <p className="text-xl text-terracotta font-medium mb-6">
              unplug from the everyday
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/564ffca7-24e6-4a46-b1c3-01594660fee4.avif" 
              alt="Lough Hyne Cottage with stunning lake views and natural surroundings" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/47f2fc56-77da-4be3-ac46-28261dc0e195-1.avif" 
              alt="Cozy interior of Lough Hyne Cottage with rustic charm" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/a9b87a9f-a157-4e44-81b2-4ad272b82ff6.avif" 
              alt="Lough Hyne Cottage exterior view" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/ce5ac8e3-23d5-4aa9-9fcf-e0e13a896f0a.avif" 
              alt="Lough Hyne Cottage accommodation details" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/3e6384b4-52b2-4806-a231-cfeac7f37ecd.avif" 
              alt="Lough Hyne Cottage natural setting and surroundings" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/7a9c92b2-d126-400f-80d1-e94fefe359df.avif" 
              alt="Lough Hyne Cottage exterior and landscape" 
              className="w-full h-64 md:h-72 object-cover rounded-xl shadow-lg" 
            />
          </div>
          
          <div className="text-center">
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
              At Lough Hyne Cottage, we invite you to immerse yourself in the rhythm of nature's embrace. Awaken to the melody of birdsong, inhale the fresh West Cork air and enjoy a wood-fired soak beneath a sky full of stars. Here, there's no rush, just moments to savour.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Be as active or as lazy as you like. Ensconce yourself fully in the comforts of the cottage or explore the native Irish woodland of Knockomagh and the Lough's stunning shores.
            </p>
            
            <Button 
              asChild 
              className="bg-terracotta hover:bg-terracotta/90 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
            >
              <Link href="/booking">Book Your Stay</Link>
            </Button>
          </div>
        </div>

        {/* Cabin Guest Reviews Section */}
        <div className="pt-16 pb-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-forest mb-6">Cabin Guest Reviews</h2>
            <p className="text-xl text-gray-700">Hear from those who've found renewal at Lough Hyne Cottage</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-8">
                  {renderStars()}
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src={testimonial.photo} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-forest">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
