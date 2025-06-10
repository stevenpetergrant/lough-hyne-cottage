import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Plus, Minus, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Vouchers() {
  const [voucherAmount, setVoucherAmount] = useState(50);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'canceled'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true') {
      setPaymentStatus('success');
      toast({
        title: "Payment Successful!",
        description: "Your gift voucher has been purchased and will be sent via email.",
      });
    } else if (canceled === 'true') {
      setPaymentStatus('canceled');
      toast({
        title: "Payment Canceled",
        description: "Your voucher purchase was canceled. You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const createPaymentMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      const response = await apiRequest("POST", "/api/create-voucher-payment", voucherData);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: "Failed to process voucher payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const increaseAmount = () => {
    setVoucherAmount(prev => prev + 10);
  };

  const decreaseAmount = () => {
    setVoucherAmount(prev => Math.max(50, prev - 10));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 50;
    setVoucherAmount(Math.max(50, Math.round(value / 10) * 10));
  };

  const handlePurchase = () => {
    if (!recipientName || !recipientEmail || !purchaserName || !purchaserEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(purchaserEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter valid email addresses.",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: voucherAmount,
      recipientName,
      recipientEmail,
      purchaserName,
      purchaserEmail,
      personalMessage,
    });
  };

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Gift Vouchers - Lough Hyne Cottage"
        description="Purchase gift vouchers for Lough Hyne Cottage experiences. Perfect for cabin stays, sauna sessions, yoga retreats, and bread making workshops in West Cork."
        keywords="gift vouchers, Lough Hyne Cottage, West Cork gifts, eco retreat vouchers, cabin stay gifts"
        url="https://loughhynecottage.com/vouchers"
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Gift className="h-16 w-16 text-forest mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
              Gift Vouchers
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Give the gift of unforgettable experiences at Lough Hyne Cottage. 
              Perfect for cabin stays, wellness experiences, and culinary adventures in beautiful West Cork.
            </p>
          </div>

          {paymentStatus === 'success' && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Payment Successful!</strong> Your gift voucher has been purchased and confirmation emails are being sent to both you and the recipient.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'canceled' && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Payment Canceled.</strong> Your voucher purchase was not completed. You can try again below.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">Voucher Details</CardTitle>
                <CardDescription>
                  Choose your voucher amount and personalize your gift
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-base font-medium text-gray-700">
                    Voucher Amount (€)
                  </Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decreaseAmount}
                      disabled={voucherAmount <= 50}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="amount"
                      type="number"
                      value={voucherAmount}
                      onChange={handleAmountChange}
                      min="50"
                      step="10"
                      className="text-center text-xl font-bold w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={increaseAmount}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum €50, increments of €10
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Recipient Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="recipientName">Recipient Name *</Label>
                      <Input
                        id="recipientName"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Enter recipient's full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientEmail">Recipient Email *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="Enter recipient's email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Your Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="purchaserName">Your Name *</Label>
                      <Input
                        id="purchaserName"
                        value={purchaserName}
                        onChange={(e) => setPurchaserName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaserEmail">Your Email *</Label>
                      <Input
                        id="purchaserEmail"
                        type="email"
                        value={purchaserEmail}
                        onChange={(e) => setPurchaserEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal message to your gift..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Digital voucher delivered via email
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Valid for all experiences: cabin stays, sauna sessions, yoga retreats, bread making
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      12 months validity from purchase date
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Transferable to family and friends
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Can be used towards partial payments
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Voucher Amount</span>
                      <span className="font-semibold">€{voucherAmount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>€{voucherAmount}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handlePurchase}
                    disabled={createPaymentMutation.isPending}
                    className="w-full mt-6 bg-forest hover:bg-forest/80 text-white py-3"
                    size="lg"
                  >
                    {createPaymentMutation.isPending ? "Processing..." : "Purchase Voucher"}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}