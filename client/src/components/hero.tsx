import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="https://loughhynecottage.com/wp-content/uploads/2024/12/header-loop-lough-hyne.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 hero-gradient" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-8 whitespace-nowrap text-white">
          The <em className="text-white">Lough</em> is calling you home
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => scrollToSection("#accommodations")}
            className="bg-terracotta text-white hover:bg-terracotta/90 rounded-full text-lg px-8 py-4 h-auto transform hover:scale-105 transition-all"
          >
            Book Your Stay
          </Button>
          <Button 
            onClick={() => scrollToSection("#experiences")}
            variant="outline"
            className="border-2 border-white bg-white text-black hover:bg-gray-100 hover:text-forest rounded-full text-lg px-8 py-4 h-auto transition-all"
          >
            Explore Experiences
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <ChevronDown className="h-8 w-8" />
      </div>
    </section>
  );
}
