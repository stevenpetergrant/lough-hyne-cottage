import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Privacy Policy - Lough Hyne Cottage"
        description="Privacy Policy for Lough Hyne Cottage, outlining how we collect, use, and protect your personal information."
        keywords="privacy policy, data protection, GDPR, Lough Hyne Cottage, personal information"
        url="https://loughhynecottage.com/privacy-policy"
      />
      <Navigation />
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Your privacy is important to us
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
                Welcome to Lough Hyne Cottage. We are committed to protecting your privacy and ensuring that your personal information is handled responsibly. This Privacy Policy explains how we collect, use, and protect your information when you visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, payment details, and any other information you provide when making a reservation or contacting us.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, pages visited, and time spent on the site.</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your experience on our website. You can control cookie settings through your browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process reservations and payments.</li>
                <li>To communicate with you regarding your bookings or inquiries.</li>
                <li>To improve our services and website functionality.</li>
                <li>To send promotional materials, if you have opted in to receive them.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Legal Basis for Processing</h2>
              <p>We process your personal data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your consent.</li>
                <li>The necessity of processing for the performance of a contract.</li>
                <li>Compliance with legal obligations.</li>
                <li>Our legitimate interests, provided they do not override your rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Data Sharing and Disclosure</h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist us in operating our website and conducting our business.</li>
                <li>Legal authorities if required by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Your Rights</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to access your information.</li>
                <li>Right to request correction of inaccurate data.</li>
                <li>Right to request deletion of your data.</li>
                <li>Right to object to processing.</li>
                <li>Right to data portability.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website. Please review this policy periodically for any updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-forest mb-4">Contact Us</h2>
              <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
              <div className="bg-sage/10 p-6 rounded-lg mt-4">
                <p className="font-semibold text-forest mb-2">LOUGH HYNE COTTAGE</p>
                <p>SKIBBEREEN</p>
                <p>CO CORK</p>
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