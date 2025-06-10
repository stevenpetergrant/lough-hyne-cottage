import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import ResortOverview from "@/components/resort-overview";
import Accommodations from "@/components/accommodations";
import UnplugSection from "@/components/unplug-section";
import Experiences from "@/components/experiences";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

export default function Home() {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": "Lough Hyne Cottage",
    "description": "Eco luxury accommodation at Ireland's first marine nature reserve in West Cork",
    "url": "https://loughhynecottage.com",
    "image": "https://loughhynecottage.com/wp-content/uploads/2024/08/sauna-experience-.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Skibbereen",
      "addressRegion": "Cork",
      "addressCountry": "IE"
    },
    "touristType": ["EcoTourist", "WellnessTourist", "CulturalTourist"],
    "includesAttraction": [
      {
        "@type": "TouristAttraction",
        "name": "Lough Hyne Marine Nature Reserve",
        "description": "Ireland's first marine nature reserve"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Lough Hyne Cottage - Eco Luxury Accommodation in West Cork, Ireland"
        description="Experience sustainable luxury at Lough Hyne Cottage, Ireland's first marine nature reserve. Book cabin stays, sauna sessions, yoga retreats and bread making workshops in beautiful West Cork."
        keywords="West Cork accommodation, eco cottage Ireland, Lough Hyne, sustainable tourism, cabin rental Cork, yoga retreat Ireland, sauna West Cork, bread making workshop, marine nature reserve"
        structuredData={homeStructuredData}
      />
      <Navigation />
      <Hero />
      <ResortOverview />
      <UnplugSection />
      <Accommodations />
      <Experiences />
      <Contact />
      <Footer />
    </div>
  );
}
