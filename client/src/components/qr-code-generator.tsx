import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QrCodeGeneratorProps {
  bookingData?: {
    id: number;
    customerName: string;
    checkIn: string;
    checkOut?: string;
  };
}

export default function QrCodeGenerator({ bookingData }: QrCodeGeneratorProps) {
  const [guestName, setGuestName] = useState(bookingData?.customerName || "");
  const [checkInDate, setCheckInDate] = useState(bookingData?.checkIn || "");
  const [checkOutDate, setCheckOutDate] = useState(bookingData?.checkOut || "");
  const [generatedQr, setGeneratedQr] = useState<{ code: string; url: string } | null>(null);
  const { toast } = useToast();

  const generateQrMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/generate-qr", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQr(data);
      toast({
        title: "QR Code Generated",
        description: "Guest experience QR code has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!guestName || !checkInDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in guest name and check-in date.",
        variant: "destructive",
      });
      return;
    }

    generateQrMutation.mutate({
      bookingId: bookingData?.id || Date.now(),
      guestName,
      checkInDate,
      checkOutDate: checkOutDate || null,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-6 w-6 text-forest" />
          <span>Generate Guest Experience QR Code</span>
        </CardTitle>
        <CardDescription>
          Create a QR code for guests to share their experience photos and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="guestName">Guest Name *</Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest's full name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInDate">Check-in Date *</Label>
              <Input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOutDate">Check-out Date (Optional)</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateQrMutation.isPending}
          className="w-full bg-forest hover:bg-forest/80"
        >
          {generateQrMutation.isPending ? "Generating..." : "Generate QR Code"}
        </Button>

        {generatedQr && (
          <Alert className="border-green-200 bg-green-50">
            <QrCode className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong className="text-green-800">QR Code Generated Successfully!</strong>
                  <p className="text-green-700 text-sm mt-1">
                    Share this QR code or URL with your guest to let them upload photos and share their experience.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-green-800 font-semibold">Guest Code:</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono text-sm">
                        {generatedQr.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedQr.code)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-green-800 font-semibold">Direct URL:</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono text-xs break-all">
                        {generatedQr.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedQr.url)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(generatedQr.url, '_blank')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-100 p-3 rounded mt-3">
                  <p className="text-green-800 text-sm">
                    <strong>How to use:</strong>
                  </p>
                  <ul className="text-green-700 text-sm mt-1 space-y-1">
                    <li>• Print the QR code and place it in the cottage</li>
                    <li>• Include the guest code in welcome materials</li>
                    <li>• Send the direct URL via email or text message</li>
                    <li>• QR code remains active for 30 days</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}