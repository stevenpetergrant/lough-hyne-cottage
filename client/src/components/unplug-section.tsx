import { Card, CardContent } from "@/components/ui/card";

export default function UnplugSection() {
  const steps = [
    {
      title: "Reset",
      description: "Nature is the ultimate healer for body and mind",
      icon: "https://loughhynecottage.com/wp-content/uploads/2024/09/1.png"
    },
    {
      title: "Relax", 
      description: "In Nature, we find clarity and perspective",
      icon: "https://loughhynecottage.com/wp-content/uploads/2024/09/2.png"
    },
    {
      title: "Receive",
      description: "Nature sparks creativity and inspiration", 
      icon: "https://loughhynecottage.com/wp-content/uploads/2024/09/4.png"
    },
    {
      title: "Realise",
      description: "Nature is a gift for all to embrace and enjoy",
      icon: "https://loughhynecottage.com/wp-content/uploads/2024/09/3.png"
    }
  ];

  return (
    <section className="pt-8 pb-10 bg-natural-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <Card key={index} className="text-center border-none shadow-md bg-cream">
              <CardContent className="p-4">
                <div className="mb-3">
                  {step.icon.startsWith('http') ? (
                    <img 
                      src={step.icon} 
                      alt={step.title} 
                      className="w-10 h-10 mx-auto object-contain"
                    />
                  ) : (
                    <div className="text-2xl">{step.icon}</div>
                  )}
                </div>
                <h3 className="font-heading text-lg font-bold text-forest mb-2">{step.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}