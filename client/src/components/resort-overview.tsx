import { Sprout, Bath, Heart } from "lucide-react";

export default function ResortOverview() {
  const features = [
    {
      icon: Sprout,
      title: "100% Sustainable",
      description: "Solar-powered facilities and zero-waste operations"
    },
    {
      icon: Bath,
      title: "Wellness Focused",
      description: "Holistic experiences for mind, body, and spirit"
    },
    {
      icon: Heart,
      title: "Locally Sourced",
      description: "Supporting local artisans and organic farmers"
    }
  ];

  return (
    <section className="pt-20 pb-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-16">
          {/* Image on left - smaller and not stretched */}
          <div className="flex-shrink-0">
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2025/03/875e18f0-63ff-403a-96b2-00b46f716b15.jpg"
              alt="Peaceful countryside view at Lough Hyne Cottage"
              className="w-80 h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
          
          {/* Text content on right */}
          <div className="flex-1">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-forest mb-6">
              Unplug. Unwind. Uncover Lough Hyne.
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Perched on the edge of Ireland's only marine nature reserve, Lough Hyne Cottage is a retreat for those who crave the extraordinary.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Here, morning swims replace alarms, starlit soaks outshine screen time and the air is thick with the scent of saltwater and sourdough. Whether you're diving into adventure or sinking into stillness, welcome to a retreat that feels like it was made just for you.
            </p>
          </div>
        </div>
        

      </div>
    </section>
  );
}
