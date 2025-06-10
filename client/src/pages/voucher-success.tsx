import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Mail, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function VoucherSuccess() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    if (id) {
      setSessionId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Voucher Purchase Successful - Lough Hyne Cottage"
        description="Your gift voucher purchase was successful. Thank you for choosing Lough Hyne Cottage."
        keywords="voucher purchase, gift voucher, Lough Hyne Cottage"
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
              Purchase Successful!
            </h1>
            <p className="text-xl text-gray-600">
              Your gift voucher has been created and is on its way
            </p>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Gift className="h-6 w-6 mr-2" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800">Email Delivery</h3>
                  <p className="text-green-700 text-sm">
                    The recipient will receive a beautifully designed voucher email within the next few minutes. 
                    You'll also receive a purchase confirmation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800">12 Months Validity</h3>
                  <p className="text-green-700 text-sm">
                    The voucher is valid for 12 months from today and can be used for any experience 
                    at Lough Hyne Cottage.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800">Easy Redemption</h3>
                  <p className="text-green-700 text-sm">
                    The recipient can redeem their voucher by entering the voucher code during booking 
                    on our website.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 space-y-4">
            <p className="text-gray-600">
              Thank you for choosing Lough Hyne Cottage. We look forward to welcoming your gift recipient 
              to our beautiful eco-retreat in West Cork.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vouchers">
                <Button variant="outline" className="w-full sm:w-auto">
                  Purchase Another Voucher
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-forest hover:bg-forest/80 w-full sm:w-auto">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>

          {sessionId && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Order Reference: {sessionId.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}