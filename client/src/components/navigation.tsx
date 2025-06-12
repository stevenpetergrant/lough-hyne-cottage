import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/our-story", label: "Our Story" },
    { href: "/events-experiences", label: "Experiences" },
    { href: "/blog", label: "West Cork Guide" },
    { href: "/vouchers", label: "Gift Vouchers" },
    { href: "/guest-stories", label: "Guest Stories" },
  ];

  return (
    <nav className="bg-natural-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img 
              src="https://loughhynecottage.com/wp-content/uploads/2024/08/Untitled-design-12.png" 
              alt="Lough Hyne Cottage" 
              className="h-6 sm:h-8 w-auto mr-2" 
            />
            <span className="font-heading font-bold text-sm sm:text-lg text-forest hidden sm:block">
              Lough Hyne Cottage
            </span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-forest font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
                  location === item.href ? 'text-forest font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex-shrink-0">
            <Link href="/booking">
              <Button className="bg-forest text-white hover:bg-forest/80 rounded-full text-xs sm:text-sm px-3 sm:px-4 py-2">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
