import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Terms and Conditions - Lough Hyne Cottage"
        description="Terms and Conditions for booking and using services at Lough Hyne Cottage, West Cork, Ireland."
        keywords="terms and conditions, booking terms, Lough Hyne Cottage, legal terms"
        url="https://loughhynecottage.com/terms-conditions"
      />
      <Navigation />
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using our services
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <div className="bg-cream p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-0">
                <strong>Effective Date:</strong> 1st September 2024
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Introduction</h2>
              <p>
                Welcome to Lough Hyne Cottage. These Terms and Conditions govern your use of our website and the services we offer. By accessing our site, you agree to these terms. If you do not agree, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Definitions</h2>
              <p>
                <strong>"Service"</strong> refers to the hospitality services provided by Lough Hyne Cottage, including accommodation, dining, and events.
              </p>
              <p>
                <strong>"User"</strong> refers to anyone who accesses or uses our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Booking and Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reservations can be made through our website or via phone.</li>
                <li>All bookings require a valid payment method. Payment policies will be specified at the time of booking.</li>
                <li>Cancellation policies will be communicated at the time of booking and vary depending on the rate selected.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users must provide accurate and complete information when making bookings.</li>
                <li>Users are responsible for maintaining the confidentiality of their account information and for all activities under their account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Conduct</h2>
              <p>Users agree not to use the website for any unlawful or prohibited activities, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violating any applicable laws.</li>
                <li>Transmitting harmful or malicious content.</li>
                <li>Impersonating any person or entity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, and images, is the property of Lough Hyne Cottage and is protected by intellectual property laws. Users may not reproduce, distribute, or modify any content without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Lough Hyne Cottage shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Indemnification</h2>
              <p>
                You agree to indemnify and hold Lough Hyne Cottage harmless from any claims, losses, liabilities, damages, or expenses arising from your use of the website or violation of these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page, and your continued use of the website after such changes constitutes your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Governing Law</h2>
              <p>
                These Terms and Conditions are governed by the laws of Ireland. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the Irish courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Contact Information</h2>
              <p>For any questions regarding these Terms and Conditions, please contact us at:</p>
              <div className="bg-sage/10 p-6 rounded-lg mt-4">
                <p className="font-semibold text-forest mb-2">LOUGH HYNE COTTAGE</p>
                <p>SKIBBEREEN</p>
                <p>CORK</p>
                <p className="mt-2">
                  <a href="mailto:info@loughhynecottage.com" className="text-forest hover:text-forest/80">
                    INFO@LOUGHHYNECOTTAGE.COM
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}