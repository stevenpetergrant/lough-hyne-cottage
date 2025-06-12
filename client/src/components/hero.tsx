import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@assets/875e18f0-63ff-403a-96b2-00b46f716b15.jpg";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Vimeo Video Background - Lough Hyne specific footage */}
      <iframe 
        className="absolute inset-0 w-full h-full scale-150 -translate-y-8"
        src="https://player.vimeo.com/video/1029778794?app_id=122963&background=1&controls=0&autoplay=1&mute=1&loop=1"
        title="Lough Hyne Marine Nature Reserve"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{
          pointerEvents: 'none',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      />
      
      {/* Fallback background image for slow connections */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-0"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
        onError={() => {
          // Show fallback image if video fails
          const element = document.querySelector('.hero-fallback');
          if (element) element.classList.add('opacity-100');
        }}
      ></div>
      
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
