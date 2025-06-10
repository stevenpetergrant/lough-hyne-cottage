import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
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
    <section className="pt-16 pb-20 bg-natural-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </section>
  );
}
