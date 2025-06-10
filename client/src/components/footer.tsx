import { Leaf } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  const footerSections = [
    {
      title: "Experiences",
      links: [
        { name: "Cosy Cabin Stay", href: "/cabin-booking" },
        { name: "Sauna Sessions", href: "/sauna-booking" },
        { name: "Yoga Retreats", href: "/yoga-booking" },
        { name: "Bread Making", href: "/bread-booking" },
        { name: "Gift Vouchers", href: "/vouchers" }
      ]
    },
    {
      title: "About",
      links: [
        { name: "Our Story", href: "#" },
        { name: "Guest Stories", href: "/guest-stories" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "#" },
        { name: "Cancellation", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="https://loughhynecottage.com/wp-content/uploads/2024/08/Untitled-design-12.png" 
                alt="Lough Hyne Cottage" 
                className="h-8 w-auto mr-2 brightness-0 invert" 
              />
              <span className="font-heading font-bold text-xl">Lough Hyne Cottage</span>
            </div>
            <p className="text-gray-400 mb-4">
              Sustainable luxury retreats in harmony with nature.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/loughhynecottage/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sage transition-colors">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-heading font-semibold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="hover:text-sage transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Lough Hyne Cottage. All rights reserved. | <a href="/privacy-policy" className="hover:text-sage transition-colors">Privacy Policy</a> | <a href="/terms-conditions" className="hover:text-sage transition-colors">Terms & Conditions</a> | <a href="/admin" className="hover:text-sage transition-colors">Admin</a></p>
        </div>
      </div>
    </footer>
  );
}
